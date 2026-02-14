import { apiFetch } from '/js/session.js';

function normalizeEin(ein) {
  return String(ein || '').replace(/\D/g, '');
}

async function parseJsonIfAny(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchOrgByEin(ein) {
  const normalized = normalizeEin(ein);
  if (normalized.length !== 9) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_ein',
      message: 'EIN must be exactly 9 digits.'
    };
  }

  let response;
  try {
    response = await apiFetch(`/api/org/${encodeURIComponent(normalized)}`, {
      method: 'GET'
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'network_error',
      message: 'Network error. Please try again.'
    };
  }

  const payload = await parseJsonIfAny(response);

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      data: payload
    };
  }

  if (response.status === 401) {
    return {
      ok: false,
      status: 401,
      error: 'unauthorized',
      message: 'Session expired. Please sign in again.'
    };
  }

  if (response.status === 403) {
    return {
      ok: false,
      status: 403,
      error: 'forbidden',
      message: 'Not authorized for this resource.'
    };
  }

  if (response.status === 404) {
    return {
      ok: false,
      status: 404,
      error: 'not_found',
      message: 'No organization found for that EIN.'
    };
  }

  return {
    ok: false,
    status: response.status,
    error: (payload && payload.error) || 'request_failed',
    message: `Request failed (${response.status}).`,
    details: payload
  };
}
