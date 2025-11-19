import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

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

    return NextResponse.json(users)
  } catch (error) {
    console.error('[USERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
