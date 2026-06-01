import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Download as DownloadIcon, Play, Trash2, Heart, Clock, CheckCircle2, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { IMG } from "@/lib/tmdb";
import { toast } from "sonner";

type Tab = "downloads" | "continue" | "watchlist" | "favorites" | "history" | "completed";

export const Route = createFileRoute("/library")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as Tab) || "downloads" }),
  component: Library,
});

const MOCK_DOWNLOADS = [
  { id: 872585, title: "Oppenheimer", quality: "1080p", size: "2.3 GB", status: "done", progress: 100, poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { id: 911521, title: "Demon Slayer S3E1", quality: "720p", size: "380 MB", status: "downloading", progress: 67, poster: "/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg" },
];

function Library() {
  const { tab } = useSearch({ from: "/library" });
  const { watchlist, favorites, history, completed, continueWatching } = useApp();
  const [downloads, setDownloads] = useState(MOCK_DOWNLOADS);

  const tabs: { key: Tab; label: string }[] = [
    { key: "downloads", label: "Downloads" },
    { key: "continue", label: "Continue" },
    { key: "watchlist", label: "Watchlist" },
    { key: "favorites", label: "Favorites" },
    { key: "history", label: "History" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="pt-4">
      <div className="px-4 mb-4">
        <h1 className="font-display text-2xl text-white">Library</h1>
        <p className="text-[var(--kino-muted)] text-xs">Your personal cinema</p>
      </div>

      <div className="flex gap-4 px-4 border-b border-white/5 overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <Link key={t.key} to="/library" search={{ tab: t.key }}
            className={`pb-3 text-sm font-medium whitespace-nowrap relative ${tab === t.key ? "text-white" : "text-[var(--kino-muted)]"}`}>
            {t.label}
            {tab === t.key && <div className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--theme-primary)]" />}
          </Link>
        ))}
      </div>

      <div className="p-4">
        {tab === "downloads" && (
          downloads.length === 0 ? (
            <Empty icon={<DownloadIcon className="w-12 h-12" />} label="No downloads yet" cta="Browse Content" to="/" />
          ) : (
            <div className="flex flex-col gap-3">
              {downloads.map(d => (
                <div key={d.id} className="flex gap-3 p-3 rounded-xl bg-[var(--kino-card)]">
                  <img src={IMG(d.poster, "w185")} alt={d.title} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{d.title}</p>
                    <p className="text-[var(--kino-muted)] text-xs">{d.quality} • {d.size}</p>
                    {d.status === "downloading" ? (
                      <div className="mt-2">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-[var(--theme-primary)]" style={{ width: `${d.progress}%` }} /></div>
                        <p className="text-[10px] text-[var(--kino-muted)] mt-1">{d.progress}% • 2.1 MB/s</p>
                      </div>
                    ) : (
                      <button onClick={() => toast.success("Playing offline")} className="mt-2 px-3 py-1 rounded-full bg-[var(--theme-primary)] text-white text-xs font-medium flex items-center gap-1 w-fit"><Play className="w-3 h-3 fill-white" /> Play Offline</button>
                    )}
                  </div>
                  <button onClick={() => { setDownloads(downloads.filter(x => x.id !== d.id)); toast.success("Deleted"); }} className="p-2 self-start">
                    <Trash2 className="w-4 h-4 text-[var(--kino-muted)]" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "continue" && (
          continueWatching.length === 0 ? <Empty icon={<Play className="w-12 h-12" />} label="Nothing in progress" cta="Browse" to="/" /> : (
            <div className="grid grid-cols-2 gap-3">
              {continueWatching.map(c => (
                <Link key={c.id} to="/player/$type/$id" params={{ type: c.type, id: String(c.id) }}
                  className="relative rounded-xl overflow-hidden bg-[var(--kino-card)] btn-press">
                  <img src={IMG(c.backdrop, "w500")} alt="" className="w-full h-24 object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-[var(--theme-primary)]" style={{ width: `${c.progress}%` }} /></div>
                  <div className="p-2">
                    <p className="text-white text-xs font-semibold truncate">{c.title}</p>
                    <p className="text-[var(--kino-muted)] text-[10px]">{c.episode ? `Resume Ep ${c.episode}` : `${c.progress}% watched`}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {tab === "watchlist" && <Grid items={watchlist} empty="No items in watchlist" />}
        {tab === "favorites" && <Grid items={favorites} empty="No favorites yet" icon={<Heart className="w-12 h-12" />} />}
        {tab === "completed" && <Grid items={completed} empty="Nothing completed yet" icon={<CheckCircle2 className="w-12 h-12" />} check />}
        {tab === "history" && (
          history.length === 0 ? <Empty icon={<Clock className="w-12 h-12" />} label="No watch history" cta="Browse" to="/" /> : (
            <div className="flex flex-col gap-2">
              {history.map(h => (
                <Link key={h.id} to="/details/$type/$id" params={{ type: h.type, id: String(h.id) }} className="flex gap-3 p-2 rounded-xl bg-[var(--kino-card)]">
                  <img src={IMG(h.poster, "w154")} alt="" className="w-14 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{h.title}</p>
                    <p className="text-[var(--kino-muted)] text-xs">Watched recently</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Empty({ icon, label, cta, to }: { icon: React.ReactNode; label: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[var(--kino-muted)]">
      {icon}
      <p className="mt-3">{label}</p>
      <Link to={to} className="mt-4 px-5 py-2 rounded-full bg-[var(--theme-primary)] text-white text-sm font-medium">{cta}</Link>
    </div>
  );
}

function Grid({ items, empty, icon, check }: { items: any[]; empty: string; icon?: React.ReactNode; check?: boolean }) {
  if (items.length === 0) return <Empty icon={icon ?? <Heart className="w-12 h-12" />} label={empty} cta="Browse" to="/" />;
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(i => (
        <Link key={i.id} to="/details/$type/$id" params={{ type: i.type, id: String(i.id) }} className="relative rounded-xl overflow-hidden bg-[var(--kino-card)] aspect-[2/3] btn-press">
          {i.poster ? <img src={IMG(i.poster, "w342")} alt={i.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/40">{i.title.slice(0,2)}</div>}
          {check && <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#00BFA5] text-white flex items-center justify-center text-xs">✓</div>}
        </Link>
      ))}
    </div>
  );
}
