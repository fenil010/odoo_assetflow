import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileData } from "@/actions/profile";
import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await getProfileData();

  if (!profile) {
    redirect("/login");
  }

  return <SettingsPageClient initialData={profile} />;
}
