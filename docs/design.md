# design.md
## MuteSound — Design Document

---

## 1. Design Philosophy
- Calm, non-intrusive, respectful tone (this is a spiritual-adjacent utility, not a flashy consumer app)
- Automation-first: user sets it up once, then it "just works" in the background
- Trust through transparency: always show *why* something got muted, always offer instant Undo

## 2. Primary Trigger Model
Prayer-time **scheduling** (Aladhan API) is the source of truth for when to mute — not live audio detection. Audio detection (YAMNet) is an optional, opt-in accuracy layer, never the primary mechanism. This decision drives almost every downstream design choice (battery, privacy, permissions, reliability).

## 3. Core User Flows

**Flow A — First-time setup**
1. Sign up → set location (GPS or manual city) → choose calculation method
2. Choose which prayers to auto-mute + mute duration
3. Install Chrome extension and/or Android app, log in to sync
4. Done — dashboard shows "Next Azan in X"

**Flow B — Azan trigger (automatic)**
1. Scheduled alarm fires at Azan time
2. System mutes (tab audio / system volume)
3. Notification shown with Undo option
4. Auto-restore after configured duration

**Flow C — Manual override**
- User can disable auto-mute temporarily (master toggle) from popup/app home screen without changing saved preferences

## 4. Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| Scheduling > live audio detection as default | Reliable, battery-safe, privacy-safe, no false positives from TV/YouTube azan |
| ML audio detection is opt-in, mic active only inside prayer window | Minimizes battery drain + store-policy risk + privacy concern |
| iOS gets notification + Shortcuts template, not full auto-mute | Apple sandboxing makes true system-wide mute impossible for 3rd-party apps |
| Chrome extension only requests `tabs`/`alarms`/`storage`/`notifications` | Avoids `<all_urls>` permission, reduces Web Store review friction and user distrust |
| Always show Undo action on mute notification | Preserves user control/trust, avoids feeling like a "rogue" app |
| Mute duration user-configurable (1–15 min, default 5) | Azan length varies; user's own habits vary |

## 5. Non-Goals
- Not a general "focus mode" or app-blocker product
- Not attempting to detect Azan from arbitrary background noise without location context
- Not controlling other people's devices without their own account/consent (no covert remote mute)

## 6. Open Design Questions (to revisit)
- Should family/parental mode (Phase 2) allow a parent to view but not control a teen's mute settings, or fully control? (privacy vs. enforcement tradeoff)
- Should the extension mute *all* audible tabs or let user whitelist certain sites (e.g., a call in progress)?
