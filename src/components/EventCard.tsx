'use client'

import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'
import { useSupabase } from '@/context/SupabaseProvider'

export interface Event {
  id: string
  title: string
  category: string
  address: string
  reveal_time: string
}

export default function EventCard({ event }: { event: Event }) {
  const { session } = useSupabase()
  const userId = session?.user.id

  // Hydration guard
  const [mounted, setMounted] = useState(false)
  // Live clock for countdown
  const [now, setNow] = useState<Date>(new Date())
  const [subscribed, setSubscribed] = useState<boolean>(false)
  const [rsvpLoading, setRsvpLoading] = useState<boolean>(false)
  const [alias, setAlias] = useState<string>('')

  // Start the clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Mark as mounted to avoid SSR/client mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if already subscribed
  useEffect(() => {
    if (!userId) return
    supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', event.id)
      .then(({ data }) => {
        setSubscribed(Array.isArray(data) && data.length > 0)
      })
  }, [userId, event.id])

  // Load user's default alias
  useEffect(() => {
    if (!userId) return
    supabase
      .from('users')
      .select('default_alias')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.default_alias) setAlias(data.default_alias)
      })
  }, [userId])

  // RSVP action
  const handleRsvp = async () => {
    if (!userId) return
    setRsvpLoading(true)
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      event_id: event.id,
      alias: alias || userId.slice(0, 6),
    })
    setRsvpLoading(false)
    if (!error) setSubscribed(true)
  }

  const revealTime = new Date(event.reveal_time)
  const secondsUntil = differenceInSeconds(revealTime, now)
  const isRevealed = secondsUntil <= 0

  return (
    <div className="bg-gray-800 rounded p-4">
      <h2 className="text-xl font-bold">{event.title}</h2>
      <p className="mb-2">{event.category}</p>

      {isRevealed ? (
        <p className="bg-gray-700 p-2 rounded">📍 {event.address}</p>
      ) : (
        <p className="bg-gray-700 p-2 rounded">
          ⏱ {mounted ? `Reveal in ${Math.max(secondsUntil, 0)}s` : 'Reveal in …'}
        </p>
      )}

      {session && (
        <button
          onClick={handleRsvp}
          disabled={rsvpLoading || subscribed}
          className={`mt-4 w-full py-2 rounded ${
            subscribed ? 'bg-gray-600 cursor-default' : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {subscribed ? 'RSVPed' : rsvpLoading ? 'Joining…' : 'RSVP'}
        </button>
      )}
    </div>
  )
}

