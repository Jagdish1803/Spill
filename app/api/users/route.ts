import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('[USERS_GET] No userId from auth')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('[USERS_GET] Fetching user with clerkId:', userId)

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      console.log('[USERS_GET] Current user not found in database, returning empty array')
      // Return empty array instead of error - user might not be synced yet
      return NextResponse.json([])
    }

    console.log('[USERS_GET] Current user found:', currentUser.id)

    // Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.id,
        },
        isActive: true,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        username: true,
        status: true,
        lastSeen: true,
      },
      orderBy: {
        lastSeen: 'desc',
      },
    })

    console.log('[USERS_GET] Found users:', users.length)
    return NextResponse.json(users)
  } catch (error) {
    console.error('[USERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
