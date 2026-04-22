"use client";

import { useEffect, useMemo, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type TrackingParams = {
  aff_id?: string;
  subid?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  click_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

type RouteItem = {
  id: string;
  title: string;
  label?: string;
  subtitle?: string;
  href: string;
  icon: string;
  featured?: boolean;
};

const TRACKING_KEYS = [
  "aff_id",
  "subid",
  "sub1",
  "sub2",
  "sub3",
  "click_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEYS = {
  tracking: "toshi_pwa_tracking",
  recent: "toshi_pwa_recent_destination",
  installDismissed: "toshi_pwa_install_dismissed",
};

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error legacy iOS Safari support
    window.navigator.standalone === true
  );
}

function readTrackingFromLocation(): TrackingParams {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const next: TrackingParams = {};

  for (const key of TRACKING_KEYS) {
    const value = url.searchParams.get(key);
    if (value) next[key] = value;
  }

  return next;
}

function readStoredTracking(): TrackingParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.tracking);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function mergeTracking(current: TrackingParams, incoming: TrackingParams): TrackingParams {
  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(incoming).filter(([, value]) => typeof value === "string" && value.length > 0)
    ),
  };
}

function persistTracking(params: TrackingParams) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(params));
}

function withTracking(href: string, tracking: TrackingParams) {
  const url = new URL(href);
  Object.entries(tracking).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

function saveRecentDestination(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.recent, id);
}

function readRecentDestination() {
  if (typeof window === "undefined") return "casino";
  return window.localStorage.getItem(STORAGE_KEYS.recent) || "casino";
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [tracking, setTracking] = useState<TrackingParams>({});
  const [recentId, setRecentId] = useState("casino");
  const [installDismissed, setInstallDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const coreRoutes = useMemo<RouteItem[]>(
    () => [
      {
        id: "casino",
        title: "Casino",
        label: "HOT",
        subtitle: "Slots · Live · Originals",
        href: "https://toshi.bet",
        icon: "🎰",
        featured: true,
      },
      {
        id: "sports",
        title: "Sports",
        label: "LIVE",
        subtitle: "Matches · Props · Parlays",
        href: "https://toshi.bet/sports/home",
        icon: "⚽",
        featured: true,
      },
      {
        id: "rewards",
        title: "Rewards",
        label: "BOOST",
        subtitle: "Bonus · Rakeback · Reloads",
        href: "https://toshi.bet/rewards",
        icon: "🎁",
      },
      {
        id: "vip",
        title: "VIP",
        label: "ELITE",
        subtitle: "Levels · Perks · Status",
        href: "https://toshi.bet/vip",
        icon: "💎",
      },
    ],
    []
  );

  const utilityRoutes = useMemo<RouteItem[]>(
    () => [
      {
        id: "lms",
        title: "Last Man Standing",
        label: "FREE",
        subtitle: "Tournament",
        href: "https://toshi.bet/last-man-standing",
        icon: "🏆",
      },
      {
        id: "deposit",
        title: "Deposit",
        label: "FAST",
        subtitle: "Crypto",
        href: "https://toshi.bet/deposit",
        icon: "⬇️",
      },
      {
        id: "affiliate",
        title: "Affiliate",
        label: "REV",
        subtitle: "Partner",
        href: "https://toshi.bet/affiliate",
        icon: "🤝",
      },
      {
        id: "support",
        title: "Support",
        label: "24/7",
        subtitle: "Help",
        href: "https://toshi.bet/help",
        icon: "🛟",
      },
    ],
    []
  );

  const continueRoute = useMemo(() => {
    return [...coreRoutes, ...utilityRoutes].find((route) => route.id === recentId) || coreRoutes[0];
  }, [coreRoutes, utilityRoutes, recentId]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowIOSInstall(false);
      setInstallDismissed(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.installDismissed, "1");
      }
    };

    const mergedTracking = mergeTracking(readStoredTracking(), readTrackingFromLocation());

    setTracking(mergedTracking);
    persistTracking(mergedTracking);
    setInstalled(isStandalone());
    setShowIOSInstall(isIOS() && !isStandalone());
    setRecentId(readRecentDestination());
    setInstallDismissed(
      typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEYS.installDismissed) === "1"
    );

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    const splashTimer = window.setTimeout(() => setShowSplash(false), 1150);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.clearTimeout(splashTimer);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleRoute(route: RouteItem) {
    saveRecentDestination(route.id);
    setRecentId(route.id);
    window.location.href = withTracking(route.href, tracking);
  }

  function dismissInstallCard() {
    setInstallDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.installDismissed, "1");
    }
  }

  if (showSplash) {
    return (
      <main className="splash-shell">
        <div className="splash-screen">
          <div className="splash-logo-wrap">
            <img src="/icons/icon-192.png" alt="Toshi.bet" className="splash-logo" />
          </div>
          <div className="splash-wordmark">Toshi.bet</div>
          <div className="splash-dots" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <style jsx global>{`
          :root {
            color-scheme: dark;
          }
          html,
          body {
            margin: 0;
            padding: 0;
            background: #050812;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          @keyframes splashFade {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes dotPulse {
            0%,
            100% {
              opacity: 0.25;
              transform: scale(0.92);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>

        <style jsx>{`
          .splash-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(circle at 50% 18%, rgba(255, 117, 31, 0.3) 0%, rgba(255, 117, 31, 0.07) 26%, rgba(5, 8, 18, 1) 60%),
              linear-gradient(180deg, #050812 0%, #07101a 100%);
            color: #fff;
            overflow: hidden;
          }
          .splash-screen {
            width: min(100%, 360px);
            padding: 28px;
            text-align: center;
            animation: splashFade 0.5s ease;
          }
          .splash-logo-wrap {
            width: 94px;
            height: 94px;
            margin: 0 auto 22px;
            border-radius: 28px;
            border: 1px solid rgba(255, 117, 31, 0.3);
            background: linear-gradient(180deg, rgba(255, 117, 31, 0.18), rgba(255, 117, 31, 0.05));
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.34), 0 0 48px rgba(255, 117, 31, 0.18);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .splash-logo {
            width: 56px;
            height: 56px;
            object-fit: contain;
          }
          .splash-wordmark {
            font-size: 36px;
            font-weight: 900;
            letter-spacing: -0.05em;
          }
          .splash-dots {
            margin-top: 26px;
            display: flex;
            justify-content: center;
            gap: 10px;
          }
          .splash-dots span {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: #ff751f;
            animation: dotPulse 1.15s ease-in-out infinite;
          }
          .splash-dots span:nth-child(2) { animation-delay: 0.1s; }
          .splash-dots span:nth-child(3) { animation-delay: 0.2s; }
          .splash-dots span:nth-child(4) { animation-delay: 0.3s; }
          .splash-dots span:nth-child(5) { animation-delay: 0.4s; }
        `}</style>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-bg" />

      <div className="app-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-box">
              <img src="/icons/icon-192.png" alt="Toshi.bet" className="brand-icon" />
            </div>
            <div>
              <div className="brand-name">Toshi.bet</div>
              <div className="brand-mode">{installed ? "App" : "Web App"}</div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="top-action muted" onClick={() => handleRoute(utilityRoutes[1])}>
              Deposit
            </button>
            <button className="top-action primary" onClick={() => handleRoute(coreRoutes[0])}>
              Play
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-status-row">
            <span className="hero-badge">LIVE</span>
            <span className="hero-subbadge">{installed ? "Installed" : "Install available"}</span>
          </div>

          <h1 className="hero-title">Play faster.</h1>

          <div className="hero-actions">
            <button className="hero-primary" onClick={() => handleRoute(continueRoute)}>
              Continue · {continueRoute.title}
            </button>
            <button className="hero-secondary" onClick={() => handleRoute(coreRoutes[1])}>
              Sports
            </button>
          </div>

          <div className="hero-strip">
            <div className="hero-stat">
              <span>Recent</span>
              <strong>{continueRoute.title}</strong>
            </div>
            <div className="hero-stat">
              <span>Tracking</span>
              <strong>{Object.keys(tracking).length ? "Saved" : "Ready"}</strong>
            </div>
            <div className="hero-stat">
              <span>Mode</span>
              <strong>{installed ? "App" : "PWA"}</strong>
            </div>
          </div>

          {!installed && !installDismissed && (deferredPrompt || showIOSInstall) && (
            <div className="install-card">
              <div className="install-copy-wrap">
                <div className="install-title">Install app</div>
                <div className="install-copy">Faster open. Better return visits.</div>
              </div>

              <div className="install-buttons">
                {deferredPrompt ? (
                  <button className="mini-primary" onClick={handleInstall}>
                    Install
                  </button>
                ) : showIOSInstall ? (
                  <div className="ios-copy">Share → Add to Home Screen</div>
                ) : null}
                <button className="mini-ghost" onClick={dismissInstallCard}>
                  Later
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="section-row section-row-tight">
          <div className="section-title">Top</div>
          <div className="chip-row">
            {coreRoutes.map((route) => (
              <button key={route.id} className="route-chip" onClick={() => handleRoute(route)}>
                {route.title}
              </button>
            ))}
          </div>
        </section>

        <section className="featured-grid">
          {coreRoutes.map((route, index) => (
            <button
              key={route.id}
              className={`featured-card ${index < 2 ? "featured-card-large" : ""}`}
              onClick={() => handleRoute(route)}
            >
              <div className="featured-top">
                <span className="featured-icon">{route.icon}</span>
                {route.label ? <span className="featured-label">{route.label}</span> : null}
              </div>
              <div className="featured-bottom">
                <strong>{route.title}</strong>
                <span>{route.subtitle}</span>
              </div>
            </button>
          ))}
        </section>

        <section className="banner-card">
          <div>
            <div className="banner-kicker">TOURNAMENT</div>
            <div className="banner-title">Last Man Standing</div>
          </div>
          <button className="banner-button" onClick={() => handleRoute(utilityRoutes[0])}>
            Open
          </button>
        </section>

        <section className="section-row">
          <div className="section-title">Quick actions</div>
        </section>

        <section className="quick-grid">
          {utilityRoutes.map((route) => (
            <button key={route.id} className="quick-card" onClick={() => handleRoute(route)}>
              <div className="quick-card-top">
                <span className="quick-icon">{route.icon}</span>
                {route.label ? <span className="quick-tag">{route.label}</span> : null}
              </div>
              <strong>{route.title}</strong>
              <span>{route.subtitle}</span>
            </button>
          ))}
        </section>
      </div>

      <nav className="bottom-nav">
        {[
          { id: "home", label: "Home" },
          { id: "casino", label: "Casino", route: coreRoutes[0] },
          { id: "sports", label: "Sports", route: coreRoutes[1] },
          { id: "promo", label: "LMS", route: utilityRoutes[0] },
          { id: "vip", label: "VIP", route: coreRoutes[3] },
        ].map((item) => (
          <button
            key={item.id}
            className={`nav-button ${activeTab === item.id ? "active" : ""}`}
            onClick={() => {
              setActiveTab(item.id);
              if (item.route) handleRoute(item.route);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="dock-cta">
        <button className="dock-button" onClick={() => handleRoute(continueRoute)}>
          Continue · {continueRoute.title}
        </button>
      </div>

      <style jsx global>{`
        :root {
          color-scheme: dark;
        }
        html,
        body {
          margin: 0;
          padding: 0;
          background: #050812;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        button {
          border: 0;
          font: inherit;
          cursor: pointer;
        }
        @keyframes ctaPulse {
          0%,
          100% { box-shadow: 0 14px 34px rgba(255, 117, 31, 0.22); }
          50% { box-shadow: 0 18px 42px rgba(255, 117, 31, 0.34); }
        }
      `}</style>

      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          color: #fff;
          background:
            radial-gradient(circle at top, rgba(255, 117, 31, 0.16) 0%, rgba(255, 117, 31, 0.05) 16%, rgba(5, 8, 18, 1) 45%),
            linear-gradient(180deg, #050812 0%, #09111a 100%);
          padding-bottom: 172px;
          position: relative;
        }
        .app-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.3;
          mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 72%);
        }
        .app-wrap {
          position: relative;
          z-index: 1;
          width: min(100%, 520px);
          margin: 0 auto;
          padding: max(14px, env(safe-area-inset-top)) 14px 0;
        }
        .topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 2px 14px;
          backdrop-filter: blur(18px);
          background: linear-gradient(180deg, rgba(5, 8, 18, 0.96), rgba(5, 8, 18, 0.72));
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .topbar-left,
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-box {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(255, 117, 31, 0.24);
          background: linear-gradient(180deg, rgba(255, 117, 31, 0.16), rgba(255, 117, 31, 0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.25);
        }
        .brand-icon {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }
        .brand-name {
          font-size: 22px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .brand-mode {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.56);
        }
        .top-action {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }
        .top-action.muted {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .top-action.primary {
          background: linear-gradient(180deg, #ff8e45 0%, #ff751f 100%);
          color: #fff;
        }
        .hero-panel {
          margin-top: 14px;
          border-radius: 30px;
          padding: 22px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 26px 68px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.04);
          position: relative;
          overflow: hidden;
        }
        .hero-panel::after {
          content: "";
          position: absolute;
          right: -54px;
          top: -78px;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 117, 31, 0.24) 0%, rgba(255, 117, 31, 0) 70%);
        }
        .hero-status-row,
        .chip-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .hero-badge,
        .hero-subbadge,
        .route-chip,
        .featured-label,
        .quick-tag {
          border-radius: 999px;
          font-weight: 800;
        }
        .hero-badge {
          padding: 7px 10px;
          background: rgba(255, 117, 31, 0.14);
          border: 1px solid rgba(255, 117, 31, 0.24);
          color: #ffb78b;
          font-size: 11px;
        }
        .hero-subbadge {
          padding: 7px 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.74);
          font-size: 11px;
        }
        .hero-title {
          margin: 18px 0 0;
          font-size: clamp(40px, 11vw, 54px);
          line-height: 0.94;
          font-weight: 950;
          letter-spacing: -0.06em;
          position: relative;
          z-index: 1;
        }
        .hero-actions {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
        }
        .hero-primary,
        .hero-secondary,
        .banner-button,
        .dock-button {
          min-height: 52px;
          border-radius: 18px;
          font-weight: 900;
        }
        .hero-primary,
        .dock-button {
          background: linear-gradient(180deg, #ff8e45 0%, #ff751f 100%);
          color: #fff;
          padding: 0 18px;
          animation: ctaPulse 2.2s ease-in-out infinite;
        }
        .hero-primary { flex: 1 1 210px; }
        .hero-secondary {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          padding: 0 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hero-strip {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }
        .hero-stat {
          min-width: 0;
          border-radius: 18px;
          padding: 14px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .hero-stat span,
        .quick-card span,
        .featured-bottom span {
          display: block;
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
        }
        .hero-stat strong {
          display: block;
          margin-top: 7px;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 900;
        }
        .install-card {
          position: relative;
          z-index: 1;
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .install-title {
          font-size: 14px;
          font-weight: 900;
        }
        .install-copy,
        .ios-copy {
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.66);
          font-size: 12px;
        }
        .install-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .mini-primary,
        .mini-ghost {
          min-height: 38px;
          padding: 0 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
        }
        .mini-primary {
          background: #ff751f;
          color: #fff;
        }
        .mini-ghost {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.86);
        }
        .section-row {
          margin-top: 22px;
        }
        .section-row-tight { margin-top: 16px; }
        .section-title {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
        }
        .route-chip {
          min-height: 34px;
          padding: 0 12px;
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 12px;
        }
        .featured-grid,
        .quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .featured-card,
        .quick-card {
          color: #fff;
          text-align: left;
        }
        .featured-card {
          min-height: 142px;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22), inset 0 0 64px rgba(255, 117, 31, 0.09);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .featured-card-large {
          min-height: 168px;
        }
        .featured-top,
        .quick-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .featured-icon,
        .quick-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 117, 31, 0.12);
          border: 1px solid rgba(255, 117, 31, 0.2);
          font-size: 20px;
        }
        .featured-label,
        .quick-tag {
          padding: 7px 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #ffb78b;
          font-size: 11px;
        }
        .featured-bottom strong,
        .quick-card strong {
          display: block;
          font-size: 21px;
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -0.03em;
        }
        .featured-bottom span,
        .quick-card span {
          margin-top: 7px;
          line-height: 1.45;
        }
        .banner-card {
          margin-top: 16px;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(135deg, rgba(255, 117, 31, 0.18), rgba(255, 255, 255, 0.04));
          border: 1px solid rgba(255, 117, 31, 0.18);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .banner-kicker {
          font-size: 12px;
          font-weight: 800;
          color: #ffb78b;
        }
        .banner-title {
          margin-top: 6px;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }
        .banner-button {
          flex-shrink: 0;
          padding: 0 16px;
          background: #ff751f;
          color: #fff;
        }
        .quick-card {
          min-height: 122px;
          border-radius: 22px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.16);
        }
        .bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: calc(74px + env(safe-area-inset-bottom));
          z-index: 40;
          width: min(calc(100% - 20px), 500px);
          margin: 0 auto;
          padding: 8px;
          border-radius: 22px;
          background: rgba(8, 11, 20, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(18px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }
        .nav-button {
          min-height: 42px;
          border-radius: 14px;
          background: transparent;
          color: rgba(255, 255, 255, 0.66);
          font-size: 12px;
          font-weight: 800;
        }
        .nav-button.active {
          background: rgba(255, 117, 31, 0.1);
          color: #ff934f;
        }
        .dock-cta {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 41;
          padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
          background: linear-gradient(180deg, rgba(5, 8, 18, 0), rgba(5, 8, 18, 0.94) 24%, rgba(5, 8, 18, 1) 100%);
        }
        .dock-button {
          width: min(100%, 500px);
          display: block;
          margin: 0 auto;
        }
        @media (max-width: 430px) {
          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }
          .topbar-right {
            width: 100%;
          }
          .top-action {
            flex: 1 1 0;
          }
          .hero-strip,
          .featured-grid,
          .quick-grid {
            grid-template-columns: 1fr 1fr;
          }
          .install-card,
          .banner-card {
            flex-direction: column;
            align-items: stretch;
          }
          .install-buttons {
            justify-content: flex-end;
          }
        }
        @media (max-width: 380px) {
          .hero-strip,
          .featured-grid,
          .quick-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
