'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push('/feed');
    router.refresh();
  }

  async function handleOAuth(provider: 'google' | 'github') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-accent w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="space-y-2">
          <button className="input hover:bg-muted" onClick={() => handleOAuth('google')}>
            Continue with Google
          </button>
          <button className="input hover:bg-muted" onClick={() => handleOAuth('github')}>
            Continue with GitHub
          </button>
        </div>
        <p className="text-center text-sm text-foreground/60">
          No account?{' '}
          <Link href="/signup" className="text-accent underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
