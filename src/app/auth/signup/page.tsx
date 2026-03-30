'use client'

import { useActionState } from 'react'
import { signUp, type AuthState } from '@/lib/auth/actions'
import Link from 'next/link'

const initialState: AuthState = { error: null }

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Create account</h1>
        <p className="mb-8 text-sm text-text-secondary">Join Tennez and rate matches with fans worldwide</p>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              placeholder="Min 8 characters"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-rating-low/10 px-3 py-2 text-sm text-rating-low" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg-primary transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
