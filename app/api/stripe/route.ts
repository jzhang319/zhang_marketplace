import prisma from "@/app/lib/db"
import { stripe } from "@/app/lib/stripe"
import { headers } from "next/headers"
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST (req: Request) {
  const body = await req.text()

  const signature = headers().get('Stripe-Signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_SECRET_WEBHOOK as string)
  } catch (error:unknown) {
    return new Response('Webhook Error', { status: 400 })
  }
  switch (event.type) {
    case 'checkout.session.completed' : {
      const session = event.data.object;

      const link = session.metadata?.link


      break;
    }
    default: {
      console.log('Unhandled checkout event')
    }
  }
  return new Response(null, { status: 200 })
}
