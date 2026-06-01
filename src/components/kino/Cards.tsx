import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { IMG, getTitle, getYear, type Media, isAnime } from "@/lib/tmdb";
import { Star } from "lucide-react";

export function PosterCard({ m, type: typeProp }: { m: Media; type?: "movie" | "tv" | "anime" }) {
  const type = typeProp || (m.media_type === "tv" || isAnime(m) ? (isAnime(m) ? "anime" : "tv") : "movie");
  const hindi = m.original_language === "hi";
  const anime = isAnime(m) || type === "anime";

  return (
    <Link to="/details/$type/$id" params={{ type, id: String(m.id) }} className="shrink-0 block">
      <motion.div whileTap={{ scale: 0.95 }} className="relative w-[120px] h-[180px] rounded-xl overflow-hidden bg-[var(--kino-card)]">
        {m.poster_path ? (
          <img src={IMG(m.poster_path, "w342")} alt={getTitle(m)} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--kino-muted)] text-xs font-display">{getTitle(m).slice(0,2).toUpperCase()}</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[var(--kino-gold)] text-black font-mono text-[10px] font-bold flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-black" />{m.vote_average.toFixed(1)}
        </div>
        <div className="absolute top-1.5 left-1.5 glass px-1.5 py-0.5 rounded text-[9px] font-bold text-white">HD</div>
        {hindi && <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[var(--kino-hindi-badge)] text-white text-[9px] font-bold">HI</div>}
        {anime && <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[var(--kino-anime-badge)] text-white text-[9px] font-bold">{type === "anime" ? "SUB" : "DUB"}</div>}
        <div className="absolute inset-x-0 bottom-0 p-2 text-white text-[11px] font-medium leading-tight line-clamp-2">{getTitle(m)}</div>
      </motion.div>
    </Link>
  );
}

export function ContinueCard({ item }: { item: { id: number; type: string; title: string; backdrop: string | null; progress: number; episode?: number } }) {
  return (
    <Link to="/player/$type/$id" params={{ type: item.type, id: String(item.id) }} className="shrink-0 block">
      <motion.div whileTap={{ scale: 0.95 }} className="w-[180px]">
        <div className="relative w-full h-[110px] rounded-xl overflow-hidden bg-[var(--kino-card)]">
          {item.backdrop ? (
            <img src={IMG(item.backdrop, "w500")} alt={item.title} className="w-full h-full object-cover" />
          ) : <div className="w-full h-full bg-[var(--kino-elevated)]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
              <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-0.5" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div className="h-full bg-[var(--theme-primary)]" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-white text-xs font-medium truncate">{item.title}</p>
          <p className="text-[var(--kino-muted)] text-[10px]">
            {item.episode ? `Resume Ep ${item.episode}` : "Resume"} • {item.progress}%
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function Row({ title, children, onSeeAll }: { title: string; children: React.ReactNode; onSeeAll?: () => void }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-white font-semibold text-base">{title}</h2>
        {onSeeAll && <button onClick={onSeeAll} className="text-[var(--kino-muted)] text-xs">See All</button>}
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-2">{children}</div>
    </section>
  );
}

export function PosterSkeleton() {
  return <div className="shrink-0 w-[120px] h-[180px] rounded-xl shimmer" />;
}
