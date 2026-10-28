# task.md
## MuteSound — Task Checklist (MVP Build Order)

> Checkbox-style working list. Full ticket detail with estimates in `06-Feature-Ticket-List.md`.

---

## Phase 0 — Setup
- [x] Init monorepo or multi-repo structure (backend / website / extension / android)
- [x] Set up PostgreSQL instance (docker-compose; local SQLite also used for smoke)
- [x] Register Aladhan API usage (no key required, but confirm rate limits)
- [ ] Set up Firebase project (credentials; code ready — see docs/firebase.md)

## Phase 1 — Backend
- [x] Backend scaffold (NestJS or Django REST)
- [x] User model + signup/login (email+password)
- [x] Google OAuth login
- [x] JWT auth + refresh token flow
- [x] LocationSetting model + API
- [x] Aladhan API integration service
- [x] Daily prayer-time cache cron job
- [x] `GET /prayer-times` endpoint
- [x] MutePreference model + API
- [x] Device registration API
- [x] Account deletion + data cascade (BE-12)
- [x] Rate limiting + basic abuse protection (BE-13)
- [x] Push notification dispatch service / FCM (BE-11) — Admin SDK + dispatch; live send needs Firebase credentials

## Phase 2 — Website
- [x] Landing page
- [x] Signup/Login pages
- [x] Dashboard home (countdown + today's schedule)
- [x] Location settings page
- [x] Mute preferences page
- [x] Devices management page
- [x] Weekly schedule calendar view
- [x] Privacy policy + terms pages

## Phase 3 — Chrome Extension
- [x] Manifest V3 scaffold
- [x] Account login/sync
- [x] Fetch & cache today's schedule
- [x] `chrome.alarms` scheduling logic
- [x] Mute audible tabs on trigger
- [x] Auto-restore after duration window
- [x] Handle newly-opened audible tabs mid-window
- [x] Popup UI
- [x] Options page UI
- [x] Notification with Undo action
- [ ] Submit to Chrome Web Store

## Phase 4 — Android App
- [x] Project scaffold (Flutter under `android/`; requires local Flutter SDK to build)
- [x] Login/account sync
- [x] Location + settings screens
- [x] AlarmManager scheduling
- [x] AudioManager mute/restore
- [x] Foreground service / reliability layer
- [x] Boot-completed rescheduling
- [x] Notification with Undo/Snooze
- [x] Home screen UI
- [x] Permission onboarding flow
- [ ] Submit to Play Store (user — see docs/store-listing.md)

## Phase 5 — QA / Launch
- [ ] Cross-city/timezone prayer-time accuracy test — checklist: docs/qa-checklist.md
- [ ] Extension mute/unmute edge-case tests — docs/qa-checklist.md
- [ ] Android Doze-mode reliability test — docs/qa-checklist.md
- [ ] Small beta group test
- [ ] Store review submissions — docs/store-listing.md (user accounts)

## Phase 6 — Optional / Post-MVP
- [ ] Collect/label azan audio dataset
- [ ] Train YAMNet-based classifier head
- [ ] Export to TFLite, integrate on-device inference
- [ ] iOS app (notification + Shortcuts template)
- [ ] Family/parental mode
- [ ] Usage stats dashboard
