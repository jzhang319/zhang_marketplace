import prisma from "@/app/lib/db";
import { stripe } from "@/app/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import {unstable_noStore as noStore} from 'next/cache'


export async function GET() {
  noStore()
  const {getUser} = getKindeServerSession()
  const user = await getUser();

  if(!user || user === null || !user.id){
    throw new Error("Something went wrong ...");
  }

  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if(!dbUser){
    const account = await stripe.accounts.create({
      email: user.email as string,
      controller: {
        losses: {
          payments: 'application'
        },
        fees: {
          payer: 'application'
        },
        stripe_dashboard: {
          type: 'express'
        }
      }
    })

    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
        email: user.email ?? "",
        profileImage: user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
        connectedAccountId: account.id,
      },
    });
  }

  let redirectUrl = 'http://localhost:3000'; // Default to local development

  if (process.env.NODE_ENV === 'production') {
    switch (process.env.DEPLOYMENT_PLATFORM) {
        case 'vercel':
            redirectUrl = 'https://zhang-marketplace.vercel.app/';
            break;
        case 'render':
            redirectUrl = 'https://other-platform-url.com/';
            break;
        // Add more cases as needed for additional platforms
        default:
            // Optionally handle unknown deployment platforms
            break;
    }
  }

  return NextResponse.redirect(redirectUrl);
}
