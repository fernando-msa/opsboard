import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const requiredConfig: Array<[key: string, value: string | undefined]> = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['NEXT_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId]
];

export function getMissingFirebasePublicConfig() {
  return requiredConfig.filter(([, value]) => !value).map(([key]) => key);
}

function hasFirebaseConfig() {
  return getMissingFirebasePublicConfig().length === 0;
}

function getFirebaseApp() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!hasFirebaseConfig()) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseClient() {
  const app = getFirebaseApp();
  if (!app) return null;

  return {
    auth: getAuth(app),
    provider: new GoogleAuthProvider(),
    db: getFirestore(app)
  };
}

export async function initAnalytics() {
  const app = getFirebaseApp();
  if (!app) return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getAnalytics(app);
}
