import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PushPayload, PushSendResult } from './push.types';

/**
 * Firebase Cloud Messaging via firebase-admin.
 * Boots in no-op mode when credentials are absent so local/dev still runs.
 */
@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private ready = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    if (admin.apps.length > 0) {
      this.ready = true;
      this.logger.log('Firebase Admin already initialized.');
      return;
    }

    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID')?.trim();
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL')?.trim();
    const privateKeyRaw = this.config.get<string>('FIREBASE_PRIVATE_KEY');
    const credentialsPath = this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS')?.trim();

    try {
      if (projectId && clientEmail && privateKeyRaw) {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.ready = true;
        this.logger.log(`Firebase Admin initialized for project ${projectId}.`);
        return;
      }

      if (credentialsPath) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        this.ready = true;
        this.logger.log('Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS.');
        return;
      }

      this.logger.warn(
        'FCM disabled — set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY ' +
          '(or GOOGLE_APPLICATION_CREDENTIALS). Push dispatch will no-op until configured.',
      );
    } catch (err) {
      this.ready = false;
      this.logger.error(
        'Firebase Admin init failed; push dispatch disabled.',
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  isEnabled(): boolean {
    return this.ready;
  }

  async sendToTokens(tokens: string[], payload: PushPayload): Promise<PushSendResult> {
    const unique = [...new Set(tokens.map((t) => t.trim()).filter(Boolean))];
    if (unique.length === 0) {
      return { successCount: 0, failureCount: 0, prunedTokens: [] };
    }

    if (!this.ready) {
      this.logger.debug(
        `FCM no-op: would send type=${payload.type} to ${unique.length} token(s).`,
      );
      return { successCount: 0, failureCount: unique.length, prunedTokens: [] };
    }

    const data: Record<string, string> = {
      type: payload.type,
      ...(payload.data ?? {}),
    };

    const message: admin.messaging.MulticastMessage = {
      tokens: unique,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'mutesound_schedule',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
    };

    const prunedTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // sendEachForMulticast caps at 500 tokens per call
    const chunkSize = 500;
    for (let i = 0; i < unique.length; i += chunkSize) {
      const chunk = unique.slice(i, i + chunkSize);
      const response = await admin.messaging().sendEachForMulticast({
        ...message,
        tokens: chunk,
      });
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((res, idx) => {
        if (res.success) return;
        const code = res.error?.code ?? '';
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          prunedTokens.push(chunk[idx]);
        } else {
          this.logger.warn(`FCM send failed for token …${chunk[idx].slice(-8)}: ${code}`);
        }
      });
    }

    return { successCount, failureCount, prunedTokens };
  }
}
