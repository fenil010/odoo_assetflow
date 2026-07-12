"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "../actions/notificationActions";
import { ClientNotification } from "../types/notification.types";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user alerts
  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotificationsAction();
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        setError(res.error?.message || "Failed to load notifications.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      const res = await markAsReadAction(id);
      if (!res.success) {
        // Rollback on failure
        await loadNotifications();
      }
    } catch (err) {
      await loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic Update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const res = await markAllAsReadAction();
      if (!res.success) {
        // Rollback on failure
        await loadNotifications();
      }
    } catch (err) {
      await loadNotifications();
    }
  };

  return (
    <div className="relative font-sans select-none" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 focus:outline-none transition-all cursor-pointer shadow-sm"
        aria-label="Toggle notifications menu"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-zinc-950 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Alert Center</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 && "s"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-zinc-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100">
            {loading && notifications.length === 0 ? (
              /* Loader State */
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin mb-1 text-zinc-800" />
                <span className="text-[10px] font-semibold">Fetching alerts...</span>
              </div>
            ) : error ? (
              /* Error State */
              <div className="p-4 text-center text-xs font-medium text-red-600">
                {error}
                <Button
                  onClick={loadNotifications}
                  variant="secondary"
                  className="w-full mt-2 border border-zinc-200 text-[10px] h-7"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="py-12 text-center text-zinc-400 text-xs font-semibold">
                No notifications to display.
              </div>
            ) : (
              /* Items list */
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  className={`p-4 text-left text-xs transition-colors cursor-pointer ${
                    item.isRead ? "hover:bg-zinc-50/50" : "bg-zinc-50/70 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-bold ${item.isRead ? "text-zinc-700" : "text-zinc-950"}`}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-zinc-500 mt-1 leading-relaxed text-[11px]">{item.message}</p>
                  <span className="text-[9px] text-zinc-400 font-semibold block mt-2">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
