import { auth, getIdToken } from '/js/firebase.init.js';

function normalizeEin(ein) {
  return String(ein || '').replace(/\D/g, '');
}

export async function fetchOrgByEin(ein) {
  const user = auth.currentUser;
  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'unauthorized',
      message: 'Sign in required.'
    };
  }

  const normalized = normalizeEin(ein);
  if (normalized.length !== 9) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_ein',
      message: 'EIN must be exactly 9 digits.'
    };
  }

  const idToken = await getIdToken(user);
  const response = await fetch(`/api/org/${encodeURIComponent(normalized)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      Accept: 'application/json'
    }
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      data: payload
    };
  }

  if (response.status === 401) {
    return { ok: false, status: 401, error: 'unauthorized', message: 'Session expired. Please sign in again.' };
  }
  if (response.status === 403) {
    return { ok: false, status: 403, error: 'forbidden', message: 'Not authorized for this resource.' };
  }
  if (response.status === 404) {
    return { ok: false, status: 404, error: 'not_found', message: 'No organization found for that EIN.' };
  }

  return {
    ok: false,
    status: response.status,
    error: (payload && payload.error) || 'request_failed',
    message: `Request failed (${response.status}).`,
    details: payload
  };
}
