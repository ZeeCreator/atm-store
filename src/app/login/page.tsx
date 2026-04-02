'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/components/Icon';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-6 md:p-8 bg-surface-container-low rounded-lg border border-outline-variant/15">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-black text-white font-headline uppercase tracking-tighter">
            Admin <span className="text-primary-container">Login</span>
          </h1>
          <p className="text-white/40 text-xs md:text-sm mt-2">
            Enter your credentials to access the admin panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 md:mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-3">
            <Icons.ExclamationCircle className="text-red-500 text-lg md:text-xl" />
            <p className="text-red-500 text-xs md:text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-2 md:py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary pl-10 text-sm md:text-base"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
              <Icons.User className="absolute left-3 top-2.5 md:top-3.5 text-white/40 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-2 md:py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary pl-10 text-sm md:text-base"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <Icons.Lock className="absolute left-3 top-2.5 md:top-3.5 text-white/40 text-sm" />
            </div>
            <p className="text-white/40 text-xs mt-2">
              Default: admin / admin
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-primary to-primary-container px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
          >
            {loading ? (
              <>
                <Icons.Spinner className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Icons.Check className="text-sm" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Back to Home */}
        <div className="mt-4 md:mt-6 text-center">
          <a
            href="/"
            className="text-white/40 text-xs md:text-sm hover:text-primary transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
