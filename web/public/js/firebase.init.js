import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'TODO_FIREBASE_API_KEY',
  authDomain: 'TODO_FIREBASE_AUTH_DOMAIN',
  projectId: 'TODO_FIREBASE_PROJECT_ID',
  storageBucket: 'TODO_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'TODO_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'TODO_FIREBASE_APP_ID'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
