import { Link } from "@tanstack/react-router";
import { Search, Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header
      className="sticky top-0 z-40 px-4 pt-3 pb-3 flex items-center justify-between"
      style={{
        background: "linear-gradient(to bottom, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Link to="/" className="font-display text-white" style={{ fontSize: 22, letterSpacing: "0.25em", textShadow: "0 0 18px rgba(229,9,20,0.45)" }}>
        KINO
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/search"
          aria-label="Search"
          className="flex items-center justify-center btn-press"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "8px 10px",
            backdropFilter: "blur(12px)",
          }}
        >
          <Search className="w-5 h-5 text-white" />
        </Link>
        <button
          aria-label="Notifications"
          className="flex items-center justify-center btn-press"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "8px 10px",
            backdropFilter: "blur(12px)",
          }}
        >
          <Bell className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
}

const CATEGORIES = ["Trending", "Movies", "Series", "Anime", "Hindi", "English", "Tamil", "Telugu", "Korean", "Japanese"] as const;
export type Category = typeof CATEGORIES[number];

export function CategoryBar({ active, onChange }: { active: Category; onChange: (c: Category) => void }) {
  return (
    <div
      className="sticky z-30 hide-scrollbar overflow-x-auto"
      style={{ top: 56, background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="flex gap-2 px-4 py-2.5">
        {CATEGORIES.map((c) => {
          const isActive = c === active;
          return (
            <button
              key={c}
              onClick={() => onChange(c)}
              className="shrink-0 btn-press"
              style={{
                height: 30,
                padding: "0 14px",
                borderRadius: 999,
                background: isActive ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.08)",
                border: `1px solid ${isActive ? "rgba(229,9,20,0.5)" : "rgba(255,255,255,0.12)"}`,
                color: isActive ? "#FFFFFF" : "#C0C0C0",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                letterSpacing: "0.03em",
                boxShadow: isActive ? "0 0 8px rgba(229,9,20,0.3)" : undefined,
                transition: "all 200ms ease",
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
