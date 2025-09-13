// src/app/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect to buyers page if authenticated, otherwise to signin
  if (session) {
    redirect('/buyers')
  } else {
    redirect('/auth/signin')
  }

  return null // This won't render since we're redirecting
}