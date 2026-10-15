# task.md
## AzanMute — Task Checklist (MVP Build Order)

> Checkbox-style working list. Full ticket detail with estimates in `06-Feature-Ticket-List.md`.

---

## Phase 0 — Setup
- [ ] Init monorepo or multi-repo structure (backend / website / extension / android)
- [ ] Set up PostgreSQL instance
- [ ] Register Aladhan API usage (no key required, but confirm rate limits)
- [ ] Set up Firebase project (for FCM push later)

## Phase 1 — Backend
- [ ] Backend scaffold (NestJS or Django REST)
- [ ] User model + signup/login (email+password)
- [ ] Google OAuth login
- [ ] JWT auth + refresh token flow
- [ ] LocationSetting model + API
- [ ] Aladhan API integration service
- [ ] Daily prayer-time cache cron job
- [ ] `GET /prayer-times` endpoint
- [ ] MutePreference model + API
- [ ] Device registration API

## Phase 2 — Website
- [ ] Landing page
- [ ] Signup/Login pages
- [ ] Dashboard home (countdown + today's schedule)
- [ ] Location settings page
- [ ] Mute preferences page
- [ ] Devices management page
- [ ] Weekly schedule calendar view
- [ ] Privacy policy + terms pages

## Phase 3 — Chrome Extension
- [ ] Manifest V3 scaffold
- [ ] Account login/sync
- [ ] Fetch & cache today's schedule
- [ ] `chrome.alarms` scheduling logic
- [ ] Mute audible tabs on trigger
- [ ] Auto-restore after duration window
- [ ] Handle newly-opened audible tabs mid-window
- [ ] Popup UI
- [ ] Options page UI
- [ ] Notification with Undo action
- [ ] Submit to Chrome Web Store

## Phase 4 — Android App
- [ ] Project scaffold
- [ ] Login/account sync
- [ ] Location + settings screens
- [ ] AlarmManager scheduling
- [ ] AudioManager mute/restore
- [ ] Foreground service / reliability layer
- [ ] Boot-completed rescheduling
- [ ] Notification with Undo/Snooze
- [ ] Home screen UI
- [ ] Permission onboarding flow
- [ ] Submit to Play Store

## Phase 5 — QA / Launch
- [ ] Cross-city/timezone prayer-time accuracy test
- [ ] Extension mute/unmute edge-case tests
- [ ] Android Doze-mode reliability test
- [ ] Small beta group test
- [ ] Store review submissions

## Phase 6 — Optional / Post-MVP
- [ ] Collect/label azan audio dataset
- [ ] Train YAMNet-based classifier head
- [ ] Export to TFLite, integrate on-device inference
- [ ] iOS app (notification + Shortcuts template)
- [ ] Family/parental mode
- [ ] Usage stats dashboard
