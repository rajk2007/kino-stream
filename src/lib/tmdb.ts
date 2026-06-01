export const TMDB_KEY = "cf5a2b948bb3cbe03332dc70594b4ba7";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const IMG = (path: string | null | undefined, size = "w342") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export type Media = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: string;
  genre_ids?: number[];
  original_language?: string;
  adult?: boolean;
};

export async function tmdb<T = any>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error("TMDb error");
  return r.json();
}

export const getTitle = (m: Media) => m.title || m.name || "Untitled";
export const getYear = (m: Media) => (m.release_date || m.first_air_date || "").slice(0, 4);
export const isAnime = (m: Media) =>
  m.original_language === "ja" && m.genre_ids?.includes(16);

export const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10765: "Sci-Fi & Fantasy", 10762: "Kids",
  10763: "News", 10764: "Reality", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};
