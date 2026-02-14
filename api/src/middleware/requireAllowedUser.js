import { getFirestore } from './verifyFirebaseAuth.js';

async function loadUserDoc(uid) {
  const db = getFirestore();
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    return null;
  }

  return snap.data();
}

export async function requireAllowedUser(req, res, next) {
  try {
    const uid = req.authUid;
    if (!uid) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const userDoc = await loadUserDoc(uid);
    if (!userDoc || userDoc.enabled !== true) {
      return res.status(403).json({ error: 'forbidden' });
    }

    req.allowedUser = userDoc;
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'forbidden' });
  }
}

export function requireRole(_requiredRole) {
  return (_req, _res, next) => {
    // Stub: role-based checks can be added here later.
    return next();
  };
}
