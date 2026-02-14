import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
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
