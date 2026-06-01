import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, Info, Download as DLIcon } from "lucide-react";
import { useApp, THEME_LABELS, type ThemeKey } from "@/lib/store";
import { BottomSheet, OptionList } from "@/components/kino/BottomSheet";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: Profile });

type Sheet = null | "edit" | "quality" | "audio" | "contentLang" | "subLang" | "subSize" | "subBg" | "addRepo" | "about" | "clearCache" | "repoDetail";

const AVATAR_COLORS = ["#E50914", "#7B2FBE", "#C2185B", "#F5C518", "#00BFA5", "#1565C0"];

function Profile() {
  const navigate = useNavigate();
  const { settings, setSetting, theme, setTheme, repos, toggleRepo, addRepo } = useApp();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [editName, setEditName] = useState(settings.profileName);
  const [editColor, setEditColor] = useState(settings.avatarColor);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [newRepoCode, setNewRepoCode] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<typeof repos[number] | null>(null);

  const Tile = ({ k }: { k: ThemeKey }) => {
    const grads: Record<ThemeKey, string> = {
      "cinematic-red": "from-red-600 via-red-800 to-black",
      "midnight-blue": "from-blue-700 via-blue-900 to-black",
      "purple-glow": "from-purple-600 via-fuchsia-700 to-black",
      "amoled-black": "from-zinc-900 via-black to-black",
    };
    const active = theme === k;
    return (
      <button onClick={() => { setTheme(k); toast.success(`Theme: ${THEME_LABELS[k]}`); }}
        className={`relative h-24 rounded-2xl bg-gradient-to-br ${grads[k]} btn-press overflow-hidden ${active ? "ring-2 ring-[var(--theme-primary)]" : ""}`}>
        <span className="absolute bottom-2 left-2 text-white font-semibold text-xs">{THEME_LABELS[k]}</span>
        {active && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--theme-primary)]" />}
      </button>
    );
  };

  const Row = ({ label, value, onClick, right }: { label: string; value?: string; onClick?: () => void; right?: React.ReactNode }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 active:bg-white/10 transition-colors">
      <span className="text-white text-sm">{label}</span>
      <span className="flex items-center gap-2 text-[var(--kino-muted)] text-xs">
        {value && <span>{value}</span>}
        {right ?? <ChevronRight className="w-4 h-4" />}
      </span>
    </button>
  );

  const Toggle = ({ label, k }: { label: string; k: "autoplayNext" | "skipIntro" | "notifications" | "autoDownloadWifi" }) => (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-white text-sm">{label}</span>
      <button onClick={() => setSetting(k, !settings[k])}
        className={`relative w-11 h-6 rounded-full transition ${settings[k] ? "bg-[var(--theme-primary)]" : "bg-white/15"}`}>
        <motion.div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
          animate={{ x: settings[k] ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </button>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mt-5">
      <h3 className="px-4 mb-2 text-[var(--kino-muted)] text-xs uppercase tracking-wider">{title}</h3>
      <div className="bg-[var(--kino-card)] divide-y divide-white/5 rounded-2xl mx-4 overflow-hidden">{children}</div>
    </div>
  );

  return (
    <div className="pb-4">
      {/* Profile card */}
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)] via-purple-900 to-black animate-mesh" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end gap-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-display text-2xl text-white glass" style={{ background: settings.avatarColor }}>
            {settings.profileName.split(" ").map(n => n[0]).join("").slice(0,2)}
          </div>
          <div className="flex-1 mb-1">
            <p className="text-white font-bold text-lg">{settings.profileName}</p>
            <p className="text-[var(--kino-gold)] text-xs">⭐ Premium Member</p>
          </div>
          <button onClick={() => { setEditName(settings.profileName); setEditColor(settings.avatarColor); setSheet("edit"); }}
            className="px-3 py-1.5 rounded-full glass text-white text-xs font-semibold btn-press">Edit Profile</button>
        </div>
      </div>

      <Section title="Playback">
        <Row label="Default Quality" value={settings.quality} onClick={() => setSheet("quality")} />
        <Row label="Default Audio" value={settings.audio} onClick={() => setSheet("audio")} />
        <Toggle label="Autoplay Next Episode" k="autoplayNext" />
        <Toggle label="Skip Intro Automatically" k="skipIntro" />
      </Section>

      <Section title="Language & Subtitles">
        <Row label="Content Language" value={settings.contentLang} onClick={() => setSheet("contentLang")} />
        <Row label="Subtitle Language" value={settings.subLang} onClick={() => setSheet("subLang")} />
        <Row label="Subtitle Size" value={settings.subSize} onClick={() => setSheet("subSize")} />
        <Row label="Subtitle Background" value={settings.subBg} onClick={() => setSheet("subBg")} />
      </Section>

      <div className="mt-5">
        <h3 className="px-4 mb-2 text-[var(--kino-muted)] text-xs uppercase tracking-wider">Theme</h3>
        <div className="px-4 grid grid-cols-2 gap-3">
          {(Object.keys(THEME_LABELS) as ThemeKey[]).map(k => <Tile key={k} k={k} />)}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="px-4 mb-2 text-[var(--kino-muted)] text-xs uppercase tracking-wider">Content Sources</h3>
        <div className="bg-[var(--kino-card)] divide-y divide-white/5 rounded-2xl mx-4 overflow-hidden">
          {repos.map(r => (
            <div key={r.shortcode} className="flex items-center px-4 py-3 gap-3">
              <button className="flex-1 text-left" onClick={() => { setSelectedRepo(r); setSheet("repoDetail"); }}>
                <p className="text-white text-sm font-medium">{r.name}</p>
                <span className="inline-block mt-1 font-mono text-[10px] glass px-2 py-0.5 rounded text-[var(--kino-muted)]">{r.shortcode}</span>
              </button>
              <button onClick={() => toggleRepo(r.shortcode)}
                className={`relative w-11 h-6 rounded-full ${r.enabled ? "bg-[var(--theme-primary)]" : "bg-white/15"}`}>
                <motion.div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                  animate={{ x: r.enabled ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setSheet("addRepo")}
          className="mt-3 mx-4 w-[calc(100%-2rem)] h-11 rounded-full border border-[var(--theme-primary)] text-[var(--theme-primary)] text-sm font-semibold flex items-center justify-center gap-1 btn-press">
          <Plus className="w-4 h-4" /> Add Repository
        </button>
      </div>

      <Section title="Account">
        <Toggle label="Notifications" k="notifications" />
        <Toggle label="Auto-Download on WiFi" k="autoDownloadWifi" />
        <Row label="Clear Cache" onClick={() => setSheet("clearCache")} right={<Trash2 className="w-4 h-4" />} />
        <Row label="Downloads Manager" onClick={() => navigate({ to: "/library", search: { tab: "downloads" } })} right={<DLIcon className="w-4 h-4" />} />
        <Row label="About Kino" onClick={() => setSheet("about")} right={<Info className="w-4 h-4" />} />
      </Section>

      {/* Sheets */}
      <BottomSheet open={sheet === "edit"} onClose={() => setSheet(null)} title="Edit Profile">
        <label className="text-white/60 text-xs">Name</label>
        <input value={editName} onChange={e => setEditName(e.target.value)}
          className="w-full mt-1 h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-[var(--theme-primary)]" />
        <p className="text-white/60 text-xs mt-4 mb-2">Avatar color</p>
        <div className="flex gap-2">
          {AVATAR_COLORS.map(c => (
            <button key={c} onClick={() => setEditColor(c)} style={{ background: c }}
              className={`w-9 h-9 rounded-full ${editColor === c ? "ring-2 ring-white" : ""}`} />
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => setSheet(null)} className="flex-1 h-11 rounded-full glass text-white text-sm font-semibold">Cancel</button>
          <button onClick={() => {
            setSetting("profileName", editName); setSetting("avatarColor", editColor); setSheet(null); toast.success("Profile updated");
          }} className="flex-1 h-11 rounded-full bg-[var(--theme-primary)] text-white text-sm font-semibold">Save Changes</button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "quality"} onClose={() => setSheet(null)} title="Default Quality">
        <OptionList value={settings.quality} onChange={(v) => { setSetting("quality", v); setSheet(null); }}
          options={["Auto", "1080p", "720p", "480p"].map(v => ({ label: v, value: v }))} />
      </BottomSheet>
      <BottomSheet open={sheet === "audio"} onClose={() => setSheet(null)} title="Default Audio">
        <OptionList value={settings.audio} onChange={(v) => { setSetting("audio", v); setSheet(null); }}
          options={["Hindi", "English", "Japanese", "Tamil", "Telugu"].map(v => ({ label: v, value: v }))} />
      </BottomSheet>
      <BottomSheet open={sheet === "contentLang"} onClose={() => setSheet(null)} title="Content Language">
        <OptionList value={settings.contentLang} onChange={(v) => { setSetting("contentLang", v); setSheet(null); }}
          options={["Hindi First", "English", "Auto"].map(v => ({ label: v, value: v }))} />
      </BottomSheet>
      <BottomSheet open={sheet === "subLang"} onClose={() => setSheet(null)} title="Subtitle Language">
        <OptionList value={settings.subLang} onChange={(v) => { setSetting("subLang", v); setSheet(null); }}
          options={["English", "Hindi", "Off"].map(v => ({ label: v, value: v }))} />
      </BottomSheet>
      <BottomSheet open={sheet === "subSize"} onClose={() => setSheet(null)} title="Subtitle Size">
        <OptionList value={settings.subSize} onChange={(v) => { setSetting("subSize", v); setSheet(null); }}
          options={["Small", "Medium", "Large"].map(v => ({ label: v, value: v }))} />
      </BottomSheet>
      <BottomSheet open={sheet === "subBg"} onClose={() => setSheet(null)} title="Subtitle Background">
        <OptionList value={settings.subBg} onChange={(v) => { setSetting("subBg", v); setSheet(null); }}
          options={["None", "Box", "Blur"].map(v => ({ label: v, value: v }))} />
      </BottomSheet>

      <BottomSheet open={sheet === "addRepo"} onClose={() => setSheet(null)} title="Add Repository">
        <label className="text-white/60 text-xs">Repository URL</label>
        <input value={newRepoUrl} onChange={e => setNewRepoUrl(e.target.value)} placeholder="https://..." type="url"
          className="w-full mt-1 h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-[var(--theme-primary)]" />
        <label className="text-white/60 text-xs mt-3 block">Shortcode</label>
        <input value={newRepoCode} onChange={e => setNewRepoCode(e.target.value)} placeholder="myrepo"
          className="w-full mt-1 h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-[var(--theme-primary)]" />
        <label className="text-white/60 text-xs mt-3 block">Repository Name</label>
        <input value={newRepoName} onChange={e => setNewRepoName(e.target.value)} placeholder="My Repository"
          className="w-full mt-1 h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-[var(--theme-primary)]" />
        <div className="flex gap-2 mt-6">
          <button onClick={() => setSheet(null)} className="flex-1 h-11 rounded-full glass text-white text-sm font-semibold">Cancel</button>
          <button onClick={() => {
            if (!/^https?:\/\//.test(newRepoUrl) || !newRepoCode) { toast.error("Valid URL & shortcode required"); return; }
            addRepo({ name: newRepoName || newRepoCode, shortcode: newRepoCode, url: newRepoUrl });
            setNewRepoUrl(""); setNewRepoCode(""); setNewRepoName(""); setSheet(null); toast.success("Repository added");
          }} className="flex-1 h-11 rounded-full bg-[var(--theme-primary)] text-white text-sm font-semibold">Add Repository</button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "repoDetail"} onClose={() => setSheet(null)} title={selectedRepo?.name}>
        {selectedRepo && (
          <div className="text-white/80 text-sm space-y-3">
            <div><p className="text-white/60 text-xs">URL</p><p className="break-all font-mono text-xs">{selectedRepo.url}</p></div>
            <div><p className="text-white/60 text-xs">Shortcode</p><p className="font-mono">{selectedRepo.shortcode}</p></div>
            <div><p className="text-white/60 text-xs">Status</p><p>{selectedRepo.enabled ? "Enabled" : "Disabled"}</p></div>
            <div><p className="text-white/60 text-xs">Extensions</p><p>—</p></div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === "clearCache"} onClose={() => setSheet(null)} title="Clear Cache">
        <p className="text-white/70 text-sm">Clear all cached data? This will free up storage but not delete your downloads.</p>
        <div className="flex gap-2 mt-6">
          <button onClick={() => setSheet(null)} className="flex-1 h-11 rounded-full glass text-white text-sm font-semibold">Cancel</button>
          <button onClick={async () => {
            setSheet(null);
            const tid = toast.loading("Clearing...");
            await new Promise(r => setTimeout(r, 700));
            toast.success("Cache cleared successfully", { id: tid });
          }} className="flex-1 h-11 rounded-full bg-[var(--theme-primary)] text-white text-sm font-semibold">Clear</button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "about"} onClose={() => setSheet(null)}>
        <div className="relative -mx-5 -mt-3 h-32 overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)] via-purple-800 to-black animate-mesh" />
        </div>
        <div className="text-center pt-5">
          <h2 className="font-display text-5xl text-white text-glow-red">KINO</h2>
          <p className="text-[var(--kino-muted)] text-xs mt-1 tracking-[0.3em]">by Raj Karmakar</p>
          <div className="mx-auto mt-3 h-px w-24 bg-[var(--theme-primary)]" style={{ boxShadow: "0 0 8px var(--theme-primary)" }} />
          <p className="mt-4 font-mono text-xs text-[var(--kino-muted)]">v 1.0.0</p>
          <p className="mt-4 font-display text-lg text-white">Cinema. Redefined.</p>
          <p className="mt-2 text-sm text-white/70">Crafted with passion for every screen</p>
          <p className="mt-6 text-[10px] text-[var(--kino-muted)]">© 2025 Kino. All rights reserved.</p>
        </div>
      </BottomSheet>
    </div>
  );
}
