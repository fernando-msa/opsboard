'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebasePublicConfig, getFirebaseClient, initAnalytics, loadFirebasePublicConfig } from '@/lib/firebase-client';

export function GoogleAuthButton({ mode }: { mode: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [missingConfig, setMissingConfig] = useState<string[]>([]);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebasePublicConfig | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      const config = await loadFirebasePublicConfig();
      if (cancelled) return;

      setFirebaseConfig(config);
      if (!config) {
        setEnabled(false);
        setMissingConfig(['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID']);
        return;
      }

      setEnabled(true);
      setMissingConfig([]);
      initAnalytics(config);
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGoogleAuth() {
    setLoading(true);
    setError('');

    try {
      const config = firebaseConfig ?? (await loadFirebasePublicConfig());
      const firebase = config ? getFirebaseClient(config) : null;
      if (!firebase) {
        const details = missingConfig.length > 0 ? ` Faltando: ${missingConfig.join(', ')}.` : '';
        throw new Error(
          `Google Auth indisponível no cliente.${details} Verifique a rota /api/firebase-config e as variáveis do Render.`
        );
      }

      const authResult = await signInWithPopup(firebase.auth, firebase.provider);
      const idToken = await authResult.user.getIdToken();

      await addDoc(collection(firebase.db, 'auth_events'), {
        email: authResult.user.email,
        provider: 'google',
        mode,
        createdAt: serverTimestamp()
      });

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        throw new Error('Falha ao autenticar com Google no servidor.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Falha na autenticação com Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading || !enabled}
        onClick={handleGoogleAuth}
        className="w-full rounded-lg border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Conectando...' : 'Entrar com Google'}
      </button>
      {!enabled ? (
        <p className="text-xs text-amber-400">
          Google Auth desativado.
          {missingConfig.length > 0
            ? ` Variáveis ausentes: ${missingConfig.join(', ')}.`
            : ' Revise a rota /api/firebase-config e o deploy.'}
        </p>
      ) : null}
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
