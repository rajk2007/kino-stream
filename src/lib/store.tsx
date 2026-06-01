import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const THEMES = {
  "cinematic-red": { primary: "#E50914", glow: "rgba(229,9,20,0.35)", accent: "#C2185B" },
  "midnight-blue": { primary: "#1565C0", glow: "rgba(21,101,192,0.35)", accent: "#0288D1" },
  "purple-glow": { primary: "#7B2FBE", glow: "rgba(123,47,190,0.4)", accent: "#C2185B" },
  "amoled-black": { primary: "#FFFFFF", glow: "rgba(255,255,255,0.1)", accent: "#8a8a8a" },
};
export type ThemeKey = keyof typeof THEMES;
export const THEME_LABELS: Record<ThemeKey, string> = {
  "cinematic-red": "Cinematic Red",
  "midnight-blue": "Midnight Blue",
  "purple-glow": "Purple Glow",
  "amoled-black": "AMOLED Black",
};

export type LibItem = {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  backdrop: string | null;
  addedAt: number;
};

export type Repo = { name: string; shortcode: string; url: string; enabled: boolean };

const DEFAULT_REPOS: Repo[] = [
  { name: "Mega Repository", shortcode: "megarepo", url: "https://raw.githubusercontent.com/self-similarity/MegaRepo/builds/repo.json", enabled: true },
  { name: "CloudStream Providers", shortcode: "cspr", url: "https://raw.githubusercontent.com/recloudstream/extensions/master/repo.json", enabled: true },
  { name: "Phisher Repo", shortcode: "phisherrepo", url: "https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/repo.json", enabled: true },
  { name: "Megix Repo", shortcode: "csx", url: "https://raw.githubusercontent.com/SaurabhKaperwan/CSX/builds/CS.json", enabled: true },
];

export type Settings = {
  quality: string;
  audio: string;
  contentLang: string;
  subLang: string;
  subSize: string;
  subBg: string;
  autoplayNext: boolean;
  skipIntro: boolean;
  notifications: boolean;
  autoDownloadWifi: boolean;
  profileName: string;
  avatarColor: string;
};

const DEFAULT_SETTINGS: Settings = {
  quality: "Auto",
  audio: "Hindi",
  contentLang: "Hindi First",
  subLang: "English",
  subSize: "Medium",
  subBg: "None",
  autoplayNext: true,
  skipIntro: false,
  notifications: true,
  autoDownloadWifi: true,
  profileName: "Raj Karmakar",
  avatarColor: "#E50914",
};

type Ctx = {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  watchlist: LibItem[];
  favorites: LibItem[];
  history: LibItem[];
  completed: LibItem[];
  continueWatching: (LibItem & { progress: number; episode?: number })[];
  toggleWatchlist: (item: LibItem) => boolean;
  toggleFavorite: (item: LibItem) => boolean;
  addHistory: (item: LibItem) => void;
  isInWatchlist: (id: number) => boolean;
  isFavorite: (id: number) => boolean;
  repos: Repo[];
  setRepos: (r: Repo[]) => void;
  toggleRepo: (sc: string) => void;
  addRepo: (r: Omit<Repo, "enabled">) => void;
  settings: Settings;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  launched: boolean;
  setLaunched: (v: boolean) => void;
};

const C = createContext<Ctx | null>(null);

function useLS<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useLS<ThemeKey>("kino_theme", "cinematic-red");
  const [watchlist, setWatchlist] = useLS<LibItem[]>("kino_watchlist", []);
  const [favorites, setFavorites] = useLS<LibItem[]>("kino_favorites", []);
  const [history, setHistory] = useLS<LibItem[]>("kino_history", []);
  const [completed] = useLS<LibItem[]>("kino_completed", []);
  const [repos, setRepos] = useLS<Repo[]>("kino_repos", DEFAULT_REPOS);
  const [settings, setSettings] = useLS<Settings>("kino_settings", DEFAULT_SETTINGS);
  const [launched, setLaunchedState] = useLS<boolean>("kino_launched", false);

  const continueWatching = [
    { id: 855402, type: "movie" as const, title: "Jawan", poster: "/9XHnQp6BMl9wXNRzLCQYQEnYBwQ.jpg", backdrop: "/aTovumsNlDjof7YVoU5nW2RHaYn.jpg", addedAt: Date.now(), progress: 65 },
    { id: 37854, type: "anime" as const, title: "One Piece", poster: "/e3NBGiAifW9Xt8xD5tpARskjccO.jpg", backdrop: "/wPN9TvXjMu3JZpf9ZuJEW80Bsbu.jpg", addedAt: Date.now(), progress: 30, episode: 4 },
    { id: 76479, type: "tv" as const, title: "The Boys", poster: "/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg", backdrop: "/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg", addedAt: Date.now(), progress: 80, episode: 2 },
    { id: 758323, type: "movie" as const, title: "RRR", poster: "/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg", backdrop: "/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg", addedAt: Date.now(), progress: 45 },
  ];

  useEffect(() => {
    const t = THEMES[theme];
    document.documentElement.style.setProperty("--theme-primary", t.primary);
    document.documentElement.style.setProperty("--theme-glow", t.glow);
    document.documentElement.style.setProperty("--theme-accent", t.accent);
  }, [theme]);

  const toggleWatchlist = (item: LibItem) => {
    const exists = watchlist.some(w => w.id === item.id);
    setWatchlist(exists ? watchlist.filter(w => w.id !== item.id) : [item, ...watchlist]);
    return !exists;
  };
  const toggleFavorite = (item: LibItem) => {
    const exists = favorites.some(w => w.id === item.id);
    setFavorites(exists ? favorites.filter(w => w.id !== item.id) : [item, ...favorites]);
    return !exists;
  };
  const addHistory = (item: LibItem) => {
    setHistory([item, ...history.filter(h => h.id !== item.id)].slice(0, 50));
  };

  return (
    <C.Provider value={{
      theme, setTheme: setThemeState,
      watchlist, favorites, history, completed, continueWatching,
      toggleWatchlist, toggleFavorite, addHistory,
      isInWatchlist: (id) => watchlist.some(w => w.id === id),
      isFavorite: (id) => favorites.some(w => w.id === id),
      repos, setRepos,
      toggleRepo: (sc) => setRepos(repos.map(r => r.shortcode === sc ? { ...r, enabled: !r.enabled } : r)),
      addRepo: (r) => setRepos([...repos, { ...r, enabled: true }]),
      settings,
      setSetting: (k, v) => setSettings({ ...settings, [k]: v }),
      launched, setLaunched: setLaunchedState,
    }}>{children}</C.Provider>
  );
}

export const useApp = () => {
  const c = useContext(C);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
};
