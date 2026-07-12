"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, Activity, ShieldCheck, DollarSign, PieChart, Database,
  ArrowRight, ShieldAlert, CheckCircle, BarChart3, Wrench, Award, Tag, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getDepreciationReports, 
  getAssetUtilization, 
  getProductionReadinessReport 
} from "@/actions/intelligence";

export default function IntelligenceHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"depreciation" | "utilization" | "health">("depreciation");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  // States
  const [depReports, setDepReports] = useState<any>(null);
  const [utilReports, setUtilReports] = useState<any>(null);
  const [readinessReport, setReadinessReport] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    
    // Check RBAC permissions
    if (!["ADMIN", "ASSET_MANAGER"].includes(session.user.role)) {
      setForbidden(true);
      setLoading(false);
      return;
    }

    const loadIntelligenceData = async () => {
      try {
        const [dep, util, ready] = await Promise.all([
          getDepreciationReports(),
          getAssetUtilization(),
          getProductionReadinessReport()
        ]);
        setDepReports(dep);
        setUtilReports(util);
        setReadinessReport(ready);
      } catch (err) {
        console.error("Failed to load intelligence data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadIntelligenceData();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4 select-none">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-full shrink-0">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-zinc-950">Access Restriction Enforced</h1>
        <p className="text-zinc-550 text-xs max-w-md">
          You do not have the enterprise clearance role required to inspect global depreciation reports, asset utilization indices, or system security diagnostics audits.
        </p>
        <Button 
          onClick={() => router.push("/dashboard")}
          className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs"
        >
          Return to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-indigo-650" /> Enterprise Intelligence Hub
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Access analytical depreciation charts, asset usage rates, and the database diagnostic readiness audit.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-200 gap-4 overflow-x-auto scrollbar-none select-none">
        {[
          { id: "depreciation", label: "Depreciation Reports", icon: <TrendingDown className="h-4 w-4" /> },
          { id: "utilization", label: "Asset Utilization", icon: <Activity className="h-4 w-4" /> },
          { id: "health", label: "System Health & Audit", icon: <ShieldCheck className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id 
                ? "border-zinc-950 text-zinc-950 font-black" 
                : "border-transparent text-zinc-400 hover:text-zinc-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DEPRECIATION REPORTS */}
      {activeTab === "depreciation" && depReports && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-zinc-50 border border-zinc-250 text-zinc-800 rounded-xl shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Original Cost</span>
                <span className="text-xl font-black text-zinc-950">${depReports.overall.cost.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl shrink-0">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Accumulated Depreciation</span>
                <span className="text-xl font-black text-red-650">${depReports.overall.accumulatedDep.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Current Net Asset Value</span>
                <span className="text-xl font-black text-emerald-800">${depReports.overall.currentValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-150 px-6 py-4 bg-zinc-50/50 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-zinc-455" />
                <h2 className="text-xs font-black text-zinc-950 uppercase tracking-tight">Depreciation by Asset Category</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase">
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Original Cost</th>
                      <th className="px-6 py-3.5">Net Book Value</th>
                      <th className="px-6 py-3.5">Depreciation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                    {depReports.byCategory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-400 italic">No category records.</td>
                      </tr>
                    ) : (
                      depReports.byCategory.map((cat: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50/30">
                          <td className="px-6 py-3.5 font-bold text-zinc-900">{cat.name}</td>
                          <td className="px-6 py-3.5 font-semibold text-zinc-750">${cat.cost.toFixed(2)}</td>
                          <td className="px-6 py-3.5 font-bold text-emerald-800">${cat.currentValue.toFixed(2)}</td>
                          <td className="px-6 py-3.5 font-semibold text-red-600">${cat.accumulatedDep.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Department */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-150 px-6 py-4 bg-zinc-50/50 flex items-center gap-2">
                <Database className="h-4 w-4 text-zinc-455" />
                <h2 className="text-xs font-black text-zinc-950 uppercase tracking-tight">Depreciation by Department Allocation</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase">
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Original Cost</th>
                      <th className="px-6 py-3.5">Net Book Value</th>
                      <th className="px-6 py-3.5">Depreciation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                    {depReports.byDepartment.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-400 italic">No department allocations.</td>
                      </tr>
                    ) : (
                      depReports.byDepartment.map((dept: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50/30">
                          <td className="px-6 py-3.5 font-bold text-zinc-900">{dept.name}</td>
                          <td className="px-6 py-3.5 font-semibold text-zinc-750">${dept.cost.toFixed(2)}</td>
                          <td className="px-6 py-3.5 font-bold text-emerald-800">${dept.currentValue.toFixed(2)}</td>
                          <td className="px-6 py-3.5 font-semibold text-red-600">${dept.accumulatedDep.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UTILIZATION REPORTS */}
      {activeTab === "utilization" && utilReports && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column A: Most Used */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2">
                🔥 Most Utilized Shared Resources
              </h2>
              <div className="space-y-3.5">
                {utilReports.ranks.mostUsed.length === 0 ? (
                  <div className="text-center text-zinc-400 italic py-6">No utilization logs.</div>
                ) : (
                  utilReports.ranks.mostUsed.map((item: any) => (
                    <div key={item.id} className="space-y-1 bg-zinc-50/40 border border-zinc-200/50 p-3 rounded-xl">
                      <div className="flex justify-between items-start">
                        <span className="font-mono bg-zinc-100 text-zinc-800 border border-zinc-200 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-black text-indigo-650">{(item.totalActivePct).toFixed(1)}% Usage</span>
                      </div>
                      <div className="font-bold text-zinc-900 text-xs truncate mt-1">{item.name}</div>
                      
                      {/* Bar visualization */}
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${item.totalActivePct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column B: Least Used */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2">
                ❄️ Least Utilized Assets
              </h2>
              <div className="space-y-3.5">
                {utilReports.ranks.leastUsed.length === 0 ? (
                  <div className="text-center text-zinc-400 italic py-6">No utilization logs.</div>
                ) : (
                  utilReports.ranks.leastUsed.map((item: any) => (
                    <div key={item.id} className="space-y-1 bg-zinc-50/40 border border-zinc-200/50 p-3 rounded-xl">
                      <div className="flex justify-between items-start">
                        <span className="font-mono bg-zinc-100 text-zinc-800 border border-zinc-200 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-black text-zinc-500">{(item.totalActivePct).toFixed(1)}% Usage</span>
                      </div>
                      <div className="font-bold text-zinc-900 text-xs truncate mt-1">{item.name}</div>
                      
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-zinc-400 h-1.5 rounded-full" style={{ width: `${item.totalActivePct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column C: Idle Assets */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2">
                ⚠️ Completely Idle Assets (0% Usage)
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {utilReports.ranks.idleAssets.length === 0 ? (
                  <div className="text-center text-zinc-400 italic py-12">
                    Excellent! 0 idle assets on roster.
                  </div>
                ) : (
                  utilReports.ranks.idleAssets.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-red-50/30 border border-red-150 p-2.5 rounded-xl text-xs gap-3">
                      <div className="min-w-0">
                        <span className="font-mono text-[9px] font-bold bg-red-50 border border-red-100 text-red-750 px-1.5 py-0.2 rounded inline-block mb-1">{item.tag}</span>
                        <span className="font-bold text-zinc-900 block truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-650 px-2 py-0.5 rounded-full shrink-0">
                        status: {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH & AUDIT */}
      {activeTab === "health" && readinessReport && (
        <div className="space-y-6 animate-in fade-in select-none">
          
          {/* Diagnostic score dials */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-950 text-white p-5 shadow-lg text-center space-y-2">
              <span className="text-[9px] font-black text-zinc-450 uppercase block tracking-wider">ERP Completion</span>
              <span className="text-3xl font-black tracking-tight text-emerald-400">{readinessReport.completionPct}%</span>
              <div className="text-[10px] font-medium text-zinc-400">All features compiled</div>
            </div>

            {[
              { label: "Security score", val: readinessReport.scores.security, desc: "RBAC & validations enforced" },
              { label: "Performance", val: readinessReport.scores.performance, desc: "Typeahead & debounce queries" },
              { label: "Database health", val: readinessReport.scores.database, desc: "Cascade deletes & constraints" },
              { label: "Maintainability", val: readinessReport.scores.maintainability, desc: "Service actions architecture" },
            ].map((score, idx) => (
              <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-center space-y-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase block tracking-wider">{score.label}</span>
                <span className="text-3xl font-black tracking-tight text-zinc-950">{score.val} / 100</span>
                <div className="text-[10px] font-medium text-zinc-400">{score.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Record Metrics ledger */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2">
                📊 Operational Database Ledger Counts
              </h2>
              <div className="space-y-3 font-semibold text-xs text-zinc-700">
                {[
                  { label: "Total Asset Items", count: readinessReport.stats.assetsCount, color: "text-zinc-900" },
                  { label: "User Accounts", count: readinessReport.stats.usersCount, color: "text-zinc-900" },
                  { label: "Departments", count: readinessReport.stats.deptsCount, color: "text-zinc-900" },
                  { label: "Asset Categories", count: readinessReport.stats.categoriesCount, color: "text-zinc-900" },
                  { label: "Vendors Roster", count: readinessReport.stats.vendorsCount, color: "text-zinc-900" },
                  { label: "Activity Audit Logs", count: readinessReport.stats.logsCount, color: "text-indigo-600" },
                  { label: "Broadcast Notifications", count: readinessReport.stats.notifsCount, color: "text-zinc-900" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-zinc-100 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-zinc-550 font-medium">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic checklist */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2">
                🛠️ Production Readiness Diagnostics Audit
              </h2>
              <div className="space-y-4 pr-1">
                {readinessReport.checklist.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-zinc-50/50 border border-zinc-200/50 p-3 rounded-xl">
                    {item.status === "PASSED" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-zinc-950 block">{item.name}</span>
                      <p className="text-zinc-550 leading-relaxed text-[11px] font-medium">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
