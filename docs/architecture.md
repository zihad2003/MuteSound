# architecture.md
## MuteSound — Architecture Reference (condensed)

> For full diagrams, see `01-System-Architecture.md`. This file is the quick-reference version for engineering/agent context.

---

## Components

1. **Website (Next.js + React + Tailwind)** — account, settings, device management, prayer-time calendar
2. **Chrome Extension (Manifest V3, TypeScript)** — mutes audible tabs at Azan time via `chrome.alarms` + `chrome.tabs`
3. **Android App (Flutter or Kotlin)** — mutes system volume via `AudioManager`, scheduled via `AlarmManager`/`WorkManager`
4. **iOS App (Flutter or Swift)** — notification-only + Shortcuts automation template (no system-wide mute possible)
5. **Backend API (NestJS or Django REST + PostgreSQL)** — auth, settings storage, prayer-time cache/proxy, push dispatch
6. **External: Aladhan API** — source of daily prayer times
7. **Optional ML layer (YAMNet + TFLite, on-device only, Android)** — azan audio verification, opt-in

## Data Flow (short version)
```
Aladhan API → Backend (daily cache) → Client apps/extension pull/push sync
→ Local alarm scheduled per prayer time → Alarm fires → Mute action
→ Notification shown → Auto-restore after duration window
```

## Stack Summary
| Layer | Tech |
|---|---|
| Web | Next.js, React, Tailwind |
| Extension | Manifest V3, TypeScript |
| Android | Flutter/Kotlin, AudioManager, AlarmManager |
| iOS | Flutter/Swift, UNUserNotificationCenter, Shortcuts |
| Backend | NestJS/Django REST |
| DB | PostgreSQL |
| Push | Firebase Cloud Messaging, Web Push |
| ML (optional) | YAMNet embeddings + custom TFLite classifier |
| Hosting | Vercel (web), Railway/Render (backend), Firebase |

## Key Architectural Principle
**Scheduling is the source of truth.** Every client independently maintains a locally-cached schedule and fires its own local alarm — the system does not rely on a live server push at the exact Azan second, which keeps it resilient to network drops and battery-saver restrictions.

## Related Docs
- `01-System-Architecture.md` — full diagrams
- `03-Technical-Architecture-Document.md` — implementation-level detail, data models
- `api.md` — API contract
- `security-and-access` (`04-Security-and-Access-Document.md`) — permission/privacy model
