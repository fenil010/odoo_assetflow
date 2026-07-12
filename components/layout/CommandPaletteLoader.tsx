"use client";

// Client-boundary wrapper so that `ssr: false` is valid.
// CommandPalette uses browser APIs (keyboard listeners, portals) so it
// must never be pre-rendered on the server. It fetches its own role via
// useSession instead of receiving it as a prop from the Server Component.
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

export default function CommandPaletteLoader() {
  const { data: session } = useSession();
  return <CommandPalette role={session?.user?.role} />;
}
