import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, isTyping } = await req.json()

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create channel name (same as messages)
    const channelName = `private-chat-${[currentUser.id, receiverId].sort().join('-')}`

    // Trigger typing event
    await pusherServer.trigger(channelName, 'typing', {
      userId: currentUser.id,
      userName: currentUser.firstName || 'User',
      isTyping,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending typing event:', error)
    return NextResponse.json({ error: 'Failed to send typing event' }, { status: 500 })
  }
}
