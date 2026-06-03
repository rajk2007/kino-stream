import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Star } from "lucide-react";
import { tmdb, IMG, getTitle, getYear, GENRES, type Media } from "@/lib/tmdb";
import { Row, PosterCard, PosterSkeleton, ContinueCard } from "@/components/kino/Cards";
import { TopHeader, CategoryBar, type Category } from "@/components/kino/Header";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Home });

function useFetch<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => { fn().then(setData).catch(() => {}); /* eslint-disable-next-line */ }, deps);
  return data;
}

type RowDef = { key: string; title: string; data: Media[] | undefined; type?: "movie" | "tv" | "anime" };

function Home() {
  const navigate = useNavigate();
  const { continueWatching, toggleWatchlist, isInWatchlist } = useApp();
  const [category, setCategory] = useState<Category>("Trending");

  const trending = useFetch(() => tmdb<{ results: Media[] }>("/trending/all/week"));
  const popMovies = useFetch(() => tmdb<{ results: Media[] }>("/movie/popular"));
  const popTV = useFetch(() => tmdb<{ results: Media[] }>("/tv/popular"));
  const topRated = useFetch(() => tmdb<{ results: Media[] }>("/movie/top_rated"));
  const anime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16", with_original_language: "ja" }));
  const nowPlaying = useFetch(() => tmdb<{ results: Media[] }>("/movie/now_playing"));
  const hindi = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "hi", sort_by: "popularity.desc" }));
  const english = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "en", sort_by: "popularity.desc" }));
  const tamil = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "ta", sort_by: "popularity.desc" }));
  const telugu = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "te", sort_by: "popularity.desc" }));
  const korean = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ko", sort_by: "popularity.desc" }));
  const japanese = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ja", sort_by: "popularity.desc" }));

  const heroItems = trending?.results.slice(0, 5) ?? [];
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (!heroItems.length) return;
    const i = setInterval(() => setHeroIdx((x) => (x + 1) % heroItems.length), 5000);
    return () => clearInterval(i);
  }, [heroItems.length]);
  const hero = heroItems[heroIdx];

  const allRows: RowDef[] = useMemo(() => [
    { key: "trending", title: "Trending Now", data: trending?.results },
    { key: "hindi", title: "🇮🇳 Hindi Dubbed For You", data: hindi?.results, type: "movie" },
    { key: "movies", title: "Popular Movies", data: popMovies?.results, type: "movie" },
    { key: "anime", title: "🎌 Anime Picks", data: anime?.results, type: "anime" },
    { key: "series", title: "Latest Episodes", data: popTV?.results, type: "tv" },
    { key: "toprated", title: "Top Rated", data: topRated?.results, type: "movie" },
    { key: "english", title: "English Movies", data: english?.results, type: "movie" },
    { key: "tamil", title: "Tamil Cinema", data: tamil?.results, type: "movie" },
    { key: "telugu", title: "Telugu Cinema", data: telugu?.results, type: "movie" },
    { key: "korean", title: "K-Drama", data: korean?.results, type: "tv" },
    { key: "japanese", title: "Japanese Shows", data: japanese?.results, type: "tv" },
    { key: "now", title: "Recommended For You", data: nowPlaying?.results, type: "movie" },
  ], [trending, hindi, popMovies, anime, popTV, topRated, english, tamil, telugu, korean, japanese, nowPlaying]);

  const orderedRows = useMemo(() => {
    const priorityMap: Record<Category, string[]> = {
      Trending: ["trending"],
      Movies: ["movies", "toprated"],
      Series: ["series"],
      Anime: ["anime"],
      Hindi: ["hindi"],
      English: ["english"],
      Tamil: ["tamil"],
      Telugu: ["telugu"],
      Korean: ["korean"],
      Japanese: ["japanese"],
    };
    const priority = priorityMap[category] ?? [];
    return [...allRows].sort((a, b) => {
      const ai = priority.indexOf(a.key);
      const bi = priority.indexOf(b.key);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [allRows, category]);

  return (
    <div className="pb-4">
      <TopHeader />
      <CategoryBar active={category} onChange={setCategory} />

      {/* HERO */}
      <section className="relative h-[52vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {hero && (
            <motion.div key={hero.id} className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.img src={IMG(hero.backdrop_path, "w1280")} alt={getTitle(hero)} className="w-full h-full object-cover"
                animate={{ scale: 1.08 }} transition={{ duration: 6, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/90 via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
        {hero && (
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--theme-primary)] text-white text-[10px] font-bold tracking-wider mb-2">
              {hero.media_type === "tv" ? "SERIES" : hero.media_type === "movie" ? "MOVIE" : "TRENDING"}
            </span>
            <h1 className="font-display text-2xl text-white drop-shadow-lg leading-tight line-clamp-2">{getTitle(hero)}</h1>
            <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
              <span>{getYear(hero)}</span>
              <span>•</span>
              <Star className="w-3 h-3 fill-[var(--kino-gold)] text-[var(--kino-gold)]" />
              <span className="font-mono">{hero.vote_average.toFixed(1)}</span>
              <span>•</span>
              <span className="text-white/60">{(hero.genre_ids?.slice(0, 2) ?? []).map(g => GENRES[g] ?? "Drama").join(" • ")}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => navigate({ to: "/player/$type/$id", params: { type: hero.media_type === "tv" ? "tv" : "movie", id: String(hero.id) } })}
                className="flex-1 h-11 rounded-full bg-[var(--theme-primary)] text-white font-semibold flex items-center justify-center gap-2 btn-press text-sm"
                style={{ boxShadow: "0 8px 30px var(--theme-glow)" }}
              ><Play className="w-4 h-4 fill-white" /> Watch Now</button>
              <button
                onClick={() => {
                  const added = toggleWatchlist({
                    id: hero.id, type: hero.media_type === "tv" ? "tv" : "movie", title: getTitle(hero),
                    poster: hero.poster_path, backdrop: hero.backdrop_path, addedAt: Date.now(),
                  });
                  toast.success(added ? "Added to Watchlist" : "Removed from Watchlist");
                }}
                className="flex-1 h-11 rounded-full glass text-white font-semibold flex items-center justify-center gap-2 btn-press text-sm">
                <Plus className="w-4 h-4" /> {isInWatchlist(hero.id) ? "In Watchlist" : "Watchlist"}
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {heroItems.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroIdx ? "w-6 bg-[var(--theme-primary)]" : "w-1.5 bg-white/30"}`} />
              ))}
            </div>
          </div>
        )}
      </section>

      {continueWatching.length > 0 && (
        <Row title="Continue Watching">
          {continueWatching.map(c => <ContinueCard key={c.id} item={c} />)}
        </Row>
      )}

      <AnimatePresence initial={false}>
        {orderedRows.map((r) => (
          <motion.div
            key={r.key}
            layout
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Row title={r.title}>
              {r.data?.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type={r.type} />)
                ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
            </Row>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
