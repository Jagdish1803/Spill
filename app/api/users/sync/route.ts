import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const clerkUser = await currentUser()

    if (!clerkUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    // If not, create the user
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
          username: clerkUser.username || null,
        },
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USER_SYNC]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
