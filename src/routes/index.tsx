import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Star } from "lucide-react";
import { tmdb, IMG, getTitle, getYear, GENRES, type Media } from "@/lib/tmdb";
import { Row, PosterCard, PosterSkeleton, ContinueCard } from "@/components/kino/Cards";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Home });

function useFetch<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => { fn().then(setData).catch(() => {}); /* eslint-disable-next-line */ }, deps);
  return data;
}

function Home() {
  const navigate = useNavigate();
  const { continueWatching, toggleWatchlist, isInWatchlist } = useApp();
  const trending = useFetch(() => tmdb<{ results: Media[] }>("/trending/all/week"));
  const popMovies = useFetch(() => tmdb<{ results: Media[] }>("/movie/popular"));
  const popTV = useFetch(() => tmdb<{ results: Media[] }>("/tv/popular"));
  const topRated = useFetch(() => tmdb<{ results: Media[] }>("/movie/top_rated"));
  const anime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16", with_original_language: "ja" }));
  const nowPlaying = useFetch(() => tmdb<{ results: Media[] }>("/movie/now_playing"));
  const hindi = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "hi", sort_by: "popularity.desc" }));

  const heroItems = trending?.results.slice(0, 5) ?? [];
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (!heroItems.length) return;
    const i = setInterval(() => setHeroIdx((x) => (x + 1) % heroItems.length), 5000);
    return () => clearInterval(i);
  }, [heroItems.length]);

  const hero = heroItems[heroIdx];

  return (
    <div className="pb-4">
      {/* HERO */}
      <section className="relative h-[75vh] w-full overflow-hidden">
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
          <div className="absolute inset-x-0 bottom-0 p-6 pb-10">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--theme-primary)] text-white text-[10px] font-bold tracking-wider mb-3">
              {hero.media_type === "tv" ? "SERIES" : hero.media_type === "movie" ? "MOVIE" : "TRENDING"}
            </span>
            <h1 className="font-display text-3xl text-white drop-shadow-lg leading-tight line-clamp-2">{getTitle(hero)}</h1>
            <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
              <span>{getYear(hero)}</span>
              <span>•</span>
              <Star className="w-3 h-3 fill-[var(--kino-gold)] text-[var(--kino-gold)]" />
              <span className="font-mono">{hero.vote_average.toFixed(1)}</span>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {hero.genre_ids?.slice(0, 3).map(g => (
                <span key={g} className="glass px-2 py-0.5 rounded-full text-[10px] text-white">{GENRES[g] ?? "Drama"}</span>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => navigate({ to: "/player/$type/$id", params: { type: hero.media_type === "tv" ? "tv" : "movie", id: String(hero.id) } })}
                className="flex-1 h-12 rounded-full bg-[var(--theme-primary)] text-white font-semibold flex items-center justify-center gap-2 btn-press"
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
                className="flex-1 h-12 rounded-full glass text-white font-semibold flex items-center justify-center gap-2 btn-press">
                <Plus className="w-4 h-4" /> {isInWatchlist(hero.id) ? "In Watchlist" : "Watchlist"}
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {heroItems.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroIdx ? "w-6 bg-[var(--theme-primary)]" : "w-1.5 bg-white/30"}`} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Row title="Continue Watching">
        {continueWatching.map(c => <ContinueCard key={c.id} item={c} />)}
      </Row>

      <Row title="Trending Now">
        {trending?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>

      <Row title="🇮🇳 Hindi Dubbed For You">
        {hindi?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type="movie" />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>

      <Row title="Popular Movies">
        {popMovies?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type="movie" />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>

      <Row title="🎌 Anime Picks">
        {anime?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type="anime" />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>

      <Row title="Latest Episodes">
        {popTV?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type="tv" />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>

      <Row title="Top Rated">
        {topRated?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type="movie" />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>

      <Row title="Recommended For You">
        {nowPlaying?.results.slice(0, 15).map(m => <PosterCard key={m.id} m={m} type="movie" />) ?? Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
      </Row>
    </div>
  );
}
