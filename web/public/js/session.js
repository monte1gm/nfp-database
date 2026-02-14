import { auth, onAuth, signOutUser } from '/js/firebase.init.js';

let restoredUserPromise = null;

function authRestoredUser() {
  if (restoredUserPromise) {
    return restoredUserPromise;
  }

  restoredUserPromise = new Promise((resolve) => {
    const unsubscribe = onAuth((user) => {
      unsubscribe();
      resolve(user || null);
    });
  });

  return restoredUserPromise;
}

export async function requireUser() {
  const current = auth.currentUser;
  if (current) {
    return current;
  }

  const restored = await authRestoredUser();
  if (restored) {
    return restored;
  }

  window.location.replace('/login.html');
  throw new Error('Not authenticated');
}

export async function getFreshIdToken(forceRefresh = false) {
  const user = auth.currentUser || (await authRestoredUser());
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.getIdToken(forceRefresh);
}

function buildHeaders(token, providedHeaders) {
  const headers = new Headers(providedHeaders || {});
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

async function redirectSessionExpired() {
  try {
    await signOutUser();
  } catch {
    // Continue to redirect even if sign-out fails.
  }

  const url = new URL('/login.html', window.location.origin);
  url.searchParams.set('reason', 'session_expired');
  window.location.replace(url.toString());
}

export async function apiFetch(path, options = {}) {
  const token = await getFreshIdToken(false);
  const firstResponse = await fetch(path, {
    ...options,
    headers: buildHeaders(token, options.headers)
  });

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const refreshedToken = await getFreshIdToken(true);
  const retryResponse = await fetch(path, {
    ...options,
    headers: buildHeaders(refreshedToken, options.headers)
  });

  if (retryResponse.status === 401) {
    await redirectSessionExpired();
  }

  return retryResponse;
}
