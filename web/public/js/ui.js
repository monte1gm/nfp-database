import { auth, db } from './firebase.init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { fetchOrgByEin } from './api.js';

const form = document.getElementById('ein-form');
const einInput = document.getElementById('ein-input');
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

async function evaluateAuthorization(user) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const enabled = snapshot.exists() && snapshot.data().enabled === true;

  if (!enabled) {
    canSearch = false;
    form.querySelector('button[type="submit"]').disabled = true;
    einInput.disabled = true;
    authWarningEl.classList.remove('hidden');
    renderMessage('Not authorized. Search is disabled.');
    return;
  }

  canSearch = true;
  form.querySelector('button[type="submit"]').disabled = false;
  einInput.disabled = false;
  authWarningEl.classList.add('hidden');
  renderMessage('Ready. Enter an EIN and click Search.');
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return;
  }

  try {
    await evaluateAuthorization(user);
  } catch (_error) {
    canSearch = false;
    form.querySelector('button[type="submit"]').disabled = true;
    einInput.disabled = true;
    authWarningEl.classList.remove('hidden');
    renderMessage('Unable to verify authorization state.');
  }
});

einInput?.addEventListener('input', (event) => {
  const formatted = formatEin(event.target.value);
  event.target.value = formatted;
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

  try {
    const payload = await fetchOrgByEin(ein);
    renderJson(payload);
  } catch (error) {
    renderMessage(error?.message || 'Lookup failed.', true);
  }
});
