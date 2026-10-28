import { api } from './api';
import { buildMuteSchedule } from './schedule';
import { getState, setState } from './storage';

const REFRESH_ALARM = 'mutesound-daily-refresh';

export async function syncFromAccount(): Promise<{ ok: boolean; error?: string }> {
  const state = await getState();
  if (!state.auth?.token) {
    return { ok: false, error: 'Not logged in' };
  }

  try {
    const [location, preference, schedule] = await Promise.all([
      api.getLocation(),
      api.getMutePreference(),
      api.getMyPrayerTimes(),
    ]);

    let deviceId = state.deviceId;
    if (!deviceId) {
      const reg = await api.registerDevice();
      deviceId = reg.device_id;
    }

    await setState({ location, preference, schedule, deviceId });
    await rescheduleAlarms();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Sync failed' };
  }
}

export async function rescheduleAlarms(): Promise<void> {
  const state = await getState();
  const existing = await chrome.alarms.getAll();
  for (const alarm of existing) {
    if (alarm.name.startsWith('mutesound-mute-')) {
      await chrome.alarms.clear(alarm.name);
    }
  }

  if (!state.masterEnabled || !state.schedule || !state.preference) return;

  const items = buildMuteSchedule(state.schedule, state.preference);
  for (const item of items) {
    await chrome.alarms.create(item.alarmName, { when: item.when.getTime() });
  }

  // Refresh schedule overnight
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 5, 0, 0);
  await chrome.alarms.create(REFRESH_ALARM, { when: tomorrow.getTime() });
}

export { REFRESH_ALARM };
