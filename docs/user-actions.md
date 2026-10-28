# User actions checklist (MuteSound)

Things only you can finish (accounts / secrets / store submit). AI prepares code and docs; paste secrets into local `.env` files that are **not** committed.

---

## 1. Env secrets (do this first)

### Backend — `backend/.env`

| Variable | Status needed |
|----------|----------------|
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Strong random strings (already set in local env if present) |
| `GOOGLE_OAUTH_CLIENT_ID` | From Google Cloud Console OAuth client |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (`\n` escapes) |

Full Firebase steps: [firebase.md](./firebase.md).

### Website — `website/.env.local`

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_BASE` | e.g. `http://localhost:3000/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same OAuth **Web** client ID as backend |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3001` |

Validate locally:

```powershell
pnpm exec --dir . powershell -File scripts/check-env.ps1
# or:
powershell -File scripts/check-env.ps1
```

---

## 2. Local run smoke

```powershell
pnpm install
pnpm db:up          # optional if using Docker Postgres
pnpm --filter @mutesound/backend prisma:migrate   # or project’s migrate script
pnpm dev:backend
pnpm dev:web
pnpm build:extension
```

Load `extension/dist` at `chrome://extensions` → Developer mode → Load unpacked.

---

## 3. Chrome Web Store (when ready)

Full draft copy + steps: **[store-listing.md](./store-listing.md)**.

1. Pay / open a [Chrome Web Store developer](https://chrome.google.com/webstore/devconsole) account.
2. `pnpm build:extension` → zip `extension/dist`.
3. Paste listing fields from store-listing.md; set privacy / terms to your **hosted** site.
4. Submit for review (only you can click Submit).

## 4. Google Play (after Android Phase 4)

1. [Play Console](https://play.google.com/console) developer account.
2. Create app; upload AAB from Flutter release build.
3. Complete listing from [store-listing.md](./store-listing.md).

## 5. Flutter (before / during Phase 4)

Install [Flutter SDK](https://docs.flutter.dev/get-started/install) + Android Studio / SDK so `flutter doctor` is clean. Then AI (or you) can run the app under `android/`.

## 6. Git remote

Uncommitted MVP work stays local until you ask: **commit then push**.
