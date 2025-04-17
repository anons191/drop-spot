'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSupabase } from '@/context/SupabaseProvider'

export default function CreateEventPage() {
  const router = useRouter()
  const { session } = useSupabase()
  const userId = session?.user.id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [strategy, setStrategy] = useState('countdown')
  const [revealTime, setRevealTime] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase
      .from('events')
      .insert({
        organizer_id: userId,
        title,
        description,
        category,
        reveal_strategy: strategy,
        reveal_time: strategy === 'countdown' ? revealTime : null,
        address,
      })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <h1 className="text-2xl mb-6">Create Event</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Event Title"
          className="w-full p-3 bg-gray-800 rounded"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full p-3 bg-gray-800 rounded"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          placeholder="Category (e.g. Rave, Art, Food)"
          className="w-full p-3 bg-gray-800 rounded"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />

        <label className="block">Reveal Strategy</label>
        <select
          value={strategy}
          onChange={e => setStrategy(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        >
          <option value="countdown">Countdown</option>
          <option value="geofence">Geofence</option>
          <option value="manual">Manual Drop</option>
        </select>

        {strategy === 'countdown' && (
          <input
            type="datetime-local"
            value={revealTime}
            onChange={e => setRevealTime(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded"
            required
          />
        )}

        <input
          type="text"
          placeholder="Event Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
          required
        />

        <button
          type="submit"
          className="w-full p-3 bg-gray-700 rounded hover:bg-gray-600"
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Create Event'}
        </button>
      </form>
    </div>
  )
}

