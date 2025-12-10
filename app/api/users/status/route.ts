import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await req.json()

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { 
        status,
        lastSeen: new Date()
      },
    })

    // Broadcast status update to all clients via Pusher
    await pusherServer.trigger('presence-users', 'user-status', {
      userId: user.id,
      status: user.status,
      lastSeen: user.lastSeen,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
