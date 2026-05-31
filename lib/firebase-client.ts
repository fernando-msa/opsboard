import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
};

const requiredConfigMap: Array<[envName: string, key: keyof FirebasePublicConfig]> = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY', 'apiKey'],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'authDomain'],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'projectId'],
  ['NEXT_PUBLIC_FIREBASE_APP_ID', 'appId']
];

export function getMissingFirebasePublicConfig(config: FirebasePublicConfig | null) {
  if (!config) {
    return requiredConfigMap.map(([envName]) => envName);
  }

  return requiredConfigMap
    .filter(([, key]) => {
      const value = config[key];
      return !value || String(value).trim().length === 0;
    })
    .map(([envName]) => envName);
}

function hasFirebaseConfig(config: FirebasePublicConfig | null) {
  return getMissingFirebasePublicConfig(config).length === 0;
}

export async function loadFirebasePublicConfig() {
  const response = await fetch('/api/firebase-config', { cache: 'no-store' });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { config?: FirebasePublicConfig };
  return payload.config ?? null;
}

function getFirebaseApp(config: FirebasePublicConfig) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!hasFirebaseConfig(config)) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(config);
}

export function getFirebaseClient(config: FirebasePublicConfig) {
  const app = getFirebaseApp(config);
  if (!app) return null;

  return {
    auth: getAuth(app),
    provider: new GoogleAuthProvider(),
    db: getFirestore(app)
  };
}

export async function initAnalytics(config: FirebasePublicConfig) {
  const app = getFirebaseApp(config);
  if (!app) return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getAnalytics(app);
}
