# Security & Access Document
## Project: MuteSound

---

## 1. Purpose
Defines security controls, data privacy handling, permission scoping, and access-control model across all MuteSound components.

---

## 2. Data Classification

| Data Type | Sensitivity | Storage |
|---|---|---|
| Email / login credentials | High | Hashed (bcrypt/argon2), never plaintext |
| Location (city/lat-long) | Medium | Stored server-side, used only for prayer-time calc |
| Mute preferences | Low | Stored server-side |
| Push tokens | Medium | Stored server-side, rotated on re-registration |
| Raw microphone audio (ML feature) | High | **Never stored, never transmitted** — processed on-device only, discarded immediately after inference |
| Audio classification result (azan/non-azan probability) | Low | Ephemeral, not persisted unless user opts into analytics |

---

## 3. Authentication & Authorization

- **Auth method**: JWT (short-lived access token + refresh token) or OAuth (Google) for web/app login
- **Password storage**: argon2id hashing, salted
- **Session handling**: refresh tokens stored httpOnly/secure cookies (web) or secure keystore (mobile)
- **Device-level auth**: each device/extension registers with a scoped API key tied to the user's account; revocable from dashboard

### Role Model (MVP — single role)
| Role | Access |
|---|---|
| User | Manage own settings, devices, location, mute preferences |
| (Phase 2) Parent/Family Admin | Manage linked child devices' settings |
| Admin (internal) | View aggregate/anonymized usage metrics only — no access to individual audio or precise location |

---

## 4. Permission Scoping by Platform

### 4.1 Android
| Permission | Why Needed | Scope Limitation |
|---|---|---|
| `RECORD_AUDIO` | ML azan verification (opt-in only) | Requested only if user enables ML feature; runtime prompt with clear explanation |
| `MODIFY_AUDIO_SETTINGS` | Mute/restore system volume | Standard, no extra disclosure needed |
| `SCHEDULE_EXACT_ALARM` | Precise Azan-time trigger | Standard |
| `RECEIVE_BOOT_COMPLETED` | Reschedule alarms after reboot | Standard |

### 4.2 Chrome Extension
| Permission | Why Needed |
|---|---|
| `tabs` | Detect audible tabs, mute/unmute |
| `alarms` | Schedule Azan-time triggers |
| `storage` | Cache today's prayer schedule locally |
| `notifications` | Inform user when mute triggered |

**Note**: Extension does NOT request `<all_urls>` host permissions or broad content-script injection — it only needs the Tabs API for mute control, minimizing Chrome Web Store review risk and user trust concerns.

### 4.3 iOS
- Only `UNUserNotificationCenter` (local notifications) — no microphone or audio-control permission needed since iOS can't support system-wide mute anyway.

---

## 5. Privacy Principles

1. **On-device-only audio processing** — this is the most sensitive feature and must be architected so raw audio never leaves the device, is never logged, and is discarded after each inference cycle.
2. **Location minimization** — store city-level or coarse lat/long only; do not continuously track GPS in background, only re-fetch on manual update or significant location change.
3. **Opt-in for ML feature** — disabled by default; clear in-app explanation before enabling mic access.
4. **Data retention** — prayer-time cache purged after 30 days; account deletion cascades to all user data (settings, devices, tokens) within 30 days per request.
5. **No third-party ad trackers / analytics SDKs** that access audio, location, or personal data beyond first-party product analytics (aggregate, anonymized).

---

## 6. Transport & Infra Security

- All API traffic over HTTPS/TLS 1.2+
- Backend API rate-limited per user/IP to prevent abuse
- Environment secrets (API keys, DB credentials) stored in managed secret store (e.g., Railway/Render env vars, never committed to repo)
- Database backups encrypted at rest
- CORS restricted to known frontend origins (website domain, extension ID)

---

## 7. Store Compliance Notes

- **Google Play**: Background microphone use policy requires prominent in-app disclosure + runtime permission; must justify use case clearly in store listing (azan detection, opt-in, on-device only, no data leaves device).
- **Chrome Web Store**: Manifest V3 required; minimal permissions reduces review friction; must have a clear privacy policy link since `tabs` permission is considered sensitive.
- **Apple App Store**: No mic/audio-control claims for system-wide muting (would be rejected as it's not technically possible) — must clearly market iOS app as "notification + Shortcuts helper" only.

---

## 8. Incident Response (baseline)

- Centralized logging for backend (no PII/audio in logs)
- Defined process: credential leak → force password reset + token invalidation for affected users
- Security contact/email published on website for responsible disclosure
