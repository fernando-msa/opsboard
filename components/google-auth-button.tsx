'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firestore, googleProvider, initAnalytics } from '@/lib/firebase-client';

export function GoogleAuthButton({ mode }: { mode: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    initAnalytics();
  }, []);

  async function handleGoogleAuth(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authResult = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await authResult.user.getIdToken();

      await addDoc(collection(firestore, 'auth_events'), {
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
        disabled={loading}
        onClick={() => handleGoogleAuth()}
        className="w-full rounded-lg border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Conectando...' : 'Entrar com Google'}
      </button>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
