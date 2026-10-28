import { api } from './lib/api';
import { clearAuth, getState, setState } from './lib/storage';
import { PRAYER_LABELS } from './lib/types';

const loginForm = document.getElementById('login-form') as HTMLFormElement;
const loggedIn = document.getElementById('logged-in')!;
const authStatus = document.getElementById('auth-status')!;
const authError = document.getElementById('auth-error')!;
const logoutBtn = document.getElementById('logout')!;
const testMuteBtn = document.getElementById('test-mute')!;
const cityEl = document.getElementById('city')!;
const methodEl = document.getElementById('method')!;
const durationEl = document.getElementById('duration')!;
const prayersEl = document.getElementById('prayers')!;

function showError(message: string | null) {
  if (!message) {
    authError.classList.add('hidden');
    authError.textContent = '';
    return;
  }
  authError.textContent = message;
  authError.classList.remove('hidden');
}

async function render() {
  const state = await getState();
  const signedIn = Boolean(state.auth?.token);
  loginForm.classList.toggle('hidden', signedIn);
  loggedIn.classList.toggle('hidden', !signedIn);
  authStatus.textContent = signedIn ? 'Signed in and ready to sync' : 'Signed out';

  cityEl.textContent = state.location?.city ?? '—';
  methodEl.textContent = state.location?.calculation_method ?? '—';
  durationEl.textContent = state.preference
    ? `${state.preference.mute_duration_minutes} min`
    : '—';
  prayersEl.textContent = state.preference
    ? state.preference.enabled_prayers.map((p) => PRAYER_LABELS[p]).join(', ')
    : '—';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(null);
  const email = (document.getElementById('email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;

  try {
    const auth = await api.login(email, password);
    await setState({ auth });
    const result = await chrome.runtime.sendMessage({ type: 'SYNC' });
    if (!result?.ok) {
      showError(result?.error ?? 'Logged in, but sync failed. Check location on the website.');
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Login failed');
  }
  await render();
});

logoutBtn.addEventListener('click', async () => {
  await clearAuth();
  await chrome.runtime.sendMessage({ type: 'RESCHEDULE' });
  showError(null);
  await render();
});

testMuteBtn.addEventListener('click', async () => {
  const result = await chrome.runtime.sendMessage({ type: 'TEST_MUTE' });
  if (!result?.ok) {
    showError(result?.error ?? 'Test mute failed');
  } else {
    showError(null);
    authStatus.textContent = `Test muted ${result.count ?? 0} tab(s)`;
  }
});

void render();
