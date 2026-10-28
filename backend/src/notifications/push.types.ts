/** Data payload `type` values understood by MuteSound Android (and future iOS) clients. */
export enum PushMessageType {
  /** Prayer-time cache refreshed — client should pull /prayer-times/me and reschedule local alarms. */
  schedule_updated = 'schedule_updated',
  /** Location or mute preferences changed — client should re-sync settings + schedule. */
  settings_updated = 'settings_updated',
  /** Optional reminder near Azan (Android); mute itself still relies on local AlarmManager. */
  mute_reminder = 'mute_reminder',
  /** Dev/ops connectivity check. */
  test = 'test',
}

export interface PushPayload {
  type: PushMessageType;
  title: string;
  body: string;
  /** Flat string map for FCM `data` (all values must be strings). */
  data?: Record<string, string>;
}

export interface PushSendResult {
  successCount: number;
  failureCount: number;
  /** Tokens removed because FCM reported them invalid/unregistered. */
  prunedTokens: string[];
}
