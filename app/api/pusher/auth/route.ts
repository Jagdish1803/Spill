import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('[PUSHER_AUTH] Unauthorized - no userId')
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const body = await req.text()
    const params = new URLSearchParams(body)

    const socketId = params.get('socket_id')
    const channel = params.get('channel_name')

    console.log('[PUSHER_AUTH] Authenticating:', { socketId, channel, userId })

    if (!socketId || !channel) {
      console.log('[PUSHER_AUTH] Missing required fields')
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // For private channels, just authorize
    const authResponse = pusherServer.authorizeChannel(socketId, channel)
    console.log('[PUSHER_AUTH] Authorization successful:', authResponse)

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('[PUSHER_AUTH] Error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
