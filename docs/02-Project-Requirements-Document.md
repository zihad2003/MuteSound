# Project Requirements Document (PRD)
## Project: AzanMute (working title)

---

## 1. Problem Statement

During Azan (call to prayer) time, many users — especially younger users engaged with reels, music, or games — continue consuming loud media instead of pausing out of respect. There is no automated system to detect prayer time and mute distracting audio across devices and browsers.

## 2. Goal / Vision

Build a system that automatically silences device and browser audio during Azan windows, helping users build a habit of respectful pause during prayer times, across Website, Chrome Extension, and Mobile (Android priority, iOS best-effort).

## 3. Target Users

- Muslim smartphone/PC users who want an automated respectful-pause reminder
- Parents who want this enforced on children's devices
- Users near a mosque or in regions where Azan timing matters culturally (initial focus: Bangladesh)

## 4. Scope

### 4.1 In Scope (MVP)
- User account + location-based prayer time configuration (Aladhan API)
- Chrome Extension: auto-mute audible tabs during Azan window
- Android App: system volume auto-mute during Azan window + notification
- Website dashboard: settings, prayer-time calendar, device management
- Configurable mute duration (e.g., 3/5/10 minutes)
- Auto-restore volume after window ends

### 4.2 In Scope (Phase 2 / Advanced)
- On-device audio verification (YAMNet-based azan detection) as accuracy layer
- iOS app with Shortcuts-based semi-automation
- Multi-device sync (family/parental mode)
- Usage stats ("You avoided distraction 12 times this week")

### 4.3 Out of Scope
- Full iOS system-wide auto-mute (OS restriction — not technically possible for 3rd-party apps)
- Muting other users' devices remotely without consent
- Detecting Azan from arbitrary ambient sound with no location context (unreliable, high false-positive)

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | User can sign up / log in (email or Google) |
| FR-2 | User can set location manually or via GPS/IP detection |
| FR-3 | User can select prayer-time calculation method |
| FR-4 | System fetches and caches daily prayer times per user |
| FR-5 | Chrome extension mutes all audible tabs at Azan start time |
| FR-6 | Chrome extension restores tab audio after mute-duration window |
| FR-7 | Android app mutes system media volume at Azan start time |
| FR-8 | Android app shows notification when mute is triggered |
| FR-9 | User can set mute duration (default 5 min, configurable 1–15 min) |
| FR-10 | User can enable/disable per-prayer (e.g., only Maghrib + Isha) |
| FR-11 | User can view today's and week's prayer-time schedule on dashboard |
| FR-12 | (Phase 2) On-device ML confirms actual Azan audio before muting, when enabled |
| FR-13 | (Phase 2) iOS app sends notification + deep-links to Shortcuts automation |

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Prayer-time fetch must be cached; avoid excessive external API calls (max 1 fetch/city/day) |
| NFR-2 | Mute trigger accuracy within ±30 seconds of actual Azan time |
| NFR-3 | Android background service must comply with Doze/battery-optimization guidelines |
| NFR-4 | No raw audio ever leaves the device (privacy-first, on-device ML only) |
| NFR-5 | Extension and app must work offline for already-cached day's schedule |
| NFR-6 | System must support at least Dhaka + major Bangladeshi cities at launch |
| NFR-7 | 99% uptime for backend scheduling service |

## 7. Success Metrics

- % of scheduled Azan windows where mute successfully triggered
- Daily active users retaining the extension/app after 2 weeks
- User-reported false-positive/false-negative rate (if ML layer enabled)
- Play Store / Chrome Web Store rating

## 8. Assumptions & Constraints

- Users grant location permission for accurate prayer times
- Android is the primary mobile platform for full functionality; iOS is best-effort only
- Aladhan API (or equivalent) remains free/available
- Users install the Chrome extension only on browsers they control

## 9. Risks

| Risk | Mitigation |
|---|---|
| iOS platform restrictions block core feature | Position iOS as "assist" mode via Shortcuts, market Android as primary |
| False positives with ML audio detection | Keep ML optional/off by default; rely on scheduling as primary trigger |
| Battery drain complaints (Android) | Use WorkManager/AlarmManager instead of continuous polling; mic only active in narrow window |
| Play Store policy rejection (background mic use) | Clearly disclose permission use, make ML feature strictly opt-in |

## 10. Milestones (High-Level)

1. Website + backend + Aladhan integration
2. Chrome Extension MVP
3. Android App MVP
4. ML-based verification (optional layer)
5. iOS app (Shortcuts-assisted)
