import { fetchOrgByEin } from '/js/api.js';
import { startAuthBootstrap, wireSignOut } from '/js/auth.js';

const form = document.getElementById('ein-form');
const einInput = document.getElementById('ein-input');
const submitButton = form?.querySelector('button[type="submit"]');
const resultsEl = document.getElementById('results');
const authWarningEl = document.getElementById('auth-warning');

let canSearch = false;

function normalizeEin(ein) {
  return String(ein || '').replace(/\D/g, '');
}

function formatEin(ein) {
  const raw = normalizeEin(ein).slice(0, 9);
  if (raw.length <= 2) {
    return raw;
  }
  return `${raw.slice(0, 2)}-${raw.slice(2)}`;
}

function renderJson(data) {
  resultsEl.classList.remove('muted');
  resultsEl.textContent = JSON.stringify(data, null, 2);
}

function renderMessage(message, isError = false) {
  resultsEl.classList.toggle('muted', !isError);
  resultsEl.textContent = message;
}

function setSearchEnabled(enabled) {
  canSearch = enabled;
  if (submitButton) {
    submitButton.disabled = !enabled;
  }
  if (einInput) {
    einInput.disabled = !enabled;
  }
}

async function initializeAuthorization() {
  setSearchEnabled(false);
  wireSignOut('sign-out');

  startAuthBootstrap({
    page: 'app',
    showLoading: () => {
      authWarningEl.classList.add('hidden');
      renderMessage('Checking session...');
    },
    showNotAuthorized: () => {
      authWarningEl.classList.remove('hidden');
      setSearchEnabled(false);
      renderMessage('Not authorized. Search is disabled.');
    },
    loadApp: () => {
      authWarningEl.classList.add('hidden');
      setSearchEnabled(true);
      renderMessage('Ready. Enter an EIN and click Search.');
    },
    onError: (error) => {
      console.error('Authorization bootstrap failed:', error);
      authWarningEl.classList.remove('hidden');
      setSearchEnabled(false);
      const message = error?.message || '';
      if (message.includes('Missing or insufficient permissions')) {
        renderMessage('Authorization check failed: Firestore permission denied.', true);
        return;
      }
      renderMessage('Unable to verify authorization state.', true);
    }
  });
}

einInput?.addEventListener('input', (event) => {
  event.target.value = formatEin(event.target.value);
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!canSearch) {
    renderMessage('Not authorized. Search is disabled.');
    return;
  }

  const ein = normalizeEin(einInput.value);
  if (ein.length !== 9) {
    renderMessage('Please enter a valid 9-digit EIN.', true);
    return;
  }

  renderMessage('Searching...');

  const result = await fetchOrgByEin(ein);
  if (!result.ok) {
    renderMessage(result.message || 'Lookup failed.', true);
    return;
  }

  renderJson(result.data);
});

initializeAuthorization();
