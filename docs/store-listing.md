# Store listing prep (Chrome Web Store + Google Play)

AI prepares copy and checklist. **You** create developer accounts and click Submit.

---

## Chrome Web Store (EXT-11)

### Package
1. From repo root: `pnpm build:extension`
2. Zip contents of `extension/dist/` (manifest at zip root), or upload the folder per console UI.
3. Confirm `manifest.json` name, description, icons (128px), and host permissions match production API when live.

### Listing fields (draft)

| Field | Suggested copy |
|-------|----------------|
| **Name** | MuteSound |
| **Summary** | Auto-mute browser tabs during Azan prayer times. |
| **Description** | MuteSound syncs your prayer schedule and mutes audible Chrome tabs during each Azan window, then restores volume afterward. Sign in to manage location, mute duration, and devices from the MuteSound dashboard. Privacy-first: mute timing runs locally via Chrome alarms; optional account sync keeps preferences across devices. |
| **Category** | Productivity |
| **Language** | English (add Bangla later if desired) |

### URLs (host the website first)
- Privacy: `https://<your-domain>/privacy` (local pages exist under `website/src/app/privacy`)
- Terms: `https://<your-domain>/terms`
- Support email: your contact

### Assets you provide
- Screenshots of popup + options + dashboard (1280×800 or per store rules)
- Promotional tile if required by console

### Submit steps
1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. New item → upload zip → fill listing → privacy questionnaire → Submit for review

---

## Google Play (AND-11 — after Android build)

### Package
```bash
cd android
flutter build appbundle --release
```
Upload `build/app/outputs/bundle/release/app-release.aab`.

### Listing draft

| Field | Suggested copy |
|-------|----------------|
| **App name** | MuteSound |
| **Short description** | Mute phone media during Azan automatically. |
| **Full description** | MuteSound schedules mute windows from your prayer times so media pauses during Azan, then restores afterward. Sign in with the same account as the website and Chrome extension. Requires notification and exact-alarm permissions for reliability. |

### Policies
- Privacy policy URL (same as web)
- Data safety form: account email, location (city/method for prayer times), device tokens for FCM
- No recording unless ML feature ships (RECORD_AUDIO only then)

### Submit
1. [Play Console](https://play.google.com/console) → Create app → Store listing → Content rating → Release testing → Production when ready
