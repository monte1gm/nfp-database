import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAUnRUGVYGAndVYYdrGYtHPMiI3_dx7Zvc",
  authDomain: "nfp-dataload.firebaseapp.com",
  projectId: "nfp-dataload",
  storageBucket: "nfp-dataload.firebasestorage.app",
  messagingSenderId: "1011179966717",
  appId: "1:1011179966717:web:693a7865bb35df14816e94",
  measurementId: "G-QKN2NXKHL0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return signOut(auth);
}

export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function getIdToken(user) {
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.getIdToken();
}
