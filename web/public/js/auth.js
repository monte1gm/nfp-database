import { auth, db, googleProvider } from './firebase.init.js';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    await updateDoc(userRef, {
      email: user.email || '',
      displayName: user.displayName || '',
      lastLoginAt: serverTimestamp()
    });
    return;
  }

  await setDoc(userRef, {
    email: user.email || '',
    displayName: user.displayName || '',
    role: 'user',
    enabled: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });
}

function setupLoginPage() {
  const signInButton = document.getElementById('google-sign-in');
  const errorEl = document.getElementById('login-error');

  signInButton?.addEventListener('click', async () => {
    errorEl.textContent = '';

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDocument(result.user);
      window.location.replace('./app.html');
    } catch (error) {
      errorEl.textContent = error?.message || 'Sign-in failed.';
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.replace('./app.html');
    }
  });
}

function setupAppPage() {
  const signOutButton = document.getElementById('sign-out');

  signOutButton?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.replace('./login.html');
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.replace('./login.html');
      return;
    }

    try {
      await ensureUserDocument(user);
    } catch (_error) {
      // Allow app bootstrap to continue; UI will surface authorization state.
    }
  });
}

const page = document.body.dataset.page;
if (page === 'login') {
  setupLoginPage();
}
if (page === 'app') {
  setupAppPage();
}
