'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  // This effect handles redirecting the user once they are already authenticated.
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleGoogle = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl })
    setLoading(false)
  }

  // While the session is loading or if the user is authenticated and waiting
  // for the redirect, show a loading screen.
  if (status === 'loading' || status === 'authenticated') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // Only show the form if the user is unauthenticated.
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Nyxora</h2>
          <p className="mt-2 text-slate-400">Sign in with Google to continue</p>
        </div>
        

            <div className="mt-8 space-y-6">
              <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white text-black rounded-md">
                <img src="/google-logo.svg" alt="Google" className="w-5 h-5" />
                {loading ? 'Redirecționare...' : 'Sign in with Google'}
              </button>
            </div>
      </div>
    </div>
  )
}