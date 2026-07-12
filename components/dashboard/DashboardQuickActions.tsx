"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { allocateAsset, returnAsset } from "@/actions/allocations";
import { AssetCondition } from "@prisma/client";

interface DashboardQuickActionsProps {
  assets: any[];
  employees: any[];
  isPowerUser: boolean;
}

export default function DashboardQuickActions({
  assets,
  employees,
  isPowerUser,
}: DashboardQuickActionsProps) {
  const router = useRouter();

  // Modal triggers
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Form Fields
  const [allocAssetId, setAllocAssetId] = useState("");
  const [allocUserId, setAllocUserId] = useState("");
  const [allocReturnDate, setAllocReturnDate] = useState("");

  const [retAssetId, setRetAssetId] = useState("");
  const [retCondition, setRetCondition] = useState<AssetCondition>("GOOD");
  const [retNotes, setRetNotes] = useState("");

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetMessages = () => {
    setActionError("");
    setActionSuccess("");
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");
    setSubmitting(true);

    try {
      const res = await allocateAsset({
        assetId: allocAssetId,
        targetUserId: allocUserId,
        expectedReturnDate: allocReturnDate || null,
      });

      if (res.success) {
        setActionSuccess("Asset successfully allocated.");
        setAllocAssetId("");
        setAllocUserId("");
        setAllocReturnDate("");
        setShowAllocateModal(false);
        router.refresh();
      } else {
        setActionError(res.message || "Failed to allocate.");
      }
    } catch (err) {
      setActionError("Failed to allocate asset.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");
    setSubmitting(true);

    try {
      const res = await returnAsset({
        assetId: retAssetId,
        conditionOnReturn: retCondition,
        checkInNotes: retNotes,
      });

      if (res.success) {
        setActionSuccess("Asset returned successfully.");
        setRetAssetId("");
        setRetNotes("");
        setShowReturnModal(false);
        router.refresh();
      } else {
        setActionError(res.message || "Failed to return.");
      }
    } catch (err) {
      setActionError("Failed to return asset.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-xs font-bold text-zinc-950">
          {actionSuccess}
        </div>
      )}

      {/* Quick Action Deck */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isPowerUser ? (
            <>
              <button
                onClick={() => { setShowAllocateModal(true); resetMessages(); }}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left font-bold text-zinc-950 text-sm cursor-pointer shadow-sm"
              >
                <span>Allocate Asset</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </button>

              <button
                onClick={() => { setShowReturnModal(true); resetMessages(); }}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left font-bold text-zinc-950 text-sm cursor-pointer shadow-sm"
              >
                <span>Return / Check-In</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </button>
            </>
          ) : null}

          <button
            onClick={() => router.push("/dashboard/bookings")}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left font-bold text-zinc-950 text-sm cursor-pointer shadow-sm"
          >
            <span>Reserve Shared Resource</span>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </button>

          <button
            onClick={() => router.push("/dashboard/maintenance")}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left font-bold text-zinc-950 text-sm cursor-pointer shadow-sm"
          >
            <span>Raise Repair Ticket</span>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* QUICK ALLOCATE MODAL */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-black text-zinc-950 uppercase">Allocate Asset</h2>
              <button onClick={() => setShowAllocateModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {actionError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAllocate} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="qAsset">Select Available Asset</Label>
                <select
                  id="qAsset"
                  value={allocAssetId}
                  onChange={(e) => setAllocAssetId(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Select Asset...</option>
                  {assets
                    .filter((a) => a.status === "AVAILABLE")
                    .map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        [{asset.tag}] {asset.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="qUser">Target Employee</Label>
                <select
                  id="qUser"
                  value={allocUserId}
                  onChange={(e) => setAllocUserId(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Select User...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="qReturn">Expected Return Date (Optional)</Label>
                <Input id="qReturn" type="date" value={allocReturnDate} onChange={(e) => setAllocReturnDate(e.target.value)} />
              </div>

              <div className="flex gap-2 border-t border-zinc-100 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs"
                  disabled={submitting}
                >
                  Allocate
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAllocateModal(false)}
                  className="border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RETURN MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-black text-zinc-950 uppercase">Return & Check-In</h2>
              <button onClick={() => setShowReturnModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {actionError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {actionError}
              </div>
            )}

            <form onSubmit={handleReturn} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="qRetAsset">Select Assigned Asset</Label>
                <select
                  id="qRetAsset"
                  value={retAssetId}
                  onChange={(e) => setRetAssetId(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Select Asset...</option>
                  {assets
                    .filter((a) => a.status === "ALLOCATED")
                    .map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        [{asset.tag}] {asset.name} (Held by: {asset.currentHolder?.name})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="qCondition">Return Condition</Label>
                <select
                  id="qCondition"
                  value={retCondition}
                  onChange={(e) => setRetCondition(e.target.value as AssetCondition)}
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="qNotes">Check-In Notes</Label>
                <textarea
                  id="qNotes"
                  value={retNotes}
                  onChange={(e) => setRetNotes(e.target.value)}
                  placeholder="Notes about return state, updates, wear..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-2 border-t border-zinc-100 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs"
                  disabled={submitting}
                >
                  Return Asset
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowReturnModal(false)}
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
