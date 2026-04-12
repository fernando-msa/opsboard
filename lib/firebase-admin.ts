import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

function getFirebaseAdminApp() {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin env vars ausentes. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.');
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });

  return adminApp;
}

export async function verifyFirebaseIdToken(idToken: string) {
  const app = getFirebaseAdminApp();
  return getAuth(app).verifyIdToken(idToken);
}
