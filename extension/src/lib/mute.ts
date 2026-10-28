import { getState, setState } from './storage';
import type { PrayerName } from './types';

const RESTORE_ALARM = 'mutesound-restore';
const TAB_WATCH_ALARM = 'mutesound-tab-watch';

export async function muteAudibleTabs(prayer: PrayerName, durationMinutes: number): Promise<number> {
  const tabs = await chrome.tabs.query({ audible: true });
  const mutedTabIds: number[] = [];

  for (const tab of tabs) {
    if (tab.id == null) continue;
    try {
      await chrome.tabs.update(tab.id, { muted: true });
      mutedTabIds.push(tab.id);
    } catch {
      // tab may have closed
    }
  }

  const startedAt = Date.now();
  const endsAt = startedAt + durationMinutes * 60 * 1000;

  await setState({
    muteSession: {
      active: true,
      prayer,
      mutedTabIds,
      startedAt,
      endsAt,
    },
  });

  await chrome.alarms.create(RESTORE_ALARM, { when: endsAt });
  await chrome.alarms.create(TAB_WATCH_ALARM, { periodInMinutes: 0.5 });

  await chrome.notifications.create(`mutesound-mute-${startedAt}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Azan time — muting active tabs',
    message: `${mutedTabIds.length} tab(s) muted for ${durationMinutes} minutes (${prayer})`,
    buttons: [{ title: 'Undo' }],
    priority: 2,
    requireInteraction: true,
  });

  return mutedTabIds.length;
}

export async function muteNewAudibleTabs(): Promise<void> {
  const state = await getState();
  if (!state.muteSession.active) return;

  const tabs = await chrome.tabs.query({ audible: true });
  const known = new Set(state.muteSession.mutedTabIds);
  const added: number[] = [];

  for (const tab of tabs) {
    if (tab.id == null || known.has(tab.id) || tab.mutedInfo?.muted) continue;
    try {
      await chrome.tabs.update(tab.id, { muted: true });
      added.push(tab.id);
    } catch {
      // ignore
    }
  }

  if (added.length === 0) return;
  await setState({
    muteSession: {
      ...state.muteSession,
      mutedTabIds: [...state.muteSession.mutedTabIds, ...added],
    },
  });
}

export async function restoreMutedTabs(reason: 'auto' | 'undo' = 'auto'): Promise<void> {
  const state = await getState();
  const ids = state.muteSession.mutedTabIds ?? [];

  for (const id of ids) {
    try {
      await chrome.tabs.update(id, { muted: false });
    } catch {
      // tab gone
    }
  }

  await chrome.alarms.clear(RESTORE_ALARM);
  await chrome.alarms.clear(TAB_WATCH_ALARM);

  await setState({
    muteSession: { active: false, mutedTabIds: [] },
  });

  await chrome.notifications.create(`mutesound-restore-${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: reason === 'undo' ? 'Mute undone' : 'Mute window ended',
    message: 'Tab audio restored.',
    priority: 1,
  });
}

export { RESTORE_ALARM, TAB_WATCH_ALARM };
