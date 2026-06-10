'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-sm text-center">
          <h1 className="text-lg font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-foreground/60">
            We sent a confirmation link to {email}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <form onSubmit={handleSignup} className="space-y-3">
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
            placeholder="Password (8+ characters)"
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-accent w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        <p className="text-center text-sm text-foreground/60">
          Already have an account?{' '}
          <Link href="/login" className="text-accent underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
