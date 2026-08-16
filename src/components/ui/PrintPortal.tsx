"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useHydrated } from "@/lib/storage/store";

/**
 * Renders children into the body-level #print-root (see layout.tsx). On screen
 * the root is hidden; in print, everything except the root is hidden. Keeping
 * the sheet outside <main> means hidden page content can't produce blank pages.
 */
export function PrintPortal({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const root = document.getElementById("print-root");
  if (!root) return null;
  return createPortal(children, root);
}
