"use client";

import React from "react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { Menu, User } from "lucide-react";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const { toggle } = useSidebarStore();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6 select-none z-10">
      {/* Mobile Toggle & Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggle}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-lg font-black text-zinc-950 md:hidden tracking-wider">
          ASSET<span className="text-zinc-500 font-medium">FLOW</span>
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Dynamic Notification Bell Indicator */}
        <NotificationBell />

        {/* User Card */}
        <div className="flex items-center space-x-3 border-l border-zinc-200 pl-4 h-9">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-bold text-zinc-900 leading-none">{user?.name || "System User"}</span>
            <span className="text-[10px] font-semibold text-zinc-400 mt-1 uppercase tracking-wider">
              {user?.role?.replace("_", " ") || "Guest"}
            </span>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
