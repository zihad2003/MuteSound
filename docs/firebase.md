# Firebase / FCM setup (BE-11)

MuteSound uses **Firebase Cloud Messaging** for Android (and future iOS) schedule-sync pushes. The Chrome extension does **not** use FCM — it registers as `chrome_extension` without a push token and schedules mutes with `chrome.alarms` + pull sync.

Local alarms remain the source of truth for mute timing. FCM tells mobile clients to refresh prayer times / settings after cache or preference changes.

---

## 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) and create (or select) a project.
2. Add an **Android** app when you start Phase 4 (package name TBD); not required to run the backend scaffold.
3. Enable **Cloud Messaging** (enabled by default on new projects).

---

## 2. Service account for the NestJS backend

1. Firebase Console → **Project settings** → **Service accounts**.
2. Click **Generate new private key** → download the JSON.
3. Do **not** commit the JSON. Prefer env vars (below) or point `GOOGLE_APPLICATION_CREDENTIALS` at a local path outside the repo.

### Option A — env vars (recommended for Railway/Render)

In `backend/.env`:

```env
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Paste the private key as a single line with literal `\n` escapes (Nest/`dotenv` will turn them into newlines).

### Option B — credentials file (local only)

```env
GOOGLE_APPLICATION_CREDENTIALS="D:/secrets/mutesound-firebase.json"
```

If both are set, **Option A wins** when all three `FIREBASE_*` values are present.

---

## 3. Verify

1. Start backend: `pnpm dev:backend`
2. Without credentials you should see: `FCM disabled — set FIREBASE_PROJECT_ID...`
3. With credentials: `Firebase Admin initialized for project ...`
4. Register an Android device with `POST /v1/devices/register` including `push_token`.
5. Call `POST /v1/notifications/test` with a user JWT — expect `fcm_enabled: true` and `successCount >= 1` when the token is valid.

---

## 4. Push payload contract (Android)

FCM `data` always includes string fields. Clients should handle:

| `type` | When | Client action |
|---|---|---|
| `schedule_updated` | Daily prayer-time prefetch for the user's city | Pull `/prayer-times/me`, reschedule AlarmManager |
| `settings_updated` | Location or mute preference saved | Re-sync settings + schedule |
| `mute_reminder` | Optional (API helper; not cron-driven yet) | Show reminder; mute still from local alarm |
| `test` | `POST /notifications/test` | Connectivity check |

Legacy `FCM_SERVER_KEY` is **deprecated** and unused — use Firebase Admin credentials above.

---

## 5. Chrome extension note

Extension `POST /devices/register` body is `{ "platform": "chrome_extension" }` (no `push_token`). Schedule refresh uses the overnight `chrome.alarms` refresh + manual sync from the popup/options UI.
