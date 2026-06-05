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

type RowType = "movie" | "tv" | "anime";
type RowDef = { key: string; title: string; data: Media[] | undefined; type?: RowType };

function Home() {
  const navigate = useNavigate();
  const { continueWatching, toggleWatchlist, isInWatchlist } = useApp();
  const [category, setCategory] = useState<Category>("Trending");

  // ===== Shared / Trending =====
  const trending = useFetch(() => tmdb<{ results: Media[] }>("/trending/all/week"));
  const trendingMovies = useFetch(() => tmdb<{ results: Media[] }>("/trending/movie/week"));
  const trendingTV = useFetch(() => tmdb<{ results: Media[] }>("/trending/tv/week"));

  // ===== Movies =====
  const popMovies = useFetch(() => tmdb<{ results: Media[] }>("/movie/popular"));
  const topRatedMovies = useFetch(() => tmdb<{ results: Media[] }>("/movie/top_rated"));
  const nowPlaying = useFetch(() => tmdb<{ results: Media[] }>("/movie/now_playing"));
  const upcoming = useFetch(() => tmdb<{ results: Media[] }>("/movie/upcoming"));
  const actionMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_genres: "28", sort_by: "popularity.desc" }));
  const comedyMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_genres: "35", sort_by: "popularity.desc" }));
  const thrillerMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_genres: "53", sort_by: "popularity.desc" }));

  // ===== Series =====
  const popTV = useFetch(() => tmdb<{ results: Media[] }>("/tv/popular"));
  const topRatedTV = useFetch(() => tmdb<{ results: Media[] }>("/tv/top_rated"));
  const airingToday = useFetch(() => tmdb<{ results: Media[] }>("/tv/airing_today"));
  const onTheAir = useFetch(() => tmdb<{ results: Media[] }>("/tv/on_the_air"));
  const crimeTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "80", sort_by: "popularity.desc" }));
  const dramaTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "18", sort_by: "popularity.desc" }));
  const actionTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "10759", sort_by: "popularity.desc" }));

  // ===== Anime =====
  const popAnime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc" }));
  const topAnime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16", with_original_language: "ja", sort_by: "vote_average.desc", "vote_count.gte": "100" }));
  const newAnime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16", with_original_language: "ja", sort_by: "first_air_date.desc" }));
  const actionAnime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16,10759", with_original_language: "ja", sort_by: "popularity.desc" }));
  const romanceAnime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16,10749", with_original_language: "ja", sort_by: "popularity.desc" }));
  const fantasyAnime = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_genres: "16,10765", with_original_language: "ja", sort_by: "popularity.desc" }));

  // ===== Hindi =====
  const hindiMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "hi", sort_by: "popularity.desc" }));
  const hindiTopRated = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "hi", sort_by: "vote_average.desc", "vote_count.gte": "50" }));
  const hindiTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "hi", sort_by: "popularity.desc" }));
  const hindiAction = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "hi", with_genres: "28", sort_by: "popularity.desc" }));
  const hindiComedy = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "hi", with_genres: "35", sort_by: "popularity.desc" }));

  // ===== English =====
  const englishMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "en", sort_by: "popularity.desc" }));
  const englishTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "en", sort_by: "popularity.desc" }));
  const englishAction = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "en", with_genres: "28", sort_by: "popularity.desc" }));
  const englishComedy = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "en", with_genres: "35", sort_by: "popularity.desc" }));
  const englishThriller = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "en", with_genres: "53", sort_by: "popularity.desc" }));

  // ===== Tamil =====
  const tamilMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "ta", sort_by: "popularity.desc" }));
  const tamilTop = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "ta", sort_by: "vote_average.desc", "vote_count.gte": "20" }));
  const tamilTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ta", sort_by: "popularity.desc" }));
  const tamilAction = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "ta", with_genres: "28", sort_by: "popularity.desc" }));

  // ===== Telugu =====
  const teluguMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "te", sort_by: "popularity.desc" }));
  const teluguTop = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "te", sort_by: "vote_average.desc", "vote_count.gte": "20" }));
  const teluguTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "te", sort_by: "popularity.desc" }));
  const teluguAction = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "te", with_genres: "28", sort_by: "popularity.desc" }));

  // ===== Korean =====
  const koreanTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ko", sort_by: "popularity.desc" }));
  const koreanTop = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ko", sort_by: "vote_average.desc", "vote_count.gte": "50" }));
  const koreanMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "ko", sort_by: "popularity.desc" }));
  const koreanRomance = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ko", with_genres: "18", sort_by: "popularity.desc" }));
  const koreanThriller = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ko", with_genres: "9648", sort_by: "popularity.desc" }));

  // ===== Japanese =====
  const japaneseTV = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ja", sort_by: "popularity.desc" }));
  const japaneseMovies = useFetch(() => tmdb<{ results: Media[] }>("/discover/movie", { with_original_language: "ja", sort_by: "popularity.desc" }));
  const japaneseDrama = useFetch(() => tmdb<{ results: Media[] }>("/discover/tv", { with_original_language: "ja", with_genres: "18", sort_by: "popularity.desc" }));

  // Hero source
  const heroSourceMap: Record<Category, Media[] | undefined> = {
    Trending: trending?.results,
    Movies: popMovies?.results,
    Series: popTV?.results,
    Anime: popAnime?.results,
    Hindi: hindiMovies?.results,
    English: englishMovies?.results,
    Tamil: tamilMovies?.results,
    Telugu: teluguMovies?.results,
    Korean: koreanTV?.results,
    Japanese: japaneseTV?.results,
  };
  const heroItems = (heroSourceMap[category] ?? trending?.results ?? []).slice(0, 5);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => { setHeroIdx(0); }, [category]);
  useEffect(() => {
    if (!heroItems.length) return;
    const i = setInterval(() => setHeroIdx((x) => (x + 1) % heroItems.length), 5000);
    return () => clearInterval(i);
  }, [heroItems.length]);
  const hero = heroItems[heroIdx];

  // Rows per category
  const visibleRows: RowDef[] = useMemo(() => {
    switch (category) {
      case "Trending":
        return [
          { key: "trending", title: "Trending Now", data: trending?.results },
          { key: "tmovies", title: "Trending Movies", data: trendingMovies?.results, type: "movie" },
          { key: "ttv", title: "Trending TV Shows", data: trendingTV?.results, type: "tv" },
          { key: "hindi", title: "🇮🇳 Hindi Dubbed For You", data: hindiMovies?.results, type: "movie" },
          { key: "popmovies", title: "Popular Movies", data: popMovies?.results, type: "movie" },
          { key: "anime", title: "🎌 Anime Picks", data: popAnime?.results, type: "anime" },
          { key: "latest", title: "Latest Episodes", data: onTheAir?.results, type: "tv" },
          { key: "toprated", title: "Top Rated", data: topRatedMovies?.results, type: "movie" },
          { key: "recommended", title: "Recommended For You", data: nowPlaying?.results, type: "movie" },
        ];
      case "Movies":
        return [
          { key: "now", title: "Now Playing", data: nowPlaying?.results, type: "movie" },
          { key: "popmovies", title: "Popular Movies", data: popMovies?.results, type: "movie" },
          { key: "topmovies", title: "Top Rated Movies", data: topRatedMovies?.results, type: "movie" },
          { key: "upcoming", title: "Upcoming Movies", data: upcoming?.results, type: "movie" },
          { key: "hindi", title: "🇮🇳 Hindi Dubbed Movies", data: hindiMovies?.results, type: "movie" },
          { key: "action", title: "Action Movies", data: actionMovies?.results, type: "movie" },
          { key: "comedy", title: "Comedy Movies", data: comedyMovies?.results, type: "movie" },
          { key: "thriller", title: "Thriller Movies", data: thrillerMovies?.results, type: "movie" },
          { key: "rec", title: "Recommended Movies", data: trendingMovies?.results, type: "movie" },
        ];
      case "Series":
        return [
          { key: "poptv", title: "Popular TV Shows", data: popTV?.results, type: "tv" },
          { key: "toptv", title: "Top Rated TV", data: topRatedTV?.results, type: "tv" },
          { key: "airing", title: "Airing Today", data: airingToday?.results, type: "tv" },
          { key: "ontheair", title: "On The Air", data: onTheAir?.results, type: "tv" },
          { key: "crime", title: "Crime Shows", data: crimeTV?.results, type: "tv" },
          { key: "drama", title: "Drama Series", data: dramaTV?.results, type: "tv" },
          { key: "actiontv", title: "Action Series", data: actionTV?.results, type: "tv" },
          { key: "hinditv", title: "🇮🇳 Hindi Dubbed Series", data: hindiTV?.results, type: "tv" },
          { key: "rectv", title: "Recommended Series", data: trendingTV?.results, type: "tv" },
        ];
      case "Anime":
        return [
          { key: "popanime", title: "Popular Anime", data: popAnime?.results, type: "anime" },
          { key: "topanime", title: "Top Rated Anime", data: topAnime?.results, type: "anime" },
          { key: "newanime", title: "New Anime Episodes", data: newAnime?.results, type: "anime" },
          { key: "actionanime", title: "Action Anime", data: actionAnime?.results, type: "anime" },
          { key: "romanime", title: "Romance Anime", data: romanceAnime?.results, type: "anime" },
          { key: "fanime", title: "Fantasy Anime", data: fantasyAnime?.results, type: "anime" },
          { key: "hindianime", title: "🇮🇳 Hindi Dubbed Anime", data: popAnime?.results, type: "anime" },
          { key: "recanime", title: "Recommended Anime", data: popAnime?.results, type: "anime" },
        ];
      case "Hindi":
        return [
          { key: "hindim", title: "Hindi Dubbed Movies", data: hindiMovies?.results, type: "movie" },
          { key: "bolly", title: "Bollywood Popular", data: hindiMovies?.results, type: "movie" },
          { key: "bollytop", title: "Bollywood Top Rated", data: hindiTopRated?.results, type: "movie" },
          { key: "hinditv", title: "Hindi TV Shows", data: hindiTV?.results, type: "tv" },
          { key: "hindianime", title: "Hindi Dubbed Anime", data: popAnime?.results, type: "anime" },
          { key: "hindiaction", title: "Hindi Action Movies", data: hindiAction?.results, type: "movie" },
          { key: "hindicomedy", title: "Hindi Comedy Movies", data: hindiComedy?.results, type: "movie" },
          { key: "hindirec", title: "Recommended Hindi", data: hindiMovies?.results, type: "movie" },
        ];
      case "English":
        return [
          { key: "engm", title: "Popular English Movies", data: englishMovies?.results, type: "movie" },
          { key: "engtv", title: "Popular English Shows", data: englishTV?.results, type: "tv" },
          { key: "holly", title: "Hollywood Top Rated", data: topRatedMovies?.results, type: "movie" },
          { key: "netflix", title: "Netflix Originals", data: englishTV?.results, type: "tv" },
          { key: "engaction", title: "English Action", data: englishAction?.results, type: "movie" },
          { key: "engcomedy", title: "English Comedy", data: englishComedy?.results, type: "movie" },
          { key: "engthriller", title: "English Thriller", data: englishThriller?.results, type: "movie" },
        ];
      case "Tamil":
        return [
          { key: "tamilm", title: "Popular Tamil Movies", data: tamilMovies?.results, type: "movie" },
          { key: "tamiltop", title: "Top Rated Tamil", data: tamilTop?.results, type: "movie" },
          { key: "tamiltv", title: "Tamil TV Shows", data: tamilTV?.results, type: "tv" },
          { key: "tamilaction", title: "Tamil Action", data: tamilAction?.results, type: "movie" },
        ];
      case "Telugu":
        return [
          { key: "telugum", title: "Popular Telugu Movies", data: teluguMovies?.results, type: "movie" },
          { key: "telugutop", title: "Top Rated Telugu", data: teluguTop?.results, type: "movie" },
          { key: "telugutv", title: "Telugu TV Shows", data: teluguTV?.results, type: "tv" },
          { key: "teluguaction", title: "Telugu Action", data: teluguAction?.results, type: "movie" },
        ];
      case "Korean":
        return [
          { key: "ktv", title: "Popular K-Dramas", data: koreanTV?.results, type: "tv" },
          { key: "ktop", title: "Top Rated Korean", data: koreanTop?.results, type: "tv" },
          { key: "km", title: "Korean Movies", data: koreanMovies?.results, type: "movie" },
          { key: "krom", title: "Korean Romance", data: koreanRomance?.results, type: "tv" },
          { key: "kthr", title: "Korean Thriller", data: koreanThriller?.results, type: "tv" },
        ];
      case "Japanese":
        return [
          { key: "jtv", title: "Popular Japanese TV", data: japaneseTV?.results, type: "tv" },
          { key: "jm", title: "Japanese Movies", data: japaneseMovies?.results, type: "movie" },
          { key: "janime", title: "Anime", data: popAnime?.results, type: "anime" },
          { key: "jdrama", title: "Japanese Drama", data: japaneseDrama?.results, type: "tv" },
        ];
      default:
        return [];
    }
  }, [
    category, trending, trendingMovies, trendingTV, popMovies, topRatedMovies, nowPlaying, upcoming,
    actionMovies, comedyMovies, thrillerMovies, popTV, topRatedTV, airingToday, onTheAir, crimeTV,
    dramaTV, actionTV, popAnime, topAnime, newAnime, actionAnime, romanceAnime, fantasyAnime,
    hindiMovies, hindiTopRated, hindiTV, hindiAction, hindiComedy, englishMovies, englishTV,
    englishAction, englishComedy, englishThriller, tamilMovies, tamilTop, tamilTV, tamilAction,
    teluguMovies, teluguTop, teluguTV, teluguAction, koreanTV, koreanTop, koreanMovies,
    koreanRomance, koreanThriller, japaneseTV, japaneseMovies, japaneseDrama,
  ]);

  const filteredContinue = useMemo(() => {
    if (category === "Movies") return continueWatching.filter((c) => c.type === "movie");
    if (category === "Series") return continueWatching.filter((c) => c.type === "tv");
    if (category === "Anime") return continueWatching.filter((c) => c.type === "anime");
    return continueWatching;
  }, [continueWatching, category]);

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

      {filteredContinue.length > 0 && (
        <Row title="Continue Watching">
          {filteredContinue.map(c => <ContinueCard key={c.id} item={c} />)}
        </Row>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {visibleRows.map((r) => {
            // While loading, render skeleton row; once loaded, skip if empty
            if (r.data === undefined) {
              return (
                <Row key={r.key} title={r.title}>
                  {Array.from({ length: 5 }).map((_, i) => <PosterSkeleton key={i} />)}
                </Row>
              );
            }
            if (r.data.length === 0) return null;
            return (
              <Row key={r.key} title={r.title}>
                {r.data.slice(0, 15).map((m) => <PosterCard key={m.id} m={m} type={r.type} />)}
              </Row>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
