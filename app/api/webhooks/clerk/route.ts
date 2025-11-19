import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email: email_addresses[0].email_address,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
        username: username || null,
      },
      create: {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
        username: username || null,
      },
    })
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    await prisma.user.delete({
      where: { clerkId: id },
    })
  }

  return new Response('', { status: 200 })
}
