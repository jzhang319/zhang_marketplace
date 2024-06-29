import { Card } from "@/components/ui/card";
import { SellForm } from "../components/form/SellForm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "../lib/db";
import { redirect } from "next/navigation";

async function getData(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeConnectedLinked: true,
    },
  });
  if (data?.stripeConnectedLinked === false) {
    return redirect("/billing");
  }
  return null;
}

export default async function SellRoute() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("You must be logged in to access this page");
  }
  const data = await getData(user.id);
  return (
    <section className="max-w-7xl mx-auto md:px-8 mb-14">
      <Card>
        <SellForm />
      </Card>
    </section>
  );
}
