import admin from 'firebase-admin';
import { env } from '../config/env.js';

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) {
    return;
  }

  if (!env.firebaseProjectId) {
    throw new Error('Missing FIREBASE_PROJECT_ID environment variable');
  }

  const hasServiceAccount = Boolean(env.firebaseClientEmail && env.firebasePrivateKey);

  if (hasServiceAccount) {
    admin.initializeApp({
      projectId: env.firebaseProjectId,
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey
      })
    });
  } else {
    admin.initializeApp({
      projectId: env.firebaseProjectId,
      credential: admin.credential.applicationDefault()
    });
  }

  initialized = true;
}

function readBearerToken(headerValue) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function verifyFirebaseAuth(req, res, next) {
  try {
    initFirebaseAdmin();

    const authHeader = req.header('authorization');
    const token = readBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const decoded = await admin.auth().verifyIdToken(token, true);
    req.auth = decoded;
    req.authUid = decoded.uid;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export function getFirestore() {
  initFirebaseAdmin();
  return admin.firestore();
}
