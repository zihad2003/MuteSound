# Feature Ticket List
## Project: MuteSound

Format: `[TICKET-ID] Title — Priority — Est.`

---

## Epic 1: Backend & Auth

- **[BE-01]** Set up project scaffold (NestJS/Django) + PostgreSQL — P0 — 1d
- **[BE-02]** User signup/login (email + password, hashed) — P0 — 2d
- **[BE-03]** Google OAuth login — P1 — 1d
- **[BE-04]** JWT auth middleware + refresh token flow — P0 — 1d
- **[BE-05]** Location settings API (save city/lat-long/method) — P0 — 1d
- **[BE-06]** Aladhan API integration service — P0 — 1d
- **[BE-07]** Daily prayer-time cache job (cron) — P0 — 1d
- **[BE-08]** GET /prayer-times endpoint (cached lookup) — P0 — 0.5d
- **[BE-09]** Mute-preference save/retrieve API — P0 — 1d
- **[BE-10]** Device registration API (extension/app) — P0 — 1d
- **[BE-11]** Push notification dispatch service (FCM setup) — P1 — 2d
- **[BE-12]** Account deletion + data cascade — P1 — 1d
- **[BE-13]** Rate limiting + basic abuse protection — P1 — 1d

## Epic 2: Website Dashboard

- **[FE-01]** Landing page — P0 — 1d
- **[FE-02]** Signup/Login pages — P0 — 1d
- **[FE-03]** Dashboard home (next-azan countdown, today's schedule) — P0 — 2d
- **[FE-04]** Location settings page — P0 — 1d
- **[FE-05]** Mute preferences page — P0 — 1d
- **[FE-06]** Devices management page — P1 — 1d
- **[FE-07]** Weekly schedule calendar view — P1 — 1d
- **[FE-08]** Privacy policy + terms pages — P0 — 0.5d
- **[FE-09]** Dark mode support — P2 — 1d
- **[FE-10]** Mobile-responsive polish — P1 — 1d

## Epic 3: Chrome Extension

- **[EXT-01]** Manifest V3 scaffold + build pipeline — P0 — 1d
- **[EXT-02]** Login/sync with account (OAuth token exchange) — P0 — 1d
- **[EXT-03]** Fetch & cache today's schedule (chrome.storage) — P0 — 1d
- **[EXT-04]** chrome.alarms scheduling logic — P0 — 1d
- **[EXT-05]** Mute audible tabs on alarm trigger — P0 — 1d
- **[EXT-06]** Auto-restore tabs after mute-duration window — P0 — 1d
- **[EXT-07]** Handle newly-opened audible tabs mid-window — P1 — 1d
- **[EXT-08]** Popup UI (status, countdown, master toggle) — P0 — 1.5d
- **[EXT-09]** Options page UI — P0 — 1d
- **[EXT-10]** Native notification with Undo action — P1 — 1d
- **[EXT-11]** Chrome Web Store listing + privacy policy submission — P0 — 1d

## Epic 4: Android App

- **[AND-01]** Project scaffold (Flutter/Kotlin) — P0 — 1d
- **[AND-02]** Login/account sync — P0 — 1.5d
- **[AND-03]** Location + settings screens — P0 — 2d
- **[AND-04]** AlarmManager scheduling for prayer times — P0 — 2d
- **[AND-05]** AudioManager mute/restore implementation — P0 — 1.5d
- **[AND-06]** Foreground service / reliability layer — P0 — 2d
- **[AND-07]** Boot-completed rescheduling — P0 — 1d
- **[AND-08]** Notification with Undo/Snooze actions — P1 — 1d
- **[AND-09]** Home screen (countdown, today schedule, master toggle) — P0 — 2d
- **[AND-10]** Permission onboarding flow — P0 — 1.5d
- **[AND-11]** Play Store listing + policy disclosures — P0 — 1d

## Epic 5: ML Audio Verification (Phase 2, Optional)

- **[ML-01]** Collect/label azan vs non-azan audio dataset — P2 — 3d
- **[ML-02]** Train classifier head on YAMNet embeddings — P2 — 2d
- **[ML-03]** Export + quantize to TFLite — P2 — 1d
- **[ML-04]** Integrate on-device inference in Android app — P2 — 2d
- **[ML-05]** Mic-activation window logic (prayer-time bound only) — P2 — 1.5d
- **[ML-06]** Consecutive-match confirmation logic (reduce false positives) — P2 — 1d
- **[ML-07]** Settings toggle + consent/disclosure UI — P2 — 1d

## Epic 6: iOS App (Phase 2)

- **[IOS-01]** Project scaffold — P2 — 1d
- **[IOS-02]** Local notification scheduling — P2 — 1.5d
- **[IOS-03]** Shortcuts automation template + deep link — P2 — 2d
- **[IOS-04]** Settings screens (shared design with Android) — P2 — 1.5d
- **[IOS-05]** App Store listing (clear scope disclosure) — P2 — 1d

## Epic 7: QA / Launch

- **[QA-01]** Cross-timezone/city testing for prayer-time accuracy — P0 — 1d
- **[QA-02]** Extension mute/unmute edge-case testing — P0 — 1d
- **[QA-03]** Android Doze-mode reliability testing — P0 — 1d
- **[QA-04]** Beta testing with small user group (UIU friends/BigBazar customers?) — P1 — 3d
- **[QA-05]** Store submission review cycle (Play + Chrome Web Store) — P0 — variable

---

## Suggested Sprint Grouping (2-week sprints)

| Sprint | Focus |
|---|---|
| 1 | BE-01 → BE-08, FE-01 → FE-03 |
| 2 | BE-09 → BE-13, FE-04 → FE-08 |
| 3 | EXT-01 → EXT-06 |
| 4 | EXT-07 → EXT-11, QA-02 |
| 5 | AND-01 → AND-07 |
| 6 | AND-08 → AND-11, QA-01, QA-03 |
| 7+ | ML epic + iOS epic (Phase 2, post-MVP) |
