"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Plus, Trash2, ShieldAlert, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBookings, createBooking, cancelBooking } from "@/actions/bookings";
import { getAssets } from "@/actions/assets";

export default function BookingsPage() {
  const { data: session } = useSession();

  // Resource lists
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  // Booking Form States
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load Bookable Shared Resources
  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      try {
        const assets = await getAssets();
        // Filter shared resources
        const bookables = assets.filter((a) => a.isSharedResource && a.status !== "RETIRED");
        setResources(bookables);
        if (bookables.length > 0) {
          setSelectedResourceId(bookables[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, []);

  // Load bookings for selected resource
  const loadBookings = async () => {
    if (!selectedResourceId) return;
    setListLoading(true);
    try {
      const data = await getBookings(selectedResourceId);
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedResourceId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await createBooking({
        assetId: selectedResourceId,
        startTime,
        endTime,
      });

      if (res.success) {
        setSuccess(res.message || "Booking confirmed.");
        setStartTime("");
        setEndTime("");
        await loadBookings();
      } else {
        setError(res.message || "Failed to confirm booking.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setError("");
    try {
      const res = await cancelBooking(bookingId);
      if (res.success) {
        setSuccess("Booking cancelled.");
        await loadBookings();
      } else {
        setError(res.message || "Failed to cancel booking.");
      }
    } catch (err) {
      setError("Failed to cancel.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
      </div>
    );
  }

  const activeResource = resources.find((r) => r.id === selectedResourceId);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">Resource Scheduler</h1>
        <p className="text-sm text-zinc-500 mt-1">Book shared facilities, meeting rooms, vehicles, and specialized machinery.</p>
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

      {resources.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 max-w-lg mx-auto mt-12">
          <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-zinc-900">No bookable resources configured.</h2>
          <p className="text-xs text-zinc-500 mt-1">Mark assets as "Shared Resource" during registration to expose them for scheduling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Form and resource selector */}
          <div className="space-y-6 h-fit">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-950 mb-4">Select Shared Resource</h2>
              <div className="space-y-1">
                <Label htmlFor="resource">Available Resources</Label>
                <select
                  id="resource"
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
                >
                  {resources.map((res) => (
                    <option key={res.id} value={res.id}>
                      [{res.tag}] {res.name}
                    </option>
                  ))}
                </select>
              </div>

              {activeResource && (
                <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1">
                  <div><span className="font-semibold text-zinc-700">Location:</span> {activeResource.location}</div>
                  <div><span className="font-semibold text-zinc-700">Status:</span> {activeResource.status}</div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-950 mb-4">Reserve Time Slot</h2>
              <form onSubmit={handleBook} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs"
                  disabled={submitting}
                >
                  {submitting ? "Booking..." : "Confirm Schedule"}
                </Button>
              </form>
            </div>
          </div>

          {/* Right panel: Active Bookings list */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm h-fit">
            <div className="border-b border-zinc-100 px-6 py-4 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Active Bookings Calendar</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Approved time slots for the selected resource.</p>
            </div>

            {listLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-20 text-center text-zinc-400">
                <Clock className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No active bookings scheduled for this resource.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {bookings.map((booking) => {
                  const isOwner = booking.userId === session?.user?.id;
                  const isPowerUser = ["ADMIN", "ASSET_MANAGER"].includes(session?.user?.role || "");

                  return (
                    <div key={booking.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-zinc-50/50">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-zinc-950">{booking.user.name}</span>
                          {isOwner && (
                            <span className="text-[9px] bg-zinc-950 text-white px-1.5 py-0.5 rounded border border-transparent font-bold">
                              My Slot
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center space-x-3">
                          <span>
                            <span className="font-semibold text-zinc-700">Start:</span>{" "}
                            {new Date(booking.startTime).toLocaleString()}
                          </span>
                          <span>
                            <span className="font-semibold text-zinc-700">End:</span>{" "}
                            {new Date(booking.endTime).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {(isOwner || isPowerUser) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="mt-3 sm:mt-0 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-transparent text-xs font-semibold cursor-pointer"
                          title="Cancel Booking"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" /> Cancel
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
