"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!session) {
    // If not authenticated, redirect to signin
    if (typeof window !== 'undefined') router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-md w-full p-8 bg-slate-800/50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Profilul meu</h2>
        <div className="flex items-center gap-4">
          {session.user?.image ? (
            <img src={session.user.image} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">?
            </div>
          )}
          <div>
            <div className="font-semibold">{session.user?.name || 'Nume utilizator'}</div>
            <div className="text-sm text-slate-400">{session.user?.email}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-500 px-4 py-2 rounded text-white">Sign out</button>
          <button onClick={() => router.push('/')} className="px-4 py-2 rounded border border-slate-600">Înapoi</button>
        </div>
      </div>
    </div>
  )
}
