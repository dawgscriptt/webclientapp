"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { CommandPalette } from "@/components/search/CommandPalette";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { Avatar } from "@/components/ui/Avatar";
import { PostComposerModal } from "@/components/post/PostComposerModal";
import { ConvosLogo } from "@/components/brand/ConvosLogo";

function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
      Theme
    </Button>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mutedFg hover:bg-muted hover:text-fg"
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const authed = !!(session as any)?.accountId;
  const role = (session as any)?.role as string | undefined;
  const username = (session as any)?.username as string | undefined;

  const isStaff = role === "admin" || role === "mod";

  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") document.documentElement.classList.add("dark");
      if (saved === "light") document.documentElement.classList.remove("dark");
    } catch {}

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (k === "escape") setUserMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const leftWidth = 280;
  const QuickHubs = useMemo(() => ["en", "de", "fr", "es", "it", "tr"], []);

  return (
    <div className="min-h-screen">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="px-3 py-2 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              Menu
            </Button>

            {/* ✅ Brand: Convos */}
<Link href="/" className="flex items-center">
  <ConvosLogo
    variant="lockup"
    size={36}
    scheme="tricolor"
    className="select-none"
    wordClassName="text-[18px] md:text-[19px]"
  />
</Link>
          </div>

          {/* Center */}
          <div className="hidden md:flex justify-center">
            <div className="w-full max-w-[720px]">
              <button className="w-full text-left" onClick={() => setPaletteOpen(true)}>
                <Input readOnly placeholder="Search… (Ctrl+K)" />
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-2">
            {authed ? (
              <>
                <PostComposerModal />

                <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
                  Ctrl+K
                </Button>

                <ThemeToggle />

                <div className="relative">
                  <button
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 hover:bg-muted"
                    onClick={() => setUserMenuOpen((v) => !v)}
                  >
                    <Avatar
                      username={username}
                      name={(session as any)?.user?.name}
                      url={(session as any)?.avatarUrl}
                      className="h-7 w-7"
                    />
                    <span className="text-sm font-medium hidden sm:block">
                      @{username ?? "me"}
                    </span>
                  </button>

                  {userMenuOpen ? (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-sm overflow-hidden"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <Link className="block px-3 py-2 text-sm hover:bg-muted" href={`/u/${username ?? ""}`}>
                        My profile
                      </Link>
                      <Link className="block px-3 py-2 text-sm hover:bg-muted" href="/settings">
                        Settings
                      </Link>
                      {isStaff ? (
                        <Link className="block px-3 py-2 text-sm hover:bg-muted" href="/admin/reports">
                          Moderation
                        </Link>
                      ) : null}
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"
                  href="/auth/login"
                >
                  Login
                </Link>
                <Link
                  className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"
                  href="/auth/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Leftbar fixed */}
      <aside
        className={cn(
          "fixed left-0 top-[52px] bottom-0 w-[280px] border-r border-border bg-card overflow-auto",
          "hidden lg:block"
        )}
        style={{ width: leftWidth }}
      >
        <div className="p-3 space-y-3">
          <div className="card">
            <div className="card-pad space-y-1">
              <NavLink href="/" label="Home" />
              <NavLink href="/hubs" label="Explore Hubs" />
              <NavLink href="/search" label="Search" />

              {authed ? (
                <>
                  <NavLink href="/feed" label="Your Feed" />
                  <NavLink href="/friends" label="Friends" />
                  <NavLink href="/messages" label="Messages" />
                  <NavLink href="/tutor" label="AI Tutor" />
                  <NavLink href="/notifications" label="Notifications" />
                  <NavLink href="/settings" label="Settings" />
                  <NavLink href={`/u/${username ?? ""}`} label="My Profile" />
                  {isStaff ? <NavLink href="/admin/reports" label="Moderation" /> : null}
                  {isStaff ?<NavLink href="/admin/users" label="Users" /> : null}
                </>
              ) : (
                <div className="mt-2 muted">Login to unlock Friends, DMs, Tutor, Settings.</div>
              )}

              <div className="mt-3 mb-2 text-xs uppercase tracking-wider text-mutedFg">
                Quick hubs
              </div>
              <div className="grid grid-cols-3 gap-2">
                {QuickHubs.map((l) => (
                  <Link
                    key={l}
                    href={`/h/${l}`}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted text-center"
                  >
                    {l.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main + Right sidebar */}
      <div className="px-3 py-4 lg:pl-[300px]">
        <div className="mx-auto max-w-[1280px] grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
          <main className="min-w-0 space-y-3">{children}</main>

          <aside className="hidden xl:block">
            <div className="sticky top-[76px] h-fit">
              <SidebarWidgets />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
