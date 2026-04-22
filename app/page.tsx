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

type Destination = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: string;
  href: string;
  accent: string;
  glow: string;
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
    if (value) {
      next[key] = value;
    }
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
  const [activeNav, setActiveNav] = useState("home");
  const [recentId, setRecentId] = useState("casino");
  const [installDismissed, setInstallDismissed] = useState(false);

  const primaryCards = useMemo<Destination[]>(
    () => [
      {
        id: "casino",
        title: "Casino",
        subtitle: "Slots, live casino, originals",
        badge: "Hot",
        icon: "🎰",
        href: "https://toshi.bet",
        accent: "#ff751f",
        glow: "rgba(255,117,31,0.22)",
      },
      {
        id: "sports",
        title: "Sports",
        subtitle: "Live fixtures, props, parlays",
        badge: "Live",
        icon: "⚽",
        href: "https://toshi.bet/sports/home",
        accent: "#ff8b3d",
        glow: "rgba(255,117,31,0.16)",
      },
      {
        id: "rewards",
        title: "Rewards",
        subtitle: "Bonus flow, rakeback, loyalty",
        badge: "Boost",
        icon: "🎁",
        href: "https://toshi.bet/rewards",
        accent: "#ffa05c",
        glow: "rgba(255,117,31,0.14)",
      },
      {
        id: "vip",
        title: "VIP",
        subtitle: "Status tiers, perks, reloads",
        badge: "Elite",
        icon: "💎",
        href: "https://toshi.bet/vip",
        accent: "#ffb780",
        glow: "rgba(255,117,31,0.10)",
      },
    ],
    []
  );

  const quickActions = useMemo<Destination[]>(
    () => [
      {
        id: "lms",
        title: "Last Man Standing",
        subtitle: "Free-to-play tournament funnel",
        badge: "Free",
        icon: "🏆",
        href: "https://toshi.bet/last-man-standing",
        accent: "#ff751f",
        glow: "rgba(255,117,31,0.18)",
      },
      {
        id: "affiliate",
        title: "Affiliate",
        subtitle: "Partner signup and rev share",
        badge: "B2B",
        icon: "🤝",
        href: "https://toshi.bet/affiliate",
        accent: "#ff8b3d",
        glow: "rgba(255,117,31,0.14)",
      },
      {
        id: "deposit",
        title: "Deposit",
        subtitle: "Fast crypto entry",
        badge: "Fast",
        icon: "💳",
        href: "https://toshi.bet/deposit",
        accent: "#ffa05c",
        glow: "rgba(255,117,31,0.14)",
      },
      {
        id: "support",
        title: "Support",
        subtitle: "Help, FAQ, account issues",
        badge: "24/7",
        icon: "🛟",
        href: "https://toshi.bet/help",
        accent: "#ffb780",
        glow: "rgba(255,117,31,0.10)",
      },
    ],
    []
  );

  const recentDestination = useMemo(() => {
    return [...primaryCards, ...quickActions].find((item) => item.id === recentId) || primaryCards[0];
  }, [primaryCards, quickActions, recentId]);

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

    const locationTracking = readTrackingFromLocation();
    const storedTracking = readStoredTracking();
    const mergedTracking = mergeTracking(storedTracking, locationTracking);

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

    const splashTimer = window.setTimeout(() => setShowSplash(false), 950);

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

  function handleRoute(destination: Destination) {
    saveRecentDestination(destination.id);
    setRecentId(destination.id);
    window.location.href = withTracking(destination.href, tracking);
  }

  function dismissInstallCard() {
    setInstallDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.installDismissed, "1");
    }
  }

  const trackingCount = Object.keys(tracking).length;

  if (showSplash) {
    return (
      <main className="shell splash-shell">
        <div className="splash-wrap">
          <div className="splash-orb" />
          <div className="splash-card">
            <div className="splash-logo-box">
              <img src="/icons/icon-192.png" alt="Toshi.bet" className="splash-logo" />
            </div>
            <div className="splash-title">Toshi.bet</div>
            <div className="splash-subtitle">Crypto Casino &amp; Sportsbook</div>
            <div className="splash-loader">
              <span />
            </div>
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
            background: #070b13;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }

          @keyframes splashIn {
            from {
              opacity: 0;
              transform: translateY(18px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes splashPulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.75;
            }
            50% {
              transform: scale(1.06);
              opacity: 1;
            }
          }

          @keyframes loaderSweep {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(220%);
            }
          }
        `}</style>

        <style jsx>{`
          .shell {
            min-height: 100vh;
            color: #fff;
          }

          .splash-shell {
            background:
              radial-gradient(circle at 50% 18%, rgba(255, 117, 31, 0.32) 0%, rgba(255, 117, 31, 0.08) 24%, rgba(7, 11, 19, 1) 58%),
              linear-gradient(180deg, #070b13 0%, #090f18 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .splash-wrap {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 24px;
          }

          .splash-orb {
            position: absolute;
            width: 280px;
            height: 280px;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(255,117,31,0.18) 0%, rgba(255,117,31,0) 70%);
            filter: blur(12px);
            animation: splashPulse 2.2s ease-in-out infinite;
          }

          .splash-card {
            position: relative;
            z-index: 1;
            width: min(100%, 360px);
            text-align: center;
            animation: splashIn 0.48s ease;
          }

          .splash-logo-box {
            width: 92px;
            height: 92px;
            margin: 0 auto 18px;
            border-radius: 28px;
            border: 1px solid rgba(255, 117, 31, 0.32);
            background: linear-gradient(180deg, rgba(255,117,31,0.18), rgba(255,117,31,0.04));
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 28px 50px rgba(0, 0, 0, 0.34), 0 0 40px rgba(255, 117, 31, 0.14);
          }

          .splash-logo {
            width: 54px;
            height: 54px;
            object-fit: contain;
          }

          .splash-title {
            font-size: 36px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -0.05em;
          }

          .splash-subtitle {
            margin-top: 10px;
            color: rgba(255, 255, 255, 0.64);
            font-size: 14px;
          }

          .splash-loader {
            width: 120px;
            height: 5px;
            margin: 22px auto 0;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
          }

          .splash-loader span {
            display: block;
            width: 40%;
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(255,117,31,0.15), #ff751f, rgba(255,117,31,0.15));
            animation: loaderSweep 1.2s ease-in-out infinite;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="shell app-shell">
      <div className="background-grid" />
      <div className="content-wrap">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-logo-box">
              <img src="/icons/icon-192.png" alt="Toshi.bet" className="brand-logo" />
            </div>
            <div>
              <div className="brand-name">Toshi.bet</div>
              <div className="brand-sub">Installable crypto casino shell</div>
            </div>
          </div>

          <button className="ghost-chip" onClick={() => handleRoute(primaryCards[0])}>
            Open
          </button>
        </header>

        <section className="hero-card">
          <div className="hero-topline">
            <span className="status-dot" />
            {installed ? "Installed mode active" : "Mobile app mode available"}
          </div>

          <div className="hero-row">
            <div>
              <h1 className="hero-title">
                Built to feel like an app.
                <br />
                Tuned to convert like a funnel.
              </h1>
              <p className="hero-copy">
                Give affiliates a clean installable shell that gets users into Casino, Sports, Rewards,
                VIP, and LMS with less friction and better session continuity.
              </p>
            </div>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span>Mode</span>
              <strong>{installed ? "Installed" : "Web + Install"}</strong>
            </div>
            <div className="metric-card">
              <span>Tracking</span>
              <strong>{trackingCount > 0 ? `${trackingCount} params saved` : "Ready"}</strong>
            </div>
            <div className="metric-card">
              <span>Focus</span>
              <strong>Click → Deposit</strong>
            </div>
          </div>

          <div className="hero-cta-row">
            <button className="primary-cta" onClick={() => handleRoute(recentDestination)}>
              Continue to {recentDestination.title}
            </button>
            <button className="secondary-cta" onClick={() => handleRoute(primaryCards[0])}>
              Open Casino
            </button>
          </div>

          {!installed && !installDismissed && (deferredPrompt || showIOSInstall) && (
            <div className="install-card">
              <div>
                <div className="install-title">Install for a real app feel</div>
                <div className="install-copy">
                  Better return visits, cleaner relaunches, and a much stronger in-app style experience.
                </div>
              </div>

              <div className="install-actions">
                {!installed && deferredPrompt && (
                  <button className="small-primary" onClick={handleInstall}>
                    Install now
                  </button>
                )}
                {!installed && showIOSInstall && !deferredPrompt && (
                  <div className="ios-tip">Tap Share → Add to Home Screen</div>
                )}
                <button className="small-ghost" onClick={dismissInstallCard}>
                  Later
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mini-strip">
          <div className="mini-card mini-card-accent">
            <span>Recent destination</span>
            <strong>{recentDestination.title}</strong>
          </div>
          <div className="mini-card">
            <span>Affiliate-friendly</span>
            <strong>Params persist</strong>
          </div>
          <div className="mini-card">
            <span>UX intent</span>
            <strong>Native shell</strong>
          </div>
        </section>

        <section className="section-head">
          <div>
            <h2>Core access</h2>
            <p>Primary money paths should sit above everything else.</p>
          </div>
        </section>

        <section className="grid-cards">
          {primaryCards.map((card) => (
            <button
              key={card.id}
              className="app-card"
              onClick={() => handleRoute(card)}
              style={{ boxShadow: `0 20px 42px rgba(0,0,0,0.28), inset 0 0 70px ${card.glow}` }}
            >
              <div className="card-top">
                <div className="icon-box">{card.icon}</div>
                {card.badge ? <div className="pill-badge">{card.badge}</div> : null}
              </div>
              <div className="card-body">
                <strong>{card.title}</strong>
                <span>{card.subtitle}</span>
              </div>
            </button>
          ))}
        </section>

        <section className="promo-banner">
          <div>
            <div className="promo-label">High-conversion route</div>
            <div className="promo-title">Use LMS as the low-friction hook, then pull users into Casino and Rewards.</div>
          </div>
          <button className="promo-button" onClick={() => handleRoute(quickActions[0])}>
            Open LMS
          </button>
        </section>

        <section className="section-head compact-gap">
          <div>
            <h2>Quick actions</h2>
            <p>Secondary routes still need to feel instant and app-native.</p>
          </div>
        </section>

        <section className="quick-grid">
          {quickActions.map((card) => (
            <button key={card.id} className="quick-card" onClick={() => handleRoute(card)}>
              <div className="quick-top">
                <span className="quick-icon">{card.icon}</span>
                {card.badge ? <span className="quick-badge">{card.badge}</span> : null}
              </div>
              <strong>{card.title}</strong>
              <span>{card.subtitle}</span>
            </button>
          ))}
        </section>

        <section className="trust-panel">
          <div className="trust-head">Why this version converts better</div>
          <ul>
            <li>Recent destination memory makes re-entry feel like a real app, not a static landing page.</li>
            <li>Affiliate parameters are captured once and carried forward into outbound Toshi.bet routes.</li>
            <li>The first screen prioritizes the action most likely to monetize, instead of generic browsing.</li>
          </ul>
        </section>
      </div>

      <nav className="bottom-nav">
        {[
          { id: "home", label: "Home" },
          { id: "casino", label: "Casino", route: primaryCards[0] },
          { id: "sports", label: "Sports", route: primaryCards[1] },
          { id: "lms", label: "LMS", route: quickActions[0] },
          { id: "menu", label: "VIP", route: primaryCards[3] },
        ].map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => {
              setActiveNav(item.id);
              if (item.route) {
                handleRoute(item.route);
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sticky-launchbar">
        <button className="sticky-primary" onClick={() => handleRoute(recentDestination)}>
          Continue to {recentDestination.title}
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
          background: #070b13;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        button,
        a {
          font: inherit;
        }

        button {
          border: 0;
          cursor: pointer;
        }

        @keyframes pulseShadow {
          0%,
          100% {
            box-shadow: 0 18px 34px rgba(255, 117, 31, 0.22);
          }
          50% {
            box-shadow: 0 22px 42px rgba(255, 117, 31, 0.34);
          }
        }
      `}</style>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          color: #fff;
        }

        .app-shell {
          background:
            radial-gradient(circle at top, rgba(255,117,31,0.18) 0%, rgba(255,117,31,0.07) 14%, rgba(7,11,19,1) 42%),
            linear-gradient(180deg, #070b13 0%, #0a1018 100%);
          position: relative;
          padding-bottom: 176px;
        }

        .background-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.3), transparent 75%);
          opacity: 0.35;
        }

        .content-wrap {
          position: relative;
          z-index: 1;
          width: min(100%, 520px);
          margin: 0 auto;
          padding: max(16px, env(safe-area-inset-top)) 14px 0;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 35;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 2px 14px;
          backdrop-filter: blur(18px);
          background: linear-gradient(180deg, rgba(7,11,19,0.94), rgba(7,11,19,0.72));
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .brand-block {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-logo-box {
          width: 50px;
          height: 50px;
          border-radius: 17px;
          border: 1px solid rgba(255,117,31,0.24);
          background: linear-gradient(180deg, rgba(255,117,31,0.16), rgba(255,117,31,0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 18px 28px rgba(0,0,0,0.22);
          flex-shrink: 0;
        }

        .brand-logo {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }

        .brand-name {
          font-size: 22px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .brand-sub {
          margin-top: 5px;
          font-size: 12px;
          color: rgba(255,255,255,0.58);
        }

        .ghost-chip {
          background: rgba(255,255,255,0.05);
          color: #fff;
          padding: 11px 14px;
          border-radius: 999px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        .hero-card {
          margin-top: 16px;
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 22px;
          background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 72px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .hero-card::after {
          content: "";
          position: absolute;
          right: -60px;
          top: -80px;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,117,31,0.24) 0%, rgba(255,117,31,0) 70%);
          pointer-events: none;
        }

        .hero-topline {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,117,31,0.12);
          border: 1px solid rgba(255,117,31,0.22);
          color: #ffae7b;
          font-size: 12px;
          font-weight: 800;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ff751f;
          box-shadow: 0 0 14px rgba(255,117,31,0.6);
        }

        .hero-row {
          position: relative;
          z-index: 1;
        }

        .hero-title {
          margin: 16px 0 10px;
          font-size: clamp(34px, 8vw, 44px);
          line-height: 0.96;
          letter-spacing: -0.055em;
          font-weight: 950;
          max-width: 11ch;
        }

        .hero-copy {
          margin: 0;
          max-width: 36ch;
          color: rgba(255,255,255,0.74);
          font-size: 15px;
          line-height: 1.62;
        }

        .hero-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .metric-card {
          border-radius: 18px;
          padding: 14px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          min-width: 0;
        }

        .metric-card span {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.52);
        }

        .metric-card strong {
          display: block;
          margin-top: 8px;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 900;
        }

        .hero-cta-row {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .primary-cta,
        .sticky-primary {
          background: linear-gradient(180deg, #ff8e45 0%, #ff751f 100%);
          color: #fff;
          font-weight: 900;
          border-radius: 18px;
          padding: 16px 18px;
          animation: pulseShadow 2.2s ease-in-out infinite;
        }

        .primary-cta {
          flex: 1 1 210px;
        }

        .secondary-cta {
          flex: 0 0 auto;
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-weight: 800;
          border-radius: 18px;
          padding: 16px 18px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .install-card {
          position: relative;
          z-index: 1;
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: 20px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .install-title {
          font-size: 14px;
          font-weight: 900;
        }

        .install-copy,
        .ios-tip {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255,255,255,0.66);
        }

        .install-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .small-primary,
        .small-ghost {
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
        }

        .small-primary {
          background: #ff751f;
          color: #fff;
        }

        .small-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
        }

        .mini-strip {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .mini-card {
          border-radius: 18px;
          padding: 14px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .mini-card-accent {
          background: linear-gradient(180deg, rgba(255,117,31,0.13), rgba(255,255,255,0.04));
          border-color: rgba(255,117,31,0.16);
        }

        .mini-card span {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.52);
        }

        .mini-card strong {
          display: block;
          margin-top: 8px;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 900;
        }

        .section-head {
          margin-top: 24px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }

        .compact-gap {
          margin-top: 18px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.03em;
        }

        .section-head p {
          margin: 6px 0 0;
          font-size: 13px;
          color: rgba(255,255,255,0.58);
        }

        .grid-cards,
        .quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .app-card,
        .quick-card {
          text-align: left;
          color: #fff;
        }

        .app-card {
          min-height: 158px;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-top,
        .quick-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .icon-box {
          width: 46px;
          height: 46px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,117,31,0.12);
          border: 1px solid rgba(255,117,31,0.2);
          font-size: 21px;
        }

        .pill-badge,
        .quick-badge {
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          font-size: 11px;
          font-weight: 800;
          color: #ffba8f;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .card-body strong,
        .quick-card strong {
          display: block;
          font-size: 21px;
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .card-body span,
        .quick-card span {
          display: block;
          margin-top: 7px;
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          line-height: 1.45;
        }

        .promo-banner {
          margin-top: 16px;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(135deg, rgba(255,117,31,0.18), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,117,31,0.18);
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
        }

        .promo-label {
          font-size: 12px;
          font-weight: 800;
          color: #ffba8f;
        }

        .promo-title {
          margin-top: 6px;
          font-size: 19px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .promo-button {
          flex-shrink: 0;
          padding: 12px 14px;
          border-radius: 14px;
          background: #ff751f;
          color: #fff;
          font-weight: 900;
        }

        .quick-card {
          min-height: 126px;
          border-radius: 22px;
          padding: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 14px 30px rgba(0,0,0,0.18);
        }

        .quick-icon {
          font-size: 20px;
        }

        .trust-panel {
          margin-top: 18px;
          border-radius: 24px;
          padding: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 14px 28px rgba(0,0,0,0.16);
        }

        .trust-head {
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .trust-panel ul {
          margin: 0;
          padding-left: 18px;
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          line-height: 1.65;
        }

        .bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: calc(74px + env(safe-area-inset-bottom));
          z-index: 40;
          width: min(calc(100% - 20px), 500px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          padding: 8px;
          border-radius: 22px;
          background: rgba(9, 13, 21, 0.9);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 44px rgba(0,0,0,0.28);
        }

        .nav-item {
          min-height: 42px;
          border-radius: 14px;
          background: transparent;
          color: rgba(255,255,255,0.64);
          font-size: 12px;
          font-weight: 800;
        }

        .nav-item.active {
          background: rgba(255,117,31,0.1);
          color: #ff8f49;
        }

        .sticky-launchbar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 41;
          padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
          background: linear-gradient(180deg, rgba(7,11,19,0), rgba(7,11,19,0.94) 24%, rgba(7,11,19,1) 100%);
        }

        .sticky-primary {
          width: min(100%, 500px);
          display: block;
          margin: 0 auto;
        }

        @media (max-width: 420px) {
          .hero-title {
            max-width: 12ch;
          }

          .hero-metrics,
          .mini-strip {
            grid-template-columns: 1fr;
          }

          .install-card,
          .promo-banner {
            flex-direction: column;
            align-items: stretch;
          }

          .install-actions {
            align-items: stretch;
          }
        }
      `}</style>
    </main>
  );
}
