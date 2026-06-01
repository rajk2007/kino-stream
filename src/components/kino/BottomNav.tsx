import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/library", label: "Library", Icon: Library },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  const path = location.pathname;
  if (path.startsWith("/player")) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/30 to-transparent" />
        <nav className="glass-dark border-t border-white/5">
          <div className="max-w-[430px] mx-auto flex items-stretch justify-around h-16">
            {tabs.map(({ to, label, Icon }) => {
              const active = to === "/" ? path === "/" : path.startsWith(to);
              return (
                <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center gap-0.5 btn-press">
                  <Icon className={`w-5 h-5 ${active ? "text-[var(--theme-primary)]" : "text-[var(--kino-muted)]"}`} />
                  <span className={`text-[10px] font-medium ${active ? "text-[var(--theme-primary)]" : "text-[var(--kino-muted)]"}`}>{label}</span>
                </Link>
              );
            })}
          </div>
          <div className="h-7 flex items-center justify-center gap-2 safe-bottom">
            <span className="font-display text-[11px] tracking-[0.4em] text-white/40">KINO</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] text-[var(--kino-muted)]">by Raj Karmakar</span>
          </div>
        </nav>
      </div>
      <div className="h-[88px] safe-bottom" aria-hidden />
    </>
  );
}
