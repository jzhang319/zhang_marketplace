"use client";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "../SubmitButton";
import { useFormState } from "react-dom";
import { UpdateUserSettings, State } from "../../action";
import { useEffect } from "react";
import { toast } from "sonner";

interface userProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function SettingsForm({ email, firstName, lastName }: userProps) {
  const initialState: State = { message: "", status: undefined };
  const [state, formAction] = useFormState(UpdateUserSettings, initialState);

  useEffect(() => {
    if (state?.status === "success") {
      toast.error(state.message);
    } else if (state?.status === "error") {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          You can view and change your account settings here
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <Label>First Name</Label>
          <Input name="firstName" defaultValue={firstName} type="text" />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Last Name</Label>
          <Input name="lastName" defaultValue={lastName} type="text" />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Email</Label>
          <Input name="email" defaultValue={email} type="email" disabled />
        </div>
      </CardContent>
      <CardFooter>
        <SubmitButton title="Update your settings" />
      </CardFooter>
    </form>
  );
}

// https://app.theheadstarter.com/auth/create-account?team=XQDXCV
// XQDXCV

// resume keywords for SWE
// built
// implemented
// designed
// created
// developed
