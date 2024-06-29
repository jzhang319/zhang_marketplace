import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "../lib/db";
import { Button } from "@/components/ui/button";
import {
  CreateStripeAccountLink,
  GetStripeStripeDashboardLink,
} from "../action";
import { SubmitButton } from "../components/SubmitButton";
import { unstable_noStore as noStore } from "next/cache";

async function getData(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeConnectedLinked: true,
    },
  });
  return data;
}

export default async function BillingRoute() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const data = await getData(user.id);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8">
      <Card className="">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>All details regarding your payments</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.stripeConnectedLinked === false && (
            <form action={CreateStripeAccountLink}>
              <SubmitButton title="Link your account to Stripe" />
            </form>
          )}
          {data?.stripeConnectedLinked === true && (
            <form action={GetStripeStripeDashboardLink}>
              <SubmitButton title="View Dashboard" />
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
