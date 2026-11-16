import { FormEvent, useState } from 'react';
import { LogIn, ShoppingBasket, UserPlus } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  onSignUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
}

export function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const result = await onSignIn(trimmedEmail, password);
        if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await onSignUp(trimmedEmail, password, displayName);
        if (result.error) {
          setError(result.error);
        } else if (result.needsEmailConfirmation) {
          setNotice(
            'Account created. Check your inbox to confirm your email before signing in, or confirm the user in your Supabase Dashboard.'
          );
          setMode('signin');
          setPassword('');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col items-center text-center">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            aria-hidden="true"
          >
            <ShoppingBasket className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Family Grocery List
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {mode === 'signin'
              ? 'Sign in with your family account to view and add items to your shared list.'
              : 'Create a family member account to collaborate on the shared grocery list.'}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Account mode"
          className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50 dark:bg-[#141614] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => switchMode('signin')}
            className={`min-h-[40px] rounded-xl px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1B1E1B] dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => switchMode('signup')}
            className={`min-h-[40px] rounded-xl px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1B1E1B] dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300"
              >
                Your name
              </label>
              <input
                id="auth-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Mom, Dad, Alex"
                autoComplete="name"
                className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300"
            >
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
          >
            {mode === 'signin' ? (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
