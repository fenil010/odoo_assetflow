import { getProfileData } from "@/actions/profile";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await getProfileData();

  if (!profile) {
    redirect("/login");
  }

  return <ProfilePageClient initialData={profile} />;
}
