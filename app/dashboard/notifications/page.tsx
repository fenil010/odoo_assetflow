import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotificationsAction } from "@/features/notifications/actions/notificationActions";
import { triggerSmartReminders } from "@/actions/reports";
import NotificationsCenterClient from "./NotificationsCenterClient";

export default async function NotificationsCenterPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Trigger smart reminders scan and fetch notifications in parallel on the server
  const [, notifResult] = await Promise.all([
    triggerSmartReminders(),
    getNotificationsAction(),
  ]);

  const initialNotifications = notifResult.success && notifResult.data ? notifResult.data : [];

  return <NotificationsCenterClient initialNotifications={initialNotifications} />;
}
