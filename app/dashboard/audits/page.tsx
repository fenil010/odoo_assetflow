"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, Plus, X, ClipboardCheck, Lock, Check, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuditCycles, createAuditCycle, getAuditCycleDetails, verifyAuditItem, closeAuditCycle } from "@/actions/audits";
import { exportToCSV } from "@/utils/csv";

export default function AuditsPage() {
  const { data: session } = useSession();

  // Data states
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [cycleDetails, setCycleDetails] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [discrepancyNotes, setDiscrepancyNotes] = useState<Record<string, string>>({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPowerUser = session && ["ADMIN", "ASSET_MANAGER"].includes(session.user.role);

  // Load audit cycles list
  const loadCycles = async () => {
    setLoading(true);
    try {
      const data = await getAuditCycles();
      setCycles(data || []);
      if (data && data.length > 0 && !selectedCycleId) {
        setSelectedCycleId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  // Load details of selected cycle
  const loadCycleDetails = async () => {
    if (!selectedCycleId) return;
    setDetailsLoading(true);
    try {
      const details = await getAuditCycleDetails(selectedCycleId);
      setCycleDetails(details);
      
      // Initialize notes
      const notesMap: Record<string, string> = {};
      details?.items.forEach((item: any) => {
        notesMap[item.id] = item.discrepancyNotes || "";
      });
      setDiscrepancyNotes(notesMap);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadCycleDetails();
  }, [selectedCycleId]);

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await createAuditCycle({
        name: cycleName,
        startDate,
        endDate,
      });

      if (res.success) {
        setSuccess(res.message || "Audit cycle created.");
        setCycleName("");
        setStartDate("");
        setEndDate("");
        setShowAddModal(false);
        // Force reload and select new cycle
        const freshCycles = await getAuditCycles();
        setCycles(freshCycles || []);
        if (freshCycles && freshCycles.length > 0) {
          setSelectedCycleId(freshCycles[0].id);
        }
      } else {
        setError(res.message || "Failed to create cycle.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (itemId: string, status: "VERIFIED" | "MISSING" | "DAMAGED") => {
    setError("");
    setSuccess("");
    try {
      const notes = discrepancyNotes[itemId] || "";
      const res = await verifyAuditItem({
        itemId,
        status,
        discrepancyNotes: notes,
      });

      if (res.success) {
        setSuccess("Asset verification recorded.");
        await loadCycleDetails();
      } else {
        setError(res.message || "Failed to update item.");
      }
    } catch (err) {
      setError("Failed to verify asset.");
    }
  };

  const handleCloseCycle = async () => {
    if (!selectedCycleId) return;
    if (!confirm("Are you sure you want to close this audit cycle? This will lock the audit history as read-only and automatically flag all confirmed missing assets as LOST in the registry.")) return;

    setError("");
    setSuccess("");
    try {
      const res = await closeAuditCycle(selectedCycleId);
      if (res.success) {
        setSuccess("Audit cycle successfully closed and locked.");
        await loadCycles();
        await loadCycleDetails();
      } else {
        setError(res.message || "Failed to close cycle.");
      }
    } catch (err) {
      setError("Failed to close cycle.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
      </div>
    );
  }

  // Calculate stats
  const totalItems = cycleDetails?.items.length || 0;
  const verifiedItemsCount = cycleDetails?.items.filter((i: any) => i.verifiedById !== null).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((verifiedItemsCount / totalItems) * 100) : 0;

  const handleExportCSV = () => {
    if (!cycleDetails) return;
    const exportData = cycleDetails.items.map((item: any) => ({
      "Asset Tag": item.asset.tag,
      "Asset Name": item.asset.name,
      "Location": item.asset.location,
      "Verification Status": item.status,
      "Discrepancy Notes": item.discrepancyNotes || "",
      "Verified By": item.verifiedBy?.name || "Unverified",
      "Verified At": item.verifiedAt ? new Date(item.verifiedAt).toLocaleString() : "Unverified",
    }));
    exportToCSV(exportData, `Audit_Report_${cycleDetails.name.replace(/\s+/g, "_")}`);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Governance Audits</h1>
          <p className="text-sm text-zinc-500 mt-1">Schedule periodical inventories, verify assets, and lock discrepancy statements.</p>
        </div>
        {isPowerUser && (
          <Button
            onClick={() => { setShowAddModal(true); setError(""); setSuccess(""); }}
            className="mt-4 sm:mt-0 flex items-center bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs py-2 px-4 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Start Audit Cycle
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-xs font-bold text-zinc-950">
          {success}
        </div>
      )}

      {cycles.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 max-w-lg mx-auto mt-12">
          <ShieldCheck className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-zinc-900">No active audits configured.</h2>
          <p className="text-xs text-zinc-500 mt-1">Create a cycle to snapshot assets and verify them in specific locations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none">
          {/* Left panel: Cycle list selector */}
          <div className="space-y-6 h-fit">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-950 mb-4">Audit Cycles</h2>
              <div className="space-y-1">
                <Label htmlFor="cycle">Select Cycle</Label>
                <select
                  id="cycle"
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
                >
                  {cycles.map((cy) => (
                    <option key={cy.id} value={cy.id}>
                      {cy.name} ({cy.status})
                    </option>
                  ))}
                </select>
              </div>

              {cycleDetails && (
                <div className="mt-6 space-y-4 border-t border-zinc-100 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-500">Status</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold uppercase tracking-wide border ${
                        cycleDetails.status === "ACTIVE"
                          ? "bg-zinc-950 text-white border-transparent animate-pulse"
                          : "bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}
                    >
                      {cycleDetails.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-zinc-500">Verification Progress</span>
                      <span className="text-zinc-900">{progressPercent}% ({verifiedItemsCount}/{totalItems})</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200">
                      <div className="bg-zinc-950 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  {cycleDetails.status === "ACTIVE" && isPowerUser && (
                    <Button
                      onClick={handleCloseCycle}
                      className="w-full mt-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs"
                    >
                      Close & Lock Audit Cycle
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Items list verification table */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm h-fit">
            <div className="border-b border-zinc-100 px-6 py-4 bg-zinc-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Verification Catalog</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Relational check-in verification log sheet.</p>
              </div>
              <div className="flex items-center space-x-2">
                {cycleDetails && (
                  <Button
                    onClick={handleExportCSV}
                    className="h-8 text-xs border border-zinc-200 hover:bg-zinc-50 text-zinc-800 bg-white rounded-lg px-3 py-1 cursor-pointer"
                  >
                    Export CSV
                  </Button>
                )}
                <button
                  onClick={loadCycleDetails}
                  className="text-zinc-400 hover:text-zinc-600 p-2 rounded hover:bg-zinc-100 transition-all cursor-pointer"
                  title="Refresh details"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {detailsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              </div>
            ) : !cycleDetails ? (
              <div className="py-20 text-center text-zinc-400">
                <ClipboardCheck className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">Select an audit cycle to begin checking.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {cycleDetails.items.map((item: any) => {
                  const isVerified = item.verifiedById !== null;
                  const isCycleClosed = cycleDetails.status === "CLOSED";

                  return (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-zinc-50/50">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-800 px-1.5 py-0.2 border border-zinc-200 rounded">
                            {item.asset.tag}
                          </span>
                          <span className="text-sm font-bold text-zinc-950">{item.asset.name}</span>
                        </div>
                        <div className="text-xs text-zinc-500">
                          <span className="font-semibold text-zinc-700">Storage Location:</span> {item.asset.location}
                        </div>
                        {isVerified && (
                          <div className="text-[10px] text-zinc-400">
                            Verified by {item.verifiedBy.name} on {new Date(item.verifiedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Note textbox */}
                        {!isCycleClosed && (
                          <input
                            type="text"
                            value={discrepancyNotes[item.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDiscrepancyNotes((prev) => ({ ...prev, [item.id]: val }));
                            }}
                            placeholder="Add discrepancy notes..."
                            className="h-8 text-xs rounded-lg border border-zinc-200 bg-white px-2 py-1 focus:outline-none"
                          />
                        )}

                        {/* Decision button controls */}
                        {isCycleClosed ? (
                          <span
                            className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${
                              item.status === "VERIFIED"
                                ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                                : item.status === "MISSING"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-yellow-50 text-yellow-800 border-yellow-100"
                            }`}
                          >
                            {item.status}
                          </span>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleVerify(item.id, "VERIFIED")}
                              className={`px-2.5 py-1 text-xs font-bold border rounded transition-all cursor-pointer ${
                                item.status === "VERIFIED" && isVerified
                                  ? "bg-zinc-950 text-white border-transparent"
                                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                              }`}
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerify(item.id, "MISSING")}
                              className={`px-2.5 py-1 text-xs font-bold border rounded transition-all cursor-pointer ${
                                item.status === "MISSING" && isVerified
                                  ? "bg-red-950 text-white border-transparent"
                                  : "border-zinc-200 hover:bg-red-50 text-red-600"
                              }`}
                            >
                              Missing
                            </button>
                            <button
                              onClick={() => handleVerify(item.id, "DAMAGED")}
                              className={`px-2.5 py-1 text-xs font-bold border rounded transition-all cursor-pointer ${
                                item.status === "DAMAGED" && isVerified
                                  ? "bg-yellow-950 text-white border-transparent"
                                  : "border-zinc-200 hover:bg-yellow-50 text-yellow-600"
                              }`}
                            >
                              Damage
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE CYCLE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-black text-zinc-950 uppercase">Start Audit Cycle</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="cName">Audit Cycle Name</Label>
                <Input id="cName" value={cycleName} onChange={(e) => setCycleName(e.target.value)} placeholder="e.g. Q3 Electronics Audit" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sDate">Start Date</Label>
                <Input id="sDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="eDate">End Date</Label>
                <Input id="eDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs"
                  disabled={submitting}
                >
                  {submitting ? "Activating..." : "Confirm & Snapshot Assets"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                  className="border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
