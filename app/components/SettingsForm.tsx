"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsForm() {
  return (
    <form>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          You can view and change your account settings here
        </CardDescription>
      </CardHeader>
    </form>
  );
}
