import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

export async function GET() {
  try {
    // Test trigger event
    const result = await pusherServer.trigger('test-channel', 'test-event', {
      message: 'Testing Pusher connection'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Pusher is working correctly',
      config: {
        appId: process.env.PUSHER_APP_ID,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      }
    })
  } catch (error: any) {
    console.error('Pusher test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      config: {
        appId: process.env.PUSHER_APP_ID ? 'SET' : 'NOT SET',
        key: process.env.NEXT_PUBLIC_PUSHER_KEY ? 'SET' : 'NOT SET',
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? 'SET' : 'NOT SET',
      }
    }, { status: 500 })
  }
}
