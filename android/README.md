# MuteSound Android (Flutter)

Phase 4 app: login, settings, AlarmManager scheduling, AudioManager mute, FCM sync, onboarding.

## Prerequisites

1. Install [Flutter](https://docs.flutter.dev/get-started/install/windows) + Android SDK.
2. `flutter doctor` should be clean enough to build.
3. Backend running (emulator uses `http://10.0.2.2:3000/v1`).

## Run

```bash
cd android
flutter pub get
flutter run
```

Optional: copy `android/google-services.json` from Firebase Console (package `app.mutesound.android`).

## Architecture

- Dart UI + API client (`lib/`)
- Kotlin platform channel `app.mutesound/mute` for AlarmManager, AudioManager, foreground service, boot reschedule (`android/app/src/main/kotlin/...`)
