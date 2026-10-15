# agent.md
## Instructions for AI Coding Agents Working on AzanMute

> Read `context.md` first for project background, then this file for working conventions before writing code.

---

## 1. Non-Negotiable Design Constraints (do not silently change these)

1. **Prayer-time scheduling (Aladhan API) is the primary mute trigger.** Do not implement live always-on microphone azan-detection as the default mechanism. Audio ML detection is Phase 2, opt-in, and only active inside an already-scheduled prayer window.
2. **iOS cannot do system-wide auto-mute.** Never write code that assumes an iOS app can silence other apps directly — only local notifications + a Shortcuts automation template are possible there.
3. **No raw audio ever leaves the device.** Any ML/audio code must process on-device only; never add a network call that uploads audio.
4. **Chrome extension permissions stay minimal.** Do not add `<all_urls>` or broad host permissions — only `tabs`, `alarms`, `storage`, `notifications` unless a ticket explicitly changes this and updates `04-Security-and-Access-Document.md`.
5. **Mute actions must be reversible/visible.** Every auto-mute trigger must produce a user-visible notification with an "Undo" affordance — don't implement silent, unannounced muting.

## 2. Where to Find Things
| Need | File |
|---|---|
| Overall project background | `context.md` |
| Why a design decision was made | `design.md` |
| System diagrams | `01-System-Architecture.md`, `architecture.md` |
| Requirements / scope | `02-Project-Requirements-Document.md` |
| Data models, platform implementation detail | `03-Technical-Architecture-Document.md` |
| Security/privacy/permission rules | `04-Security-and-Access-Document.md` |
| UI/UX spec | `05-Frontend-Specification-Document.md` |
| API contract | `api.md` |
| What to build next, in order | `task.md`, `06-Feature-Ticket-List.md` |
| Local dev environment | `setup.md` |

## 3. Working Conventions

- **Follow the build order** in `task.md` (Backend → Website → Extension → Android → QA → Phase 2 items). Don't jump ahead to iOS/ML unless explicitly asked.
- **Match the API contract** in `api.md` exactly for endpoint names/shapes when implementing backend routes or client calls — if a change is needed, update `api.md` in the same change.
- **Keep permission requests minimal** on every platform; if a new permission is genuinely required, flag it and update `04-Security-and-Access-Document.md` rather than adding it silently.
- **Naming**: use `AzanMute` as the working product name in code/comments until a final brand name is confirmed by the user.
- **Language/comments**: code and comments in English; this doc set is bilingual-friendly but code should stay in English for consistency.
- **Testing new mute logic**: prefer a debug-only manual trigger (see `setup.md` §6) over waiting for real prayer times.

## 4. When Requirements Are Unclear
If a task isn't clearly covered by the existing docs (e.g., exact ML model choice, exact push-notification payload shape), make a reasonable assumption consistent with the constraints in §1, implement it, and note the assumption in the PR/commit description rather than blocking.

## 5. Out of Scope (don't build unless asked)
- Full iOS system-wide mute (not technically possible)
- Remote/covert muting of another person's device without their own account
- General app-blocking / focus-mode features beyond Azan-time muting
- Ad-tracking or third-party analytics SDKs that touch audio or precise location
