import { Card } from "@/components/ui/card";
import { SellForm } from "../components/form/SellForm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function SellRoute() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("You must be logged in to access this page");
  }
  return (
    <section className="max-w-7xl mx-auto md:px-8 mb-14">
      <Card>
        <SellForm />
      </Card>
    </section>
  );
}

