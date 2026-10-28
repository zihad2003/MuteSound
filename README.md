# MuteSound

Auto-mute browser and phone audio during Azan prayer times.

## Packages

| Package | Path | Status |
|---|---|---|
| Backend API (NestJS) | `backend/` | MVP API + FCM dispatch (credentials optional) |
| Website dashboard (Next.js) | `website/` | MVP pages complete |
| Chrome extension | `extension/` | MVP mute flow complete (store submit pending) |
| Android app (Flutter) | `android/` | Phase 4 scaffold (needs Flutter SDK to build) |
| iOS (Phase 2) | `ios/` | Not started |

## Quick start

```bash
pnpm install
pnpm db:up          # optional PostgreSQL via Docker
pnpm dev:backend    # http://localhost:3000/v1
pnpm dev:web        # http://localhost:3001
pnpm build:extension
```

Load the extension from `extension/dist` via `chrome://extensions` → Developer mode → Load unpacked.

See `docs/setup.md` and `docs/task.md` for environment variables and the full checklist. Firebase/FCM: `docs/firebase.md` (Android push; Chrome uses `chrome.alarms`, not FCM).

**You vs AI:** `docs/user-actions.md` · Store copy: `docs/store-listing.md` · Deploy/Postgres: `docs/deploy.md` · QA: `docs/qa-checklist.md`

```powershell
powershell -File scripts/check-env.ps1
```
