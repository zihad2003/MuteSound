# context.md
## MuteSound — Project Context

---

## What This Project Is
MuteSound automatically mutes device/browser audio during Azan (Islamic call to prayer) time, so users aren't distracted by reels/music/games during prayer time. It spans a **Website**, a **Chrome Extension**, and a **Mobile App** (Android primary, iOS best-effort).

## Why It Exists
The founder observed that younger users (including in Bangladesh) often keep consuming loud media — reels, music, games — right through Azan, when local etiquette expects them to pause/lower sound. There's no existing automated tool for this, so the idea is to build one.

## Who's Building This
- Solo builder: Zihad — CSE student at UIU (Dhaka), also runs an e-commerce business (BigBazar Bariarhat) and does freelance web dev. Building this project independently, likely with AI-agent assistance for implementation.

## Primary Mechanism (important — don't re-litigate this)
The system is **prayer-time-schedule-driven** (via the Aladhan API), NOT live-microphone-azan-detection-driven. Live audio detection (YAMNet-based) exists only as an **optional, opt-in, Phase 2** accuracy layer, active only inside the scheduled prayer window. This was a deliberate decision — see `design.md` §2 for rationale (battery, privacy, false positives, OS/store policy risk).

## Platform Reality Check
- **Android**: Full auto-mute is technically possible (`AudioManager`) — this is the primary/flagship platform.
- **Chrome Extension**: Full tab-mute is possible (`chrome.tabs` API) — second priority, fast to ship.
- **iOS**: Full system-wide auto-mute is **NOT possible** for third-party apps (Apple sandboxing). iOS app is scoped to notification + a Shortcuts automation template the user sets up once. Do not scope iOS beyond this without revisiting platform constraints.

## Build Order (already decided)
1. Website + backend + Aladhan integration
2. Chrome Extension MVP
3. Android App MVP
4. (Optional/Phase 2) ML-based audio verification
5. (Phase 2) iOS app

## Target Market for Launch
Bangladesh first (Dhaka prayer-time calculation method), given founder's own context and BigBazar customer base as a potential early-user pool.

## Full Doc Set (for reference)
- `01-System-Architecture.md` — diagrams
- `02-Project-Requirements-Document.md` — PRD
- `03-Technical-Architecture-Document.md` — implementation detail
- `04-Security-and-Access-Document.md` — security/privacy
- `05-Frontend-Specification-Document.md` — UI spec
- `06-Feature-Ticket-List.md` — tickets/sprints
- `design.md` — design rationale
- `architecture.md` — condensed architecture reference
- `api.md` — API contract
- `task.md` — actionable task checklist
- `setup.md` — dev environment setup
- `agent.md` — instructions for AI coding agents working in this repo
