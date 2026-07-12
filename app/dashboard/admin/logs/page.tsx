import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActivityLogs } from "@/actions/logs";
import ActivityLogsClient from "./ActivityLogsClient";

export default async function ActivityLogsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  // Pre-fetch initial logs on the server (no filter = all logs)
  const initialLogs = isAdmin ? await getActivityLogs() : [];

  return <ActivityLogsClient initialLogs={initialLogs} isAdmin={isAdmin} />;
}
