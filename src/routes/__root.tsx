import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AppProvider, useApp } from "../lib/store";
import { SplashScreen, RepoInstaller } from "../components/kino/Splash";
import { BottomNav } from "../components/kino/BottomNav";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#080808" },
      { title: "Kino — Cinema. Redefined." },
      { name: "description", content: "Premium streaming reimagined. Movies, shows, anime." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-3">
      <h1 className="font-display text-5xl">404</h1>
      <a href="/" className="text-[var(--theme-primary)]">Go home</a>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-3 px-6 text-center">
      <h1 className="font-display text-2xl">Something went wrong</h1>
      <p className="text-[var(--kino-muted)] text-sm">{error.message}</p>
      <a href="/" className="text-[var(--theme-primary)]">Go home</a>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body className="bg-[#080808] text-white">{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppShell />
        <Toaster theme="dark" position="top-center" toastOptions={{ style: { background: "rgba(20,20,20,0.95)", color: "white", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" } }} />
      </AppProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { launched, setLaunched } = useApp();
  const { location } = useRouterState();
  const [splashDone, setSplashDone] = useState(false);
  const [installerDone, setInstallerDone] = useState(launched);
  const isPlayer = location.pathname.startsWith("/player");

  // Hydration-safe: only show splash client-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-[#080808] mx-auto max-w-[430px] relative">
      <Outlet />
      {!isPlayer && <BottomNav />}
      {mounted && !splashDone && <SplashScreen onDone={() => setSplashDone(true)} quick={launched} />}
      {mounted && splashDone && !installerDone && (
        <RepoInstaller onDone={() => { setLaunched(true); setInstallerDone(true); }} />
      )}
    </div>
  );
}
