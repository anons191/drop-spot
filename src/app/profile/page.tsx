'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSupabase } from '@/context/SupabaseProvider'

const INTEREST_OPTIONS = [
  'Techno', 'Pop-up Art', 'Foodie', 'Theater', 'Other'
]

export default function ProfilePage() {
  const { session } = useSupabase()
  const userId = session?.user.id

  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load existing profile
useEffect(() => {
  if (!session?.user) return // wait until session is loaded

  async function loadProfile() {
    const { data, error } = await supabase
      .from('users')
      .select('name, default_alias, interests')
      .eq('id', session.user.id)
      .maybeSingle() // ⬅️ use maybeSingle() instead of single()

    if (error) setError(error.message)
    else if (data) {
      setName(data.name ?? '')
      setAlias(data.default_alias ?? '')
      setInterests(data.interests ?? [])
    }

    setLoading(false)
  }

  loadProfile()
}, [session])

  // Save handler
  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update({
        name,
        default_alias: alias,
        interests,
      })
      .eq('id', userId)
    setLoading(false)
    setError(error?.message ?? null)
  }

  const toggleInterest = (tag: string) =>
    setInterests(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )

  if (loading) return <p className="p-4 text-white">Loading…</p>

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <h1 className="text-2xl mb-4">Your Profile</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <label className="block mb-2">Name</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-800 rounded"
      />

      <label className="block mb-2">Default Alias</label>
      <input
        value={alias}
        onChange={e => setAlias(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-800 rounded"
      />

      <label className="block mb-2">Interests</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {INTEREST_OPTIONS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleInterest(tag)}
            className={`px-3 py-1 rounded-full border ${
              interests.includes(tag)
                ? 'bg-white text-black'
                : 'border-white text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 bg-gray-700 rounded hover:bg-gray-600"
      >
        {loading ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  )
}

