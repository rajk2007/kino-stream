import { createFileRoute, useParams, useRouter, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Plus, Download, Share2, Star } from "lucide-react";
import { tmdb, IMG, getTitle, getYear, GENRES, type Media } from "@/lib/tmdb";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { PosterCard } from "@/components/kino/Cards";

export const Route = createFileRoute("/details/$type/$id")({ component: Details });

function Details() {
  const { type, id } = useParams({ from: "/details/$type/$id" });
  const router = useRouter();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useApp();

  const apiType = type === "anime" ? "tv" : type;
  const [data, setData] = useState<any>(null);
  const [showAdult, setShowAdult] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [season, setSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    tmdb(`/${apiType}/${id}`, { append_to_response: "credits,similar,videos" }).then((d: any) => {
      setData(d);
      if (d.adult) setShowAdult(true);
      if (apiType === "tv" && d.seasons?.length) {
        const firstSeason = d.seasons.find((s: any) => s.season_number > 0) ?? d.seasons[0];
        setSeason(firstSeason.season_number);
      }
    });
  }, [apiType, id]);

  useEffect(() => {
    if (apiType !== "tv") return;
    tmdb(`/tv/${id}/season/${season}`).then((d: any) => setEpisodes(d.episodes ?? []));
  }, [apiType, id, season]);

  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-white/20 border-t-[var(--theme-primary)] rounded-full animate-spin" /></div>;

  const title = getTitle(data);
  const item = { id: data.id, type: type as "movie" | "tv" | "anime", title, poster: data.poster_path, backdrop: data.backdrop_path, addedAt: Date.now() };

  return (
    <div className="pb-8">
      {showAdult && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[var(--kino-elevated)] rounded-2xl p-6 max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] flex items-center justify-center mx-auto text-2xl">!</div>
            <h3 className="text-white font-display text-xl mt-3">This content may be 18+</h3>
            <p className="text-[var(--kino-muted)] text-sm mt-2">Adult content warning.</p>
            <div className="flex flex-col gap-2 mt-6">
              <button onClick={() => setShowAdult(false)} className="h-11 rounded-full bg-[var(--theme-primary)] text-white font-semibold">Continue Watching</button>
              <button onClick={() => router.history.back()} className="h-11 rounded-full glass text-white">Go Back</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-72">
        {data.backdrop_path && <img src={IMG(data.backdrop_path, "w1280")} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
        <button onClick={() => router.history.back()} aria-label="Back"
          className="absolute top-4 left-4 w-12 h-12 rounded-full glass-dark flex items-center justify-center btn-press">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={() => {
          if (navigator.share) navigator.share({ title, url: location.href }).catch(() => {});
          else { navigator.clipboard.writeText(location.href); toast.success("Link copied"); }
        }} className="absolute top-4 right-4 w-12 h-12 rounded-full glass-dark flex items-center justify-center btn-press">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-4 -mt-12 relative">
        <div className="flex gap-3 items-end">
          <img src={IMG(data.poster_path, "w342")} alt="" className="w-28 h-40 rounded-xl object-cover shadow-2xl shrink-0" />
          <div className="flex-1 pb-2">
            <h1 className="font-display text-xl text-white leading-tight">{title}</h1>
            <p className="text-xs text-[var(--kino-muted)] mt-1">
              {getYear(data)} • <Star className="inline w-3 h-3 fill-[var(--kino-gold)] text-[var(--kino-gold)]" /> {data.vote_average?.toFixed(1)}
              {data.runtime ? ` • ${data.runtime}m` : ""}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {data.genres?.slice(0, 3).map((g: any) => <span key={g.id} className="glass px-2 py-0.5 rounded-full text-[10px] text-white">{g.name}</span>)}
            </div>
          </div>
        </div>

        <button onClick={() => navigate({ to: "/player/$type/$id", params: { type, id } })}
          className="w-full h-13 mt-5 py-3.5 rounded-full bg-[var(--theme-primary)] text-white font-semibold flex items-center justify-center gap-2 btn-press"
          style={{ boxShadow: "0 8px 30px var(--theme-glow)" }}>
          <Play className="w-4 h-4 fill-white" /> Watch Now
        </button>
        <div className="flex gap-2 mt-3">
          <button onClick={() => { const a = toggleWatchlist(item); toast.success(a ? "Added to Watchlist" : "Removed"); }}
            className="flex-1 h-11 rounded-full glass text-white text-xs font-medium flex items-center justify-center gap-1 btn-press">
            <Plus className="w-4 h-4" /> {isInWatchlist(data.id) ? "Saved" : "Watchlist"}
          </button>
          <button onClick={() => toast.success("Download started")}
            className="flex-1 h-11 rounded-full glass text-white text-xs font-medium flex items-center justify-center gap-1 btn-press">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={() => {
            if (navigator.share) navigator.share({ title, url: location.href }).catch(() => {});
            else { navigator.clipboard.writeText(location.href); toast.success("Link copied"); }
          }} className="flex-1 h-11 rounded-full glass text-white text-xs font-medium flex items-center justify-center gap-1 btn-press">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        <div className="mt-5">
          <p className={`text-white/80 text-sm ${expanded ? "" : "line-clamp-3"}`}>{data.overview}</p>
          {data.overview?.length > 150 && (
            <button onClick={() => setExpanded(!expanded)} className="text-[var(--theme-primary)] text-xs mt-1 font-semibold">
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>

        {data.credits?.cast?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">Cast</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {data.credits.cast.slice(0, 10).map((c: any) => (
                <div key={c.id} className="shrink-0 w-16 text-center">
                  {c.profile_path ? (
                    <img src={IMG(c.profile_path, "w185")} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : <div className="w-16 h-16 rounded-full bg-[var(--kino-card)] flex items-center justify-center text-xs">{c.name.split(" ").map((n: string) => n[0]).join("").slice(0,2)}</div>}
                  <p className="text-white text-[10px] mt-1 truncate">{c.name}</p>
                  <p className="text-[var(--kino-muted)] text-[10px] truncate">{c.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {apiType === "tv" && data.seasons && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Episodes</h3>
              <select value={season} onChange={(e) => setSeason(parseInt(e.target.value))}
                className="bg-[var(--kino-card)] text-white text-sm px-3 py-1.5 rounded-lg border border-white/10">
                {data.seasons.filter((s: any) => s.season_number > 0).map((s: any) => (
                  <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              {episodes.map((ep: any) => (
                <button key={ep.id} onClick={() => navigate({ to: "/player/$type/$id", params: { type, id } })}
                  className="flex gap-3 p-2 rounded-xl bg-[var(--kino-card)] text-left btn-press">
                  {ep.still_path ? (
                    <img src={IMG(ep.still_path, "w300")} alt="" className="w-28 h-16 object-cover rounded-lg shrink-0" />
                  ) : <div className="w-28 h-16 bg-[var(--kino-elevated)] rounded-lg shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] text-[var(--kino-muted)]">EP {ep.episode_number}</p>
                    <p className="text-white text-sm font-semibold truncate">{ep.name}</p>
                    <p className="text-[var(--kino-muted)] text-[10px]">{ep.runtime ? `${ep.runtime}m` : "—"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {data.similar?.results?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">More Like This</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {data.similar.results.slice(0, 12).map((s: any) => <PosterCard key={s.id} m={s} type={type as any} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
