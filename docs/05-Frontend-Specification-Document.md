# Frontend Specification Document
## Project: MuteSound

---

## 1. Scope
Covers UI/UX specification for the **Website Dashboard** and the **Chrome Extension Popup/Options page**. Mobile app UI is described at a high level (detailed mobile UI spec can be a separate doc if needed).

---

## 2. Website Dashboard

### 2.1 Pages / Routes

| Route | Purpose |
|---|---|
| `/` | Landing page — explains product, CTA to sign up |
| `/login`, `/signup` | Auth pages |
| `/dashboard` | Main home — today's prayer schedule, mute status |
| `/dashboard/settings/location` | Set/edit city, calculation method |
| `/dashboard/settings/mute` | Configure enabled prayers, mute duration, ML toggle |
| `/dashboard/devices` | List linked devices (Android app, Chrome extension), revoke access |
| `/dashboard/schedule` | Weekly/monthly prayer-time calendar view |
| `/privacy`, `/terms` | Legal pages (required for store listings) |

### 2.2 Key Screens — Component Breakdown

**Dashboard Home**
- Card: "Next Azan in: HH:MM" (live countdown)
- Card: Today's 5 prayer times list, with enabled/disabled toggle inline
- Status banner: "Mute active" indicator when currently within a mute window
- Quick links to Devices / Settings

**Location Settings**
- City search/autocomplete input (or "Use my location" GPS button)
- Calculation method dropdown (Dhaka, Karachi, MWL, etc.)
- Save button with confirmation toast

**Mute Preferences**
- Checkbox group: Fajr / Dhuhr / Asr / Maghrib / Isha (which to auto-mute)
- Slider or number input: mute duration (1–15 min)
- Toggle: "Enable smart audio verification (ML)" with info tooltip explaining on-device/privacy
- Save button

**Devices Page**
- Table: Device name/type (icon for Android/Chrome), Last synced, Status (active/inactive)
- Action: "Remove device" (revokes token)
- Empty state: "No devices linked yet" + instructions to install extension/app

**Weekly Schedule View**
- Calendar/table showing 7-day forward prayer times for the user's city
- Source attribution: "Powered by Aladhan API"

### 2.3 Visual/UX Notes
- Clean, calm aesthetic (avoid loud colors) — this is a respectful/spiritual-adjacent product
- Support both light/dark mode
- Mobile-responsive (dashboard usable on phone browser too)
- Use simple line icons for prayer names, a moon/mosque motif sparingly (avoid overt religious imagery that feels kitschy)

---

## 3. Chrome Extension UI

### 3.1 Popup (click extension icon)
- Header: "MuteSound" + current status ("Active" / "Not configured")
- Next Azan countdown
- Quick toggle: Enable/Disable auto-mute (master switch)
- Link: "Open full settings" → opens Options page
- Link: "Open dashboard" → opens website in new tab

### 3.2 Options Page
- Mirrors website's Mute Preferences + Location settings (synced via account login)
- "Login to sync with account" if not authenticated
- Local-only mode note: "Not logged in — using manually set city only"

### 3.3 In-Browser Notification (native Chrome notification)
- Title: "Azan time — muting active tabs"
- Body: "X tab(s) muted for 5 minutes"
- Action button: "Undo" (immediately unmute)

---

## 4. Mobile App UI (High-Level)

### 4.1 Screens
- Onboarding: permissions explanation (location, exact alarm, optional mic)
- Home: next Azan countdown + today's schedule + master toggle
- Settings: same structure as website (location, mute prefs, ML toggle)
- Notification: system notification at trigger time with "Undo"/"Snooze" actions

### 4.2 States to Design
- First-run / permission request flow
- Active-mute state (visual indicator on home screen while muted)
- Missed-alarm recovery state (app reopened after a missed trigger, if within window)
- Offline state (using last-cached schedule, banner: "Schedule may be outdated")

---

## 5. Design System Basics

| Token | Value (suggested) |
|---|---|
| Primary color | Deep teal / calm green (respectful, non-flashy) |
| Accent | Warm gold (subtle, for highlights only) |
| Font | System font stack (Inter / SF Pro / Roboto) for performance |
| Spacing scale | 4/8/12/16/24/32 px |
| Border radius | 8–12px (soft, modern) |

---

## 6. Accessibility Notes
- All toggles/buttons keyboard-navigable (web)
- Sufficient color contrast for countdown text and status banners
- Screen-reader labels for prayer-time list items and mute toggle states
