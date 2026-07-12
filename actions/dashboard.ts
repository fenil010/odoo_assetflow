"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AssetStatus, BookingStatus, AllocationStatus, Role, MaintenanceStatus } from "@prisma/client";

export async function getDashboardMetrics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const now = new Date();

    // 1. Core KPIs
    const assetsAvailable = await db.asset.count({
      where: { status: AssetStatus.AVAILABLE, deletedAt: null },
    });

    const assetsAllocated = await db.asset.count({
      where: { status: AssetStatus.ALLOCATED, deletedAt: null },
    });

    const activeBookings = await db.resourceBooking.count({
      where: { status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] } },
    });

    const maintenanceToday = await db.asset.count({
      where: { status: AssetStatus.UNDER_MAINTENANCE, deletedAt: null },
    });

    // 2. Overdue return alerts
    const overdueAllocations = await db.allocation.findMany({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturnDate: { lt: now },
      },
      include: {
        asset: { select: { tag: true, name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { expectedReturnDate: "asc" },
      take: 5,
    });

    // 3. Recent activity logs (for audit log timeline feed)
    const recentActivities = await db.activityLog.findMany({
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    // 4. Pending Maintenance Requests requiring manager approval
    const pendingMaintenance = await db.maintenanceRequest.findMany({
      where: { status: MaintenanceStatus.PENDING },
      include: {
        asset: { select: { tag: true, name: true } },
        raisedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 5. Role specific counts
    // For normal employees: count of their allocated assets
    const myAssetsCount = await db.asset.count({
      where: { currentHolderId: session.user.id, deletedAt: null },
    });

    const myBookingsCount = await db.resourceBooking.count({
      where: {
        userId: session.user.id,
        status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
      },
    });

    return {
      kpis: {
        assetsAvailable,
        assetsAllocated,
        activeBookings,
        maintenanceToday,
      },
      overdueReturns: overdueAllocations,
      activities: recentActivities,
      pendingMaintenance,
      personal: {
        myAssetsCount,
        myBookingsCount,
      },
    };
  } catch (error) {
    console.error("Failed to load dashboard metrics:", error);
    return null;
  }
}
