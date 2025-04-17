// src/app/feed/page.tsx
import { supabase } from '@/lib/supabaseClient'
import EventCard from '@/components/EventCard'

export default async function FeedPage() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'draft')     // or only public events
    .order('reveal_time', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <h1 className="text-2xl mb-6">Event Feed</h1>
      <div className="space-y-4">
        {events?.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

