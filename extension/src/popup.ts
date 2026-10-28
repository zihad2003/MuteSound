import { formatCountdown, nextPrayer } from './lib/schedule';
import { getState, setState } from './lib/storage';
import { PRAYER_LABELS } from './lib/types';

const statusEl = document.getElementById('status')!;
const countdownEl = document.getElementById('countdown')!;
const nextDetailEl = document.getElementById('next-detail')!;
const masterEl = document.getElementById('master') as HTMLInputElement;
const muteBannerEl = document.getElementById('mute-banner')!;
const undoEl = document.getElementById('undo')!;
const syncEl = document.getElementById('sync')!;

async function render() {
  const state = await getState();
  masterEl.checked = state.masterEnabled;

  if (!state.auth) {
    statusEl.textContent = 'Not configured';
    countdownEl.textContent = '—';
    nextDetailEl.textContent = 'Open Settings to log in';
  } else if (!state.schedule || !state.preference) {
    statusEl.textContent = 'Logged in · needs sync';
    countdownEl.textContent = '—';
    nextDetailEl.textContent = 'Tap Sync now';
  } else {
    statusEl.textContent = state.masterEnabled ? 'Active' : 'Paused';
    const next = nextPrayer(state.schedule, state.preference);
    if (!next) {
      countdownEl.textContent = '—';
      nextDetailEl.textContent = `No remaining prayers today · ${state.location?.city ?? ''}`;
    } else {
      countdownEl.textContent = formatCountdown(next.when.getTime() - Date.now());
      nextDetailEl.textContent = `${PRAYER_LABELS[next.prayer]} at ${state.schedule[next.prayer]} · ${state.location?.city ?? ''}`;
    }
  }

  muteBannerEl.classList.toggle('hidden', !state.muteSession.active);
}

masterEl.addEventListener('change', async () => {
  await setState({ masterEnabled: masterEl.checked });
  await chrome.runtime.sendMessage({ type: 'RESCHEDULE' });
  await render();
});

syncEl.addEventListener('click', async () => {
  syncEl.textContent = 'Syncing…';
  const result = await chrome.runtime.sendMessage({ type: 'SYNC' });
  syncEl.textContent = 'Sync now';
  if (!result?.ok) {
    statusEl.textContent = result?.error ?? 'Sync failed';
  }
  await render();
});

undoEl.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'UNDO_MUTE' });
  await render();
});

void render();
setInterval(() => {
  void render();
}, 1000);
