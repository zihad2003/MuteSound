import { muteAudibleTabs, muteNewAudibleTabs, restoreMutedTabs, RESTORE_ALARM, TAB_WATCH_ALARM } from './lib/mute';
import { getState } from './lib/storage';
import { REFRESH_ALARM, rescheduleAlarms, syncFromAccount } from './lib/sync';
import type { PrayerName } from './lib/types';

chrome.runtime.onInstalled.addListener(() => {
  void syncFromAccount().then(() => rescheduleAlarms());
});

chrome.runtime.onStartup.addListener(() => {
  void syncFromAccount().then(() => rescheduleAlarms());
});

chrome.alarms.onAlarm.addListener((alarm) => {
  void (async () => {
    if (alarm.name === REFRESH_ALARM) {
      await syncFromAccount();
      return;
    }

    if (alarm.name === RESTORE_ALARM) {
      await restoreMutedTabs('auto');
      return;
    }

    if (alarm.name === TAB_WATCH_ALARM) {
      await muteNewAudibleTabs();
      return;
    }

    if (alarm.name.startsWith('mutesound-mute-')) {
      const state = await getState();
      if (!state.masterEnabled || !state.preference) return;
      const prayer = alarm.name.split('-').pop() as PrayerName;
      await muteAudibleTabs(prayer, state.preference.mute_duration_minutes);
    }
  })();
});

chrome.notifications.onButtonClicked.addListener((_id, buttonIndex) => {
  if (buttonIndex === 0) {
    void restoreMutedTabs('undo');
  }
});

chrome.notifications.onClicked.addListener(() => {
  void restoreMutedTabs('undo');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void (async () => {
    try {
      if (message?.type === 'SYNC') {
        const result = await syncFromAccount();
        sendResponse(result);
        return;
      }
      if (message?.type === 'TEST_MUTE') {
        const state = await getState();
        const minutes = state.preference?.mute_duration_minutes ?? 1;
        const count = await muteAudibleTabs('dhuhr', Math.min(minutes, 1));
        sendResponse({ ok: true, count });
        return;
      }
      if (message?.type === 'UNDO_MUTE') {
        await restoreMutedTabs('undo');
        sendResponse({ ok: true });
        return;
      }
      if (message?.type === 'RESCHEDULE') {
        await rescheduleAlarms();
        sendResponse({ ok: true });
        return;
      }
      sendResponse({ ok: false, error: 'Unknown message' });
    } catch (err) {
      sendResponse({ ok: false, error: err instanceof Error ? err.message : 'Error' });
    }
  })();
  return true;
});
