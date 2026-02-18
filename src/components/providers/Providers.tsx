"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

function initTheme() {
  try {
    const saved = localStorage.getItem("theme");
    const theme = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {}
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
