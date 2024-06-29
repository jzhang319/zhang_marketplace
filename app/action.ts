"use server"


import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { z } from "zod"
import prisma from "./lib/db";
import { type CategoryTypes } from "@prisma/client";
import { stripe } from "./lib/stripe";
import { redirect } from "next/navigation";

export type State = {
  status: "error" | "success" | undefined;
  errors?: {
    [key: string]: string[];
  }
  message?: string | null;
}

const productSchema = z.object({
  name: z.string().min(3, {message: "Name must be at least 3 characters long"}),
  category: z.string().min(1, {message: "Category is required"}),
  price: z.number().min(1, {message: "Price must be at least $1"}),
  smallDescription: z.string().min(10, {message: "Please summarize your product more"}),
  description: z.string().min(10, {message: "Description is required"}),
  images: z.array(z.string(), {message: "At least one image is required"}),
  productFile: z.string().min(1, {message: "Please upload a zip file for your product"})
})

const userSettingsSchema = z.object({
  firstName: z.string().min(3, {message: "First name must be at least 3 characters long"}).or(z.literal('')).optional(),
  lastName: z.string().min(3, {message: "Last name must be at least 3 characters long"}).or(z.literal('')).optional(),
  email: z.string().email({message: "Please enter a valid email"})
})

export async function SellProduct(prevState: any, formData: FormData){
  const {getUser} = getKindeServerSession()
  const user = await getUser()

  if(!user){
    throw new Error("Something went wrong")
  }

  const validateFields = productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    smallDescription: formData.get("smallDescription"),
    description: formData.get("description"),
    images: JSON.parse(formData.get("images") as string),
    productFile: (formData.get("productFile"))
  })

  if(!validateFields.success){
    const state: State = {
      status: 'error',
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Opps! I think there is a mistake with your form',
    };

    return state
  }

  const data = await prisma.product.create({
    data: {
      name: validateFields.data.name,
      category: validateFields.data.category as CategoryTypes,
      price: validateFields.data.price,
      smallDescription: validateFields.data.smallDescription,
      description: JSON.parse(validateFields.data.description),
      images: validateFields.data.images,
      productFile: validateFields.data.productFile,
      userId: user.id,
    }
  })

return redirect(`/product/${data.id}`)
}


export async function UpdateUserSettings(prevState: any, formData: FormData) {
  const {getUser} = getKindeServerSession()
  const user = await getUser()

  if(!user){
    throw new Error("Something went wrong")
  }

  const validateFields = userSettingsSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  })

  if(!validateFields.success){
    const state: State = {
      status: 'error',
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Opps! I think there is a mistake with your form',
    };

    return state
  }
  const data = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      firstName: validateFields.data.firstName,
      lastName: validateFields.data.lastName,
    }
  })
  const state: State = {
    status: 'success',
    message: 'User settings have been updated successfully!'
  }
  return state
}


export async function BuyProduct(FormData: FormData){
  const id = FormData.get('id') as string
  const data = await prisma.product.findUnique({
    where: {
      id: id,
    },
    select: {
      name: true,
      smallDescription: true,
      price: true,
      images: true,
      productFile: true,
      User: {
        select:{
          connectedAccountId: true,
        }
      }
    }
  })

  const baseUrl = process.env.DEPLOYMENT_BASE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(data?.price as number * 100),
          product_data: {
            name: data?.name as string,
            description: data?.smallDescription,
            images: data?.images,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      link: data?.productFile as string,
    },
    payment_intent_data: {
      application_fee_amount: (Math.round(data?.price as number * 100)) * 0.1,
      transfer_data: {
        destination: data?.User?.connectedAccountId as string,
      },
    },
    success_url: `${baseUrl}/payment/success`,
    cancel_url: `${baseUrl}/payment/cancel`,
  })
  return redirect(session.url as string)
}

export async function CreateStripeAccountLink(){
  const {getUser} = getKindeServerSession()
  const user = await getUser()
  if(!user){
    throw new Error("Unauthorized")
  }
  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      connectedAccountId: true,
    },
  })

  const baseUrl = process.env.DEPLOYMENT_BASE_URL;

  const accountLink = await stripe.accountLinks.create({
    account: data?.connectedAccountId as string,
    refresh_url: `${baseUrl}/billing`,
    return_url: `${baseUrl}/return/${data?.connectedAccountId}`,
    type: 'account_onboarding',
  })
  return redirect(accountLink.url)
}

export async function GetStripeStripeDashboardLink(){
  const {getUser} = getKindeServerSession()
  const user = await getUser()
  if(!user){
    throw new Error()
  }
  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      connectedAccountId: true,
    },
  })
  const loginlink = await stripe.accounts.createLoginLink(
    data?.connectedAccountId as string
  )
  return redirect(loginlink.url)
}
