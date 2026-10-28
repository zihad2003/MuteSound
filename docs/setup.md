# setup.md
## MuteSound — Development Setup Guide

---

## Prerequisites
- Node.js 20+ and npm/pnpm
- PostgreSQL 15+ (local or via Docker)
- Flutter SDK (if using Flutter for mobile) or Android Studio + Kotlin (if native)
- Google Chrome (for extension development/testing)
- Firebase project + service account (for FCM push — see `docs/firebase.md`)

---

## 1. Backend Setup

```bash
git clone <backend-repo-url>
cd backend
npm install

# Environment variables (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/mutesound
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ALADHAN_API_BASE=https://api.aladhan.com/v1
GOOGLE_OAUTH_CLIENT_ID=your-client-id
# FCM (optional locally — without these, push no-ops; see docs/firebase.md)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Run migrations (from monorepo root prefer: pnpm --filter @mutesound/backend ...)
pnpm prisma:migrate

# Start dev server
pnpm start:dev
```
Backend should now be running at `http://localhost:3000`. Full Firebase steps: `docs/firebase.md`.

---

## 2. Website Setup

```bash
git clone <website-repo-url>
cd website
npm install

# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:3000/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id

npm run dev
```
Website available at `http://localhost:3001` (or default Next.js port).

---

## 3. Chrome Extension Setup

```bash
git clone <extension-repo-url>
cd extension
npm install
npm run build
```

Load unpacked extension:
1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" → select the `dist/` (built) folder
4. Extension icon should appear in toolbar

For live rebuild during development: `npm run watch` (if configured), then reload the extension from `chrome://extensions` after each change.

---

## 4. Android App Setup (Flutter path)

```bash
git clone <android-repo-url>
cd android
flutter pub get

# .env or lib/config.dart
API_BASE=http://10.0.2.2:3000/v1   # 10.0.2.2 = localhost from Android emulator

flutter run
```

Key permissions to verify in `AndroidManifest.xml` during setup:
```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<!-- Only if ML feature enabled -->
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

---

## 5. iOS App Setup (Phase 2)

```bash
cd ios
flutter pub get
open ios/Runner.xcworkspace   # if native config needed
flutter run
```
Note: no special audio permissions needed since iOS app is notification-only.

---

## 6. Local Testing Tips

- Use a fixed test city (e.g., "Dhaka") and manually verify returned prayer times against a known reference (e.g., IslamicFinder) before trusting the Aladhan integration.
- For alarm-trigger testing without waiting for a real Azan time, add a debug-only "Test mute in 10 seconds" button (strip before production build).
- Chrome extension: test with multiple tabs playing audio (YouTube, Spotify Web) simultaneously to confirm all get muted/restored correctly.

---

## 7. Recommended Repo Structure (if monorepo)
```
mutesound/
├── backend/
├── website/
├── extension/
├── android/
├── ios/
└── docs/
    ├── design.md
    ├── architecture.md
    ├── context.md
    ├── task.md
    ├── api.md
    ├── setup.md
    └── agent.md
```
