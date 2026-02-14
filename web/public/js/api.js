import { auth } from './firebase.init.js';

function normalizeEin(ein) {
  return String(ein || '').replace(/\D/g, '');
}

export async function fetchOrgByEin(ein) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const normalized = normalizeEin(ein);
  if (normalized.length !== 9) {
    throw new Error('EIN must be exactly 9 digits');
  }

  const token = await user.getIdToken();
  const response = await fetch(`/api/org/${encodeURIComponent(normalized)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return response.json();
}
