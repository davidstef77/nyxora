"use client"

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', { username: 'admin', password, loginType: 'admin', redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Autentificare admin eșuată')
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-md w-full p-8 bg-slate-800/50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Parolă Admin</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-700/60" />
          </div>
          {error && <div className="text-red-400">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-cyan-500 px-4 py-2 rounded text-white">Autentifică-te</button>
            <Link href="/" className="text-slate-300 px-4 py-2 rounded border border-slate-600">Înapoi</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
