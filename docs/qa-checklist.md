# Phase 5 — QA checklist

Run before beta / store submit. Mark results in a copy or issue tracker.

## QA-01 Prayer-time accuracy

- [ ] Set location to Dhaka; compare today's times vs IslamicFinder / official source (±2 min)
- [ ] Change city (e.g. London); confirm `GET /prayer-times/me` updates after save
- [ ] After midnight / cron, next day cache populated (backend logs or DB `prayer_schedules`)

## QA-02 Extension mute edge cases

- [ ] Mute starts at scheduled time; audible tabs silenced
- [ ] Auto-restore after duration
- [ ] New audible tab opened mid-window gets muted
- [ ] Undo notification restores volume
- [ ] Master toggle off skips future alarms
- [ ] Relogin / sync refreshes schedule

## QA-03 Android Doze / reliability (device or emulator)

- [ ] Exact alarm permission granted
- [ ] Mute fires with screen off
- [ ] After reboot, windows reschedule (`BootCompletedReceiver`)
- [ ] Foreground notification Undo / Snooze works
- [ ] FCM `schedule_updated` triggers resync when Firebase configured

## QA-04 Beta

- [ ] 3–5 testers on Chrome + Android
- [ ] Collect false mute / missed mute reports
- [ ] Confirm privacy/terms links load on production URL

## QA-05 Store review

- [ ] Chrome Web Store package + listing (`docs/store-listing.md`)
- [ ] Play Console data safety + listing (after `flutter build appbundle`)

## Automated smoke

```powershell
# Backend must be running on :3000
cd backend
powershell -File smoke.ps1
powershell -File ..\scripts\check-env.ps1
```
