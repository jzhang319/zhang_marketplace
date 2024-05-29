import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="mr-2 h-4 w-4 animate-spin">
          <Loader2 />
          Please Wait
        </Button>
      ) : (
        <Button type="submit">Create your Product</Button>
      )}
    </>
  );
}
