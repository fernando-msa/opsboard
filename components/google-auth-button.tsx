'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseClient, getMissingFirebasePublicConfig, initAnalytics } from '@/lib/firebase-client';

export function GoogleAuthButton({ mode }: { mode: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [missingConfig, setMissingConfig] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    initAnalytics();
    const firebase = getFirebaseClient();
    if (!firebase) {
      setEnabled(false);
      setMissingConfig(getMissingFirebasePublicConfig());
    }
  }, []);

  async function handleGoogleAuth() {
    setLoading(true);
    setError('');

    try {
      const firebase = getFirebaseClient();
      if (!firebase) {
        const missing = getMissingFirebasePublicConfig();
        const details = missing.length > 0 ? ` Faltando: ${missing.join(', ')}.` : '';
        throw new Error(
          `Google Auth indisponível no bundle do cliente.${details} Após salvar no Render, faça novo deploy para rebuild.`
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
            ? ` Variáveis ausentes no cliente: ${missingConfig.join(', ')}.`
            : ' Revise as variáveis NEXT_PUBLIC_FIREBASE_* no deploy.'}{' '}
          Após alterar no Render, faça novo deploy.
        </p>
      ) : null}
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
