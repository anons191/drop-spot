'use client'

import Link from 'next/link'
import { Home, Plus, User } from 'lucide-react'
import { useSupabase } from '@/context/SupabaseProvider'

export function BottomNav() {
  const { session } = useSupabase()
  if (!session) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black text-white flex justify-around py-2">
      <Link href="/">
        <Home size={24} />
      </Link>
      <Link href="/create">
        <Plus size={24} />
      </Link>
      <Link href="/profile">
        <User size={24} />
      </Link>
    </nav>
  )
}

