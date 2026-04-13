import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';

type ServiceAccountJson = {
  project_id: string;
  client_email: string;
  private_key: string;
};

let adminApp: App;

function getServiceAccountFromEnv() {
  let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!rawJson) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
      try {
        rawJson = readFileSync(serviceAccountPath, 'utf-8');
      } catch {
        throw new Error(
          `Não foi possível ler FIREBASE_SERVICE_ACCOUNT_PATH (${serviceAccountPath}). Verifique se o arquivo existe e se o caminho está correto.`
        );
      }
    }
  }

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as ServiceAccountJson;
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key?.replace(/\\n/g, '\n')
      };
    } catch {
      throw new Error(
        'Service account inválida. Verifique FIREBASE_SERVICE_ACCOUNT_JSON (ou o arquivo em FIREBASE_SERVICE_ACCOUNT_PATH).'
      );
    }
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };
}

function getFirebaseAdminApp() {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const { projectId, clientEmail, privateKey } = getServiceAccountFromEnv();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin env vars ausentes. Configure FIREBASE_SERVICE_ACCOUNT_JSON (ou FIREBASE_SERVICE_ACCOUNT_PATH) ou FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
    );
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
