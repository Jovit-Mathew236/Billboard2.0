"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LucideIcon, MoreHorizontal } from "lucide-react";
import { SplashScreen } from "@/components/splash-screen";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useAuth } from "@/lib/provider/authProvider";
import { isActive, NAV_GROUPS, NAV_ITEMS, NavItem } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { UserMenu } from "./user-menu";

function SidebarLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:py-2",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function NavSections({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="grid gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="grid gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
          {group.items.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}

function OpenDisplayButton({ compact }: { compact?: boolean }) {
  return (
    <Button variant="outline" size={compact ? "icon" : "sm"} asChild>
      <a href="/display" target="_blank" rel="noreferrer" aria-label="Open display">
        <ExternalLink />
        {!compact && "Open display"}
      </a>
    </Button>
  );
}

function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-14 items-center justify-center rounded-full transition-all duration-300",
        active ? "bg-accent text-accent-foreground" : "scale-95"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
    </span>
  );
}

const SPLASH_MIN_MS = 900;
const SPLASH_FADE_MS = 500;

function useSplash(ready: boolean) {
  const [phase, setPhase] = useState<"visible" | "leaving" | "done">("visible");
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!ready || phase !== "visible") return;
    const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - mountedAt));
    const leave = setTimeout(() => setPhase("leaving"), wait);
    const done = setTimeout(() => setPhase("done"), wait + SPLASH_FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [ready, phase, mountedAt]);

  return phase;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  const splash = useSplash(!loading && !!user);
  const splashLayer = splash !== "done" && <SplashScreen leaving={splash === "leaving"} />;

  if (loading || !user) return <SplashScreen />;

  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  const mobileItems = NAV_ITEMS.filter((item) => item.mobile);
  const moreActive = !!current && !current.mobile;

  return (
    <div className="flex h-dvh overflow-hidden">
      {splashLayer}
      <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r bg-card/50 px-3 py-5 lg:flex">
        <div className="px-3 pb-6">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavSections pathname={pathname} />
        </div>
        <div className="border-t pt-3">
          <UserMenu showDetails />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center gap-3 border-b bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-6 lg:h-16 lg:px-8 lg:pt-0">
          <div className="lg:hidden">
            <Brand />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">{current?.label ?? "Admin"}</p>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <OpenDisplayButton />
            </div>
            <div className="sm:hidden">
              <OpenDisplayButton compact />
            </div>
            <div className="lg:hidden">
              <UserMenu />
            </div>
          </div>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div
            key={pathname}
            className="mx-auto w-full max-w-6xl px-4 pb-8 pt-5 motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8"
          >
            {children}
          </div>
        </main>

        <nav className="pb-safe z-40 grid shrink-0 grid-cols-5 border-t bg-background pt-1.5 lg:hidden">
          {mobileItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors active:opacity-60",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <TabIcon icon={item.icon} active={active} />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium active:opacity-60",
              moreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <TabIcon icon={MoreHorizontal} active={moreActive} />
            More
          </button>
        </nav>
      </div>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="pb-safe px-3">
          <DrawerTitle className="sr-only">Navigation</DrawerTitle>
          <div className="py-4">
            <NavSections pathname={pathname} onNavigate={() => setMoreOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
