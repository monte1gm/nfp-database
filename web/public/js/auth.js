import {
  onAuth,
  signInWithGooglePopup,
  signOutUser,
  db
} from '/js/firebase.init.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const LOGIN_PATH = '/login.html';
const APP_PATH = '/app.html';

function goToLogin() {
  window.location.replace(LOGIN_PATH);
}

function goToApp() {
  window.location.replace(APP_PATH);
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
}

export async function ensureUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const profile = {
      email: user.email || '',
      displayName: user.displayName || '',
      role: 'user',
      enabled: false,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };

    await setDoc(userRef, profile);
    return {
      created: true,
      profile: {
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'user',
        enabled: false
      }
    };
  }

  const profile = snapshot.data();

  await updateDoc(userRef, {
    email: user.email || '',
    displayName: user.displayName || '',
    lastLoginAt: serverTimestamp()
  });

  return {
    created: false,
    profile
  };
}

// Backward-compatible alias for existing imports.
export const upsertUserProfile = ensureUserProfile;

export function wireSignOut(buttonId = 'sign-out') {
  const signOutButton = document.getElementById(buttonId);
  signOutButton?.addEventListener('click', async () => {
    await signOutUser();
    goToLogin();
  });
}

export function wireGoogleSignIn({
  buttonId = 'google-sign-in',
  errorId = 'login-error'
} = {}) {
  const button = document.getElementById(buttonId);
  const errorEl = document.getElementById(errorId);

  button?.addEventListener('click', async () => {
    if (errorEl) {
      errorEl.textContent = '';
    }

    try {
      await signInWithGooglePopup();
      // Redirect is handled by auth bootstrap after state is confirmed.
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error?.message || 'Sign-in failed.';
      }
    }
  });
}

// Single source of truth for auth lifecycle (no auth.currentUser checks on load).
export function startAuthBootstrap({
  page, // 'login' | 'app' | 'index'
  showLoading = () => {},
  showLogin = () => {},
  showNotAuthorized = () => {},
  loadApp = () => {},
  onError = (error) => {
    console.error('Auth bootstrap failed:', error);
  }
} = {}) {
  showLoading();

  return onAuth(async (user) => {
    try {
      if (!user) {
        if (page === 'login') {
          showLogin();
          return;
        }

        goToLogin();
        return;
      }

      if (page === 'index') {
        goToApp();
        return;
      }

      const { profile, created } = await ensureUserProfile(user);

      if (page === 'login') {
        goToApp();
        return;
      }

      if (created || profile.enabled !== true) {
        showNotAuthorized(user, profile || null);
        return;
      }

      loadApp(user, profile);
    } catch (error) {
      onError(error);
      if (page === 'index') {
        goToLogin();
        return;
      }
      if (page !== 'login') {
        showNotAuthorized();
      }
    }
  });
}
