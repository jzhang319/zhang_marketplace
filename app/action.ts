"use server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { z } from "zod"

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

  const state: State = {
    status: 'success',
    message: 'Product has been created successfully!'
  }
  return state
}
