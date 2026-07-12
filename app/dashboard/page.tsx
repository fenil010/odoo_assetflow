import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Package,
  Calendar,
  AlertTriangle,
  Wrench,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { getDashboardMetrics } from "@/actions/dashboard";
import { getAssets } from "@/actions/assets";
import { getEmployees } from "@/actions/org";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import { revalidatePath } from "next/cache";
import { transitionMaintenance } from "@/actions/maintenance";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch metrics directly on the server
  const metrics = await getDashboardMetrics();

  const isPowerUser = ["ADMIN", "ASSET_MANAGER"].includes(session.user.role);

  // Pre-fetch assets and employees on the server for quick action modals
  let assets: any[] = [];
  let employees: any[] = [];

  if (isPowerUser) {
    const [assetList, employeeList] = await Promise.all([
      getAssets(),
      getEmployees(),
    ]);
    assets = assetList || [];
    employees = employeeList || [];
  }

  const handleQuickApprove = async (formData: FormData) => {
    "use server";
    const requestId = formData.get("requestId") as string;
    if (requestId) {
      await transitionMaintenance({
        requestId,
        status: "APPROVED",
      });
      revalidatePath("/dashboard");
    }
  };

  const kpis = metrics?.kpis || {
    assetsAvailable: 0,
    assetsAllocated: 0,
    activeBookings: 0,
    maintenanceToday: 0,
  };

  const overdue = metrics?.overdueReturns || [];
  const activities = metrics?.activities || [];
  const personal = metrics?.personal || { myAssetsCount: 0, myBookingsCount: 0 };

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Welcome back, {session.user.name}</h1>
          <p className="text-sm text-zinc-500 mt-1">Here is a summary of your organization's assets and booking status today.</p>
        </div>

        {/* Quick Personal Status badges */}
        <div className="mt-4 md:mt-0 flex gap-3 text-xs">
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 flex flex-col font-medium shadow-sm">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">My Custody</span>
            <span className="text-zinc-950 font-black text-sm mt-0.5">{personal.myAssetsCount} Assets</span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 flex flex-col font-medium shadow-sm">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">My Bookings</span>
            <span className="text-zinc-950 font-black text-sm mt-0.5">{personal.myBookingsCount} Active</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        
        {/* KPI: Available */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Assets Available</span>
            <Package className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-950 tracking-tight">{kpis.assetsAvailable}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Ready for immediate allocation</p>
          </div>
        </div>

        {/* KPI: Allocated */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Assets Allocated</span>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-950 tracking-tight">{kpis.assetsAllocated}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Currently in use by employees</p>
          </div>
        </div>

        {/* KPI: Bookings */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Active Bookings</span>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-950 tracking-tight">{kpis.activeBookings}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Shared resource reservations</p>
          </div>
        </div>

        {/* KPI: Maintenance */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Under Repair</span>
            <Wrench className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-950 tracking-tight">{kpis.maintenanceToday}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Assets currently under repair</p>
          </div>
        </div>
      </div>

      {/* Interactive Quick Modals and Trigger Deck */}
      <DashboardQuickActions
        assets={assets}
        employees={employees}
        isPowerUser={isPowerUser}
      />

      {/* Pending Approvals Queue (Power Users only) */}
      {isPowerUser && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 px-6 py-4 bg-zinc-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-950">Pending Approvals Queue</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Service tickets and repair requests awaiting your authorization.</p>
            </div>
            <span className="text-[10px] font-bold bg-zinc-950 text-white px-2 py-0.5 rounded-full">
              {metrics?.pendingMaintenance?.length || 0} Pending
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {!metrics?.pendingMaintenance || metrics.pendingMaintenance.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs italic">
                All queues are clear. No approvals pending today.
              </div>
            ) : (
              metrics.pendingMaintenance.map((req: any) => (
                <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold bg-zinc-100 text-zinc-800 px-1.5 py-0.2 border border-zinc-200 rounded">
                        {req.asset.tag}
                      </span>
                      <span className="font-bold text-zinc-950">{req.asset.name}</span>
                    </div>
                    <div className="text-zinc-500 mt-1">
                      <span className="font-semibold text-zinc-700">Issue:</span> {req.issueDescription}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Reported by {req.raisedBy.name}
                    </div>
                  </div>

                  <form action={handleQuickApprove}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-[10px] font-bold bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg cursor-pointer transition-all shadow-sm"
                    >
                      Approve & Release
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main split sections: Activity feed vs Overdue Return lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Overdue alert widget */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden h-fit">
          <div className="border-b border-zinc-100 px-6 py-4 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">Overdue Return Alerts</h2>
            <AlertTriangle className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="divide-y divide-zinc-100">
            {overdue.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs italic">
                No overdue returns currently logged.
              </div>
            ) : (
              overdue.map((alloc: any) => (
                <div key={alloc.id} className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold bg-red-50 text-red-700 px-1.5 py-0.2 border border-red-100 rounded">
                        {alloc.asset.tag}
                      </span>
                      <span className="font-bold text-zinc-900">{alloc.asset.name}</span>
                    </div>
                    <div className="text-zinc-500 mt-1">
                      <span className="font-semibold text-zinc-700">Holder:</span> {alloc.user.name} ({alloc.user.email})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      Expected Return:
                    </div>
                    <div className="text-zinc-400 text-[10px] mt-0.5">
                      {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Activity Log audit feed */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden h-fit">
          <div className="border-b border-zinc-100 px-6 py-4 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">Activity Audit Ledger</h2>
            <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs italic">
                No activity records logged in DB.
              </div>
            ) : (
              activities.map((act: any) => (
                <div key={act.id} className="p-4 text-xs hover:bg-zinc-50/50">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-zinc-900">{act.action.replace("_", " ")}</span>
                    <span className="text-[10px] text-zinc-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 text-zinc-500 flex justify-between">
                    <span>
                      <span className="font-semibold text-zinc-700">Actor:</span> {act.user?.name || "System"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">ID: {act.entityId.slice(0,8)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
