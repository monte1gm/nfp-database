import { db, onAuth, signOutUser } from '/js/firebase.init.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

export async function upsertUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    await updateDoc(userRef, {
      email: user.email || '',
      displayName: user.displayName || '',
      lastLoginAt: serverTimestamp()
    });
    return existing.data();
  }

  await setDoc(userRef, {
    email: user.email || '',
    displayName: user.displayName || '',
    role: 'user',
    enabled: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });

  return {
    email: user.email || '',
    displayName: user.displayName || '',
    role: 'user',
    enabled: false
  };
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
}

export function requireAuth({
  onAuthenticated,
  onUnauthenticated = () => {
    window.location.replace('/login.html');
  }
}) {
  return onAuth(async (user) => {
    if (!user) {
      onUnauthenticated();
      return;
    }

    await onAuthenticated(user);
  });
}

export function wireSignOut(buttonId = 'sign-out') {
  const signOutButton = document.getElementById(buttonId);
  signOutButton?.addEventListener('click', async () => {
    await signOutUser();
    window.location.replace('/login.html');
  });
}
