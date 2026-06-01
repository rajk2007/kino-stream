import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X, Clock, Film } from "lucide-react";
import { tmdb, IMG, getTitle, getYear, type Media, isAnime } from "@/lib/tmdb";

export const Route = createFileRoute("/search")({ component: SearchPage });

const TRENDING = ["Jawan", "One Piece", "Oppenheimer", "Attack on Titan", "RRR", "The Boys", "Demon Slayer", "Interstellar", "Leo", "Pathaan"];
const GENRES = [
  { name: "Action", grad: "from-red-600 to-orange-500" },
  { name: "Romance", grad: "from-pink-500 to-rose-600" },
  { name: "Anime", grad: "from-purple-600 to-pink-500" },
  { name: "Thriller", grad: "from-slate-700 to-zinc-900" },
  { name: "Comedy", grad: "from-yellow-500 to-amber-600" },
  { name: "Sci-Fi", grad: "from-blue-600 to-indigo-700" },
];

function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Media[] | null>(null);
  const [filter, setFilter] = useState<"all" | "movie" | "tv" | "anime">("all");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem("kino_recent_searches") || "[]")); } catch {}
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    const id = setTimeout(() => {
      tmdb<{ results: Media[] }>("/search/multi", { query: q })
        .then(d => setResults(d.results.filter(r => r.media_type !== "person")))
        .finally(() => setLoading(false));
      const nr = [q, ...recent.filter(r => r !== q)].slice(0, 8);
      setRecent(nr);
      localStorage.setItem("kino_recent_searches", JSON.stringify(nr));
    }, 400);
    return () => clearTimeout(id);
  }, [q]);

  const filtered = useMemo(() => {
    if (!results) return null;
    if (filter === "all") return results;
    if (filter === "anime") return results.filter(r => isAnime(r));
    return results.filter(r => r.media_type === filter);
  }, [results, filter]);

  const removeRecent = (s: string) => {
    const nr = recent.filter(r => r !== s);
    setRecent(nr);
    localStorage.setItem("kino_recent_searches", JSON.stringify(nr));
  };

  return (
    <div className="pt-4 px-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--kino-muted)]" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Movies, shows, anime..."
          type="search"
          className="w-full h-12 rounded-full glass pl-10 pr-10 text-white text-sm placeholder:text-[var(--kino-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-[var(--kino-muted)]" />
          </button>
        )}
      </div>

      {q && (
        <div className="flex gap-4 mt-4 border-b border-white/5 overflow-x-auto hide-scrollbar">
          {(["all", "movie", "tv", "anime"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`pb-2 text-sm font-medium capitalize relative whitespace-nowrap ${filter === f ? "text-white" : "text-[var(--kino-muted)]"}`}>
              {f === "all" ? "All" : f === "tv" ? "TV Shows" : f === "movie" ? "Movies" : "Anime"}
              {filter === f && <div className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--theme-primary)]" />}
            </button>
          ))}
        </div>
      )}

      {!q && (
        <>
          <h3 className="text-white font-semibold mt-6 mb-3">Trending Searches</h3>
          <div className="flex gap-2 flex-wrap">
            {TRENDING.map(t => (
              <button key={t} onClick={() => setQ(t)} className="px-3 py-1.5 rounded-full glass text-white text-xs btn-press">{t}</button>
            ))}
          </div>

          {recent.length > 0 && (
            <>
              <h3 className="text-white font-semibold mt-6 mb-3">Recent Searches</h3>
              <div className="flex flex-col gap-1">
                {recent.map(r => (
                  <div key={r} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <Clock className="w-4 h-4 text-[var(--kino-muted)]" />
                    <button className="flex-1 text-left text-white text-sm" onClick={() => setQ(r)}>{r}</button>
                    <button onClick={() => removeRecent(r)}><X className="w-4 h-4 text-[var(--kino-muted)]" /></button>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="text-white font-semibold mt-6 mb-3">Browse Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {GENRES.map(g => (
              <button key={g.name} onClick={() => setQ(g.name)}
                className={`h-20 rounded-xl bg-gradient-to-br ${g.grad} text-white font-display text-lg btn-press relative overflow-hidden`}>
                <span className="relative z-10">{g.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {q && (
        <div className="mt-4 flex flex-col gap-2">
          {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[76px] rounded-xl shimmer" />)}
          {!loading && filtered && filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 text-[var(--kino-muted)]">
              <Film className="w-12 h-12 mb-3" />
              <p>No results for "{q}"</p>
            </div>
          )}
          {!loading && filtered?.map(r => {
            const t = isAnime(r) ? "anime" : (r.media_type === "tv" ? "tv" : "movie");
            return (
              <Link key={r.id} to="/details/$type/$id" params={{ type: t, id: String(r.id) }}
                className="flex gap-3 p-2 rounded-xl bg-[var(--kino-card)] btn-press">
                {r.poster_path ? (
                  <img src={IMG(r.poster_path, "w154")} alt="" className="w-14 h-[76px] rounded-lg object-cover" />
                ) : <div className="w-14 h-[76px] rounded-lg bg-[var(--kino-elevated)]" />}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{getTitle(r)}</p>
                  <p className="text-[var(--kino-muted)] text-xs">{getYear(r)} • {t.toUpperCase()}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="font-mono text-[10px] text-[var(--kino-gold)]">★ {r.vote_average.toFixed(1)}</span>
                    {r.original_language === "hi" && <span className="px-1 rounded bg-[var(--kino-hindi-badge)] text-[9px] text-white font-bold">HI</span>}
                    {isAnime(r) && <span className="px-1 rounded bg-[var(--kino-anime-badge)] text-[9px] text-white font-bold">SUB</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
