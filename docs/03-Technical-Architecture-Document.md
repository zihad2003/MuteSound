# Technical Architecture Document
## Project: AzanMute (working title)

---

## 1. Purpose
This document describes the technical implementation details behind each component defined in the System Architecture Document: data models, APIs, scheduling logic, and platform-specific implementation notes.

---

## 2. Backend API

### 2.1 Recommended Stack
- **Runtime**: Node.js (NestJS) — good MCP/REST support, TypeScript shared types with extension
- **DB**: PostgreSQL (managed, e.g., Supabase/Railway)
- **Auth**: JWT-based, with Google OAuth option
- **Job Scheduler**: node-cron or BullMQ for daily prayer-time pre-fetch
- **Push**: Firebase Cloud Messaging (Android), Web Push API (Chrome extension)

### 2.2 Core Data Models

```
User
- id (uuid, PK)
- email
- password_hash (nullable if OAuth)
- created_at

LocationSetting
- id (uuid, PK)
- user_id (FK -> User)
- city
- latitude
- longitude
- calculation_method (enum: KARACHI, DHAKA, MWL, ...)

PrayerSchedule (cache table)
- id (uuid, PK)
- city
- date
- fajr, dhuhr, asr, maghrib, isha (time)
- fetched_at

MutePreference
- id (uuid, PK)
- user_id (FK -> User)
- enabled_prayers (array: [fajr, dhuhr, asr, maghrib, isha])
- mute_duration_minutes (int, default 5)
- ml_verification_enabled (bool, default false)

Device
- id (uuid, PK)
- user_id (FK -> User)
- platform (enum: android, chrome_extension, ios)
- push_token
- last_synced_at
```

### 2.3 Key API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/signup | Create account |
| POST | /auth/login | Login, returns JWT |
| GET | /prayer-times?city=Dhaka&date=today | Get cached/fetched prayer times |
| POST | /settings/location | Save user location + method |
| POST | /settings/mute-preference | Save mute duration/prayers |
| POST | /devices/register | Register device/extension for push |
| GET | /devices | List linked devices |

### 2.4 Prayer-Time Sync Job
- Cron job runs daily at 00:05 local time per supported city
- Fetches from Aladhan API: `GET https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=1`
- Caches result in `PrayerSchedule` table
- Devices pull today's schedule at app/extension startup + via push update

---

## 3. Chrome Extension — Technical Detail

### 3.1 Manifest (V3) Key Permissions
```json
{
  "manifest_version": 3,
  "permissions": ["tabs", "alarms", "storage", "notifications"],
  "host_permissions": ["https://api.yourbackend.com/*"],
  "background": { "service_worker": "background.js" }
}
```

### 3.2 Scheduling Logic
1. On install/login: fetch today's prayer schedule from backend, store in `chrome.storage.local`
2. For each enabled prayer time, create `chrome.alarms.create('azan-<prayer>', {when: timestamp})`
3. `chrome.alarms.onAlarm` listener:
   - Query `chrome.tabs.query({audible: true})`
   - For each: store previous muted state, then `chrome.tabs.update(tabId, {muted: true})`
   - Set a follow-up `setTimeout`/second alarm for `mute_duration_minutes` later to restore
4. Show `chrome.notifications.create()` at trigger time

### 3.3 Edge Cases
- New tab opened mid-mute-window while Azan active → listen on `chrome.tabs.onUpdated` and mute newly audible tabs during active window
- Browser closed at Azan time → on next open, check if "missed window still active" and mute immediately if within duration

---

## 4. Android App — Technical Detail

### 4.1 Core APIs
- `AlarmManager.setExactAndAllowWhileIdle()` for precise Azan-time wake even in Doze mode
- `AudioManager.setStreamVolume(STREAM_MUSIC, 0, 0)` to mute; store prior volume to restore
- `WorkManager` for daily prayer-schedule sync (survives reboots via `BOOT_COMPLETED` receiver)
- Foreground service (or `AlarmManager` + `BroadcastReceiver`, lighter-weight) to guarantee trigger reliability

### 4.2 Permissions Required
- `RECEIVE_BOOT_COMPLETED`
- `SCHEDULE_EXACT_ALARM` (Android 12+)
- `MODIFY_AUDIO_SETTINGS`
- `RECORD_AUDIO` (only if ML verification feature enabled — must be runtime + clearly disclosed)
- `POST_NOTIFICATIONS` (Android 13+)

### 4.3 Optional ML Verification Flow
1. `AlarmManager` wakes app at Azan-time minus small buffer
2. Mic activates ONLY for a short listening window (e.g., 30–60 sec)
3. Audio buffer → YAMNet embedding → custom binary classifier (TFLite) → azan/non-azan probability
4. If 2–3 consecutive positive windows → confirm and trigger `AudioManager` mute
5. Mic deactivates immediately after window regardless of result

### 4.4 Model Training Notes (for Phase 2)
- Dataset: labeled azan audio clips (various muezzins/qaris) + negative samples (music, traffic, speech, silence)
- Base: YAMNet pretrained embeddings (521-class AudioSet model) — freeze base, train small dense classifier head
- Export: TensorFlow Lite (`.tflite`), quantized for mobile inference speed
- Inference library: `tflite_flutter` (if Flutter) or TensorFlow Lite Android API (if native Kotlin)

---

## 5. iOS App — Technical Detail

- No `AudioManager`-equivalent system-wide control available to 3rd-party apps
- Use `UNUserNotificationCenter` for local notification at Azan time
- Provide a pre-built **Shortcuts** automation template (via `.shortcut` file/deep link) that user installs once:
  - Trigger: "Time of Day" automation set to Azan times (user updates periodically, or app pushes updated times via notification reminding user to adjust)
  - Action: Enable specific Focus Mode / Set volume to 0
- App primarily acts as: schedule informer + Shortcuts template distributor

---

## 6. Security Considerations (summary — see dedicated Security Doc)
- JWT auth, HTTPS-only API
- No raw audio transmitted off-device
- Location data stored only as city/lat-long, not continuously tracked

---

## 7. Third-Party Dependencies

| Dependency | Purpose | Notes |
|---|---|---|
| Aladhan API | Prayer times | Free, rate-limit friendly with caching |
| Firebase Cloud Messaging | Push notifications | Free tier sufficient for MVP |
| YAMNet (TensorFlow Hub) | Base audio embeddings | Apache 2.0 license |
| chrome.* Extension APIs | Tab/audio control | Native browser API, no external dep |
