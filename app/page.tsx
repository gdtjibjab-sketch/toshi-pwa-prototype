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
  href: string;
  subtitle?: string;
  badge?: string;
};

type PromoSlide = {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  routeId: string;
  image: string;
};

type MediaItem = {
  title: string;
  sub?: string;
  routeId: string;
  image: string;
};

const ASSETS = {
  appIcon: "/icons/icon-192.png",
  topLogo: "/assets/toshi-logo-horizontal.png",
  mascot: "/assets/toshi-mascot.png",
  casinoBanner: "/assets/casino.png",
  sportsBanner: "/assets/sports.png",
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
  installDismissed: "toshi_pwa_install_dismissed_v6",
};

const REDIRECT_DELAY_MS = 260;

const ROUTES: RouteItem[] = [
  { id: "casino", title: "Casino", href: "https://toshi.bet", subtitle: "Slots, live, originals", badge: "Top" },
  { id: "sports", title: "Sports", href: "https://toshi.bet/sports/home", subtitle: "Live, props, parlays", badge: "Live" },
  { id: "rewards", title: "Rewards", href: "https://toshi.bet/rewards", subtitle: "Bonuses & loyalty", badge: "Boost" },
  { id: "vip", title: "VIP", href: "https://toshi.bet/vip", subtitle: "Perks & status", badge: "Elite" },
  { id: "lms", title: "Last Man Standing", href: "https://toshi.bet/last-man-standing", subtitle: "Free-to-play", badge: "Free" },
  { id: "affiliate", title: "Affiliate", href: "https://toshi.bet/affiliate", subtitle: "Partner hub", badge: "Earn" },
  { id: "deposit", title: "Deposit", href: "https://toshi.bet", subtitle: "Fast crypto entry", badge: "Fast" },
  { id: "support", title: "Support", href: "https://toshi.bet", subtitle: "Help center", badge: "24/7" },
  { id: "dojo", title: "Toshi’s Dojo", href: "https://toshi.bet/casino/toshis-dojo", subtitle: "Original games" },
  { id: "new", title: "New Releases", href: "https://toshi.bet/casino/new-releases", subtitle: "Fresh games" },
  { id: "slots", title: "Slots", href: "https://toshi.bet/casino/slots", subtitle: "Popular slots" },
  { id: "bonus", title: "Bonus Buys", href: "https://toshi.bet/casino/bonus-buy", subtitle: "Buy bonus rounds" },
  { id: "livecasino", title: "Live Casino", href: "https://toshi.bet/casino/live-casino", subtitle: "Live tables" },
  { id: "raffle", title: "$25K Raffle", href: "https://toshi.bet/raffle", subtitle: "Prize draw" },
];

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "casino",
    eyebrow: "Play now",
    title: "Casino",
    copy: "Slots, live casino, and originals in one fast mobile flow.",
    cta: "Enter Casino",
    routeId: "casino",
    image: ASSETS.casinoBanner,
  },
  {
    id: "sports",
    eyebrow: "Live betting",
    title: "Sports",
    copy: "Go straight into fixtures, markets, and live action.",
    cta: "Bet Now",
    routeId: "sports",
    image: ASSETS.sportsBanner,
  },
  {
    id: "raffle",
    eyebrow: "Featured",
    title: "$25K Raffle",
    copy: "Jump straight into one of the strongest promo surfaces on the site.",
    cta: "View Raffle",
    routeId: "raffle",
    image: ASSETS.casinoBanner,
  },
];

const POPULAR_ITEMS: MediaItem[] = [
  { title: "Casino", sub: "Most played", routeId: "casino", image: ASSETS.casinoBanner },
  { title: "Sports", sub: "Live now", routeId: "sports", image: ASSETS.sportsBanner },
  { title: "VIP", sub: "Player perks", routeId: "vip", image: ASSETS.mascot },
  { title: "Rewards", sub: "Bonus access", routeId: "rewards", image: ASSETS.casinoBanner },
  { title: "Last Man Standing", sub: "Free entry", routeId: "lms", image: ASSETS.sportsBanner },
];

const CASINO_ITEMS: MediaItem[] = [
  { title: "Toshi’s Dojo", routeId: "dojo", image: ASSETS.casinoBanner },
  { title: "New Releases", routeId: "new", image: ASSETS.casinoBanner },
  { title: "Slots", routeId: "slots", image: ASSETS.casinoBanner },
  { title: "Live Casino", routeId: "livecasino", image: ASSETS.casinoBanner },
];

const FEATURED_ITEMS: MediaItem[] = [
  { title: "Last Man Standing", sub: "Free to play", routeId: "lms", image: ASSETS.sportsBanner },
  { title: "$25K Raffle", sub: "Win big", routeId: "raffle", image: ASSETS.casinoBanner },
  { title: "Bonus Buys", sub: "Quick entry", routeId: "bonus", image: ASSETS.casinoBanner },
];

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
      Object.entries(incoming).filter(([, value]) => typeof value === "string" && value.length > 0),
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

function getRoute(id: string) {
  return ROUTES.find((route) => route.id === id) || ROUTES[0];
}

function HomeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}
function SlotsIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="12" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M10 7h4M8.5 11h1M12 11h1M15.5 11h1M8.5 14.5h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M17 8.5h1.8a1.2 1.2 0 0 1 0 2.4H17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function SportsIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3.5 8.4 7l1.2 4.2h4.8L15.6 7 12 3.5ZM9.6 11.2 6 13.8l1.4 4.4h4.6M14.4 11.2 18 13.8l-1.4 4.4H12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
}
function GiftIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 10v10M4 13h16M7.5 10a2.5 2.5 0 1 1 0-5c2 0 4.5 3.3 4.5 5M16.5 10a2.5 2.5 0 1 0 0-5c-2 0-4.5 3.3-4.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CrownIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 18 1.5-9 4.5 4 2-5 2 5 4.5-4L20 18Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function TrophyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5V7a4 4 0 0 0 4 4M16 5h2.5A1.5 1.5 0 0 1 20 6.5V7a4 4 0 0 1-4 4M12 11v4M9 20h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function DiamondIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h10l4 5-9 9-9-9 4-5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.5 5 12 10l2.5-5M3 10h18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}
function WalletIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4 8h12.5A2.5 2.5 0 0 0 19 5.5V5M15.5 13h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function SupportIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 13v-1a6 6 0 0 1 12 0v1M6 13a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H6ZM18 13h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v-5ZM9 19a3 3 0 0 0 3 2h1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function MenuIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function getIcon(id: string) {
  switch (id) {
    case "casino": return <SlotsIcon />;
    case "sports": return <SportsIcon />;
    case "rewards": return <GiftIcon />;
    case "vip": return <CrownIcon />;
    case "lms": return <TrophyIcon />;
    case "affiliate": return <DiamondIcon />;
    case "deposit": return <WalletIcon />;
    case "support": return <SupportIcon />;
    default: return <HomeIcon />;
  }
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [tracking, setTracking] = useState<TrackingParams>({});
  const [recentId, setRecentId] = useState("casino");
  const [installDismissed, setInstallDismissed] = useState(false);
  const [activePromo, setActivePromo] = useState(0);
  const [activeHomeTab, setActiveHomeTab] = useState("top");
  const [activeNav, setActiveNav] = useState("home");
  const [isRouting, setIsRouting] = useState(false);
  const [routingLabel, setRoutingLabel] = useState("Opening");

  const topRoutes = useMemo(() => ROUTES.slice(0, 4), []);
  const actionRoutes = useMemo(() => ROUTES.filter((r) => ["lms", "affiliate", "deposit", "support"].includes(r.id)), []);
  const recentDestination = useMemo(() => getRoute(recentId), [recentId]);
  const activeSlide = PROMO_SLIDES[activePromo];

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
    setInstallDismissed(typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEYS.installDismissed) === "1");

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePromo((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function triggerTapFeedback() {
    if (typeof window === "undefined") return;
    if ("vibrate" in navigator) navigator.vibrate(12);
  }

  function handleRoute(route: RouteItem) {
    triggerTapFeedback();
    saveRecentDestination(route.id);
    setRecentId(route.id);
    setRoutingLabel(`Opening ${route.title}`);
    setIsRouting(true);
    window.setTimeout(() => {
      window.location.href = withTracking(route.href, tracking);
    }, REDIRECT_DELAY_MS);
  }

  function dismissInstallCard() {
    setInstallDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.installDismissed, "1");
    }
  }

  function SectionRow({
    title,
    actionLabel,
    actionRouteId,
    items,
  }: {
    title: string;
    actionLabel?: string;
    actionRouteId?: string;
    items: MediaItem[];
  }) {
    return (
      <>
        <section className="row-head compact">
          <h2>{title}</h2>
          {actionLabel && actionRouteId ? (
            <button className="row-link" onClick={() => handleRoute(getRoute(actionRouteId))}>
              {actionLabel}
            </button>
          ) : null}
        </section>

        <section className="horizontal-row">
          {items.map((item, index) => (
            <button
              key={`${title}-${item.title}-${index}`}
              className="media-card"
              onClick={() => handleRoute(getRoute(item.routeId))}
            >
              <div
                className="media-art"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(6,10,18,0.05) 0%, rgba(6,10,18,0.40) 100%), url(${item.image})`,
                }}
              />
              <strong>{item.title}</strong>
              {item.sub ? <span>{item.sub}</span> : null}
            </button>
          ))}
        </section>
      </>
    );
  }

  if (showSplash) {
    return <main className="app splash-screen"><div className="splash-mark"><img src={ASSETS.appIcon} alt="Toshi.bet" className="splash-logo" /></div><div className="splash-brand">Toshi.bet</div><div className="splash-track"><span /></div><style jsx global>{`
      :root { color-scheme: dark; }
      html, body { margin: 0; padding: 0; background: #060a12; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      @keyframes splashPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255,117,31,0); } 50% { transform: scale(1.04); box-shadow: 0 0 32px rgba(255,117,31,0.2); } }
      @keyframes loadBar { 0% { transform: translateX(-120%); } 100% { transform: translateX(250%); } }
    `}</style><style jsx>{`
      .app { min-height: 100vh; color: #fff; }
      .splash-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 18%, rgba(255,117,31,0.3) 0%, rgba(255,117,31,0.06) 24%, rgba(6,10,18,1) 58%), linear-gradient(180deg, #060a12 0%, #09111b 100%); padding: 24px; }
      .splash-mark { width: 96px; height: 96px; border-radius: 28px; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, rgba(255,117,31,0.18), rgba(255,117,31,0.04)); border: 1px solid rgba(255,117,31,0.32); animation: splashPulse 1.8s ease-in-out infinite; }
      .splash-logo { width: 54px; height: 54px; object-fit: contain; }
      .splash-brand { margin-top: 18px; font-size: 34px; font-weight: 900; letter-spacing: -0.05em; }
      .splash-track { margin-top: 26px; width: 124px; height: 5px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.08); }
      .splash-track span { display: block; width: 42%; height: 100%; border-radius: 999px; background: linear-gradient(90deg, rgba(255,117,31,0), #ff751f, rgba(255,117,31,0)); animation: loadBar 1.05s linear infinite; }
    `}</style></main>;
  }

  return (
    <main className="app shell">
      <div className="bg-orb bg-orb-a" />
      <div className="bg-orb bg-orb-b" />

      <div className="wrap">
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo-box"><img src={ASSETS.appIcon} alt="Toshi.bet" className="brand-logo-icon" /></div>
            <div className="brand-copy">
              <img src={ASSETS.topLogo} alt="Toshi.bet" className="brand-logo-wordmark" />
              <div className="brand-status">{installed ? "Installed" : "Ready to install"}</div>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Search"><SearchIcon /></button>
            <button className="icon-button" aria-label="Menu"><MenuIcon /></button>
          </div>
        </header>

        <section className="auth-strip">
          <button className="login-button" onClick={() => handleRoute(getRoute("casino"))}>Play</button>
          <button className="register-button" onClick={() => handleRoute(getRoute("deposit"))}>Deposit</button>
        </section>

        {!installed && !installDismissed && (deferredPrompt || showIOSInstall) && (
          <section className="install-bar">
            <div className="install-copy">
              <strong>Install app</strong>
              <span>{showIOSInstall && !deferredPrompt ? "Share → Add to Home Screen" : "Launch from home screen for the best experience"}</span>
            </div>
            <div className="install-actions">
              {deferredPrompt && <button className="mini-primary" onClick={handleInstall}>Install</button>}
              <button className="mini-ghost" onClick={dismissInstallCard}>Later</button>
            </div>
          </section>
        )}

        <section className="home-tabs">
          {["top", "sports", "casino", "rewards"].map((tab) => (
            <button
              key={tab}
              className={`home-tab ${activeHomeTab === tab ? "active" : ""}`}
              onClick={() => { triggerTapFeedback(); setActiveHomeTab(tab); }}
            >
              {tab === "top" ? "Top" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </section>

        <section
          className="promo-panel"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(6,10,18,0.92) 0%, rgba(6,10,18,0.70) 42%, rgba(6,10,18,0.25) 100%), url(${activeSlide.image})`,
          }}
        >
          <div className="promo-overlay" />
          <div className="promo-content">
            <div className="promo-eyebrow">{activeSlide.eyebrow}</div>
            <h1 className="promo-title">{activeSlide.title}</h1>
            <p className="promo-copy">{activeSlide.copy}</p>
            <div className="promo-actions">
              <button className="promo-primary" onClick={() => handleRoute(getRoute(activeSlide.routeId))}>
                {activeSlide.cta}
              </button>
            </div>
            <div className="promo-dots">
              {PROMO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  className={`dot ${index === activePromo ? "active" : ""}`}
                  onClick={() => { triggerTapFeedback(); setActivePromo(index); }}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="icon-grid">
          {topRoutes.map((route) => (
            <button key={route.id} className="feature-card" onClick={() => handleRoute(route)}>
              <div className="feature-icon">{getIcon(route.id)}</div>
              <div className="feature-title">{route.title}</div>
              <div className="feature-sub">{route.subtitle}</div>
              {route.badge ? <div className="feature-badge">{route.badge}</div> : null}
            </button>
          ))}
        </section>

        <SectionRow title="Popular now" actionLabel="Open casino" actionRouteId="casino" items={POPULAR_ITEMS} />
        <SectionRow title="Casino" items={CASINO_ITEMS} />
        <SectionRow title="Featured" items={FEATURED_ITEMS} />

        <section className="row-head compact">
          <h2>Live routes</h2>
          <button className="row-link" onClick={() => handleRoute(getRoute("sports"))}>Open sports</button>
        </section>

        <section className="live-list">
          {[
            { title: "Sports", value: "Live markets", routeId: "sports", badge: "Live" },
            { title: "Last Man Standing", value: "Free entry", routeId: "lms", badge: "Free" },
            { title: "$25K Raffle", value: "Prize draw", routeId: "raffle", badge: "Hot" },
          ].map((item) => (
            <button key={item.title} className="live-item" onClick={() => handleRoute(getRoute(item.routeId))}>
              <div className="live-left">
                <span className="live-badge">{item.badge}</span>
                <strong>{item.title}</strong>
              </div>
              <div className="live-right">{item.value}</div>
            </button>
          ))}
        </section>

        <section className="row-head compact">
          <h2>Quick actions</h2>
          <button className="row-link" onClick={() => handleRoute(getRoute("affiliate"))}>More</button>
        </section>

        <section className="quick-grid">
          {actionRoutes.map((route) => (
            <button key={route.id} className="quick-card" onClick={() => handleRoute(route)}>
              <div className="quick-icon-box">{getIcon(route.id)}</div>
              <strong>{route.title}</strong>
              <span>{route.subtitle}</span>
            </button>
          ))}
        </section>
      </div>

      <nav className="bottom-nav">
        {[
          { id: "home", label: "Home", icon: <HomeIcon /> },
          { id: "casino", label: "Casino", icon: <SlotsIcon />, route: getRoute("casino") },
          { id: "sports", label: "Sports", icon: <SportsIcon />, route: getRoute("sports") },
          { id: "rewards", label: "Rewards", icon: <GiftIcon />, route: getRoute("rewards") },
          { id: "vip", label: "VIP", icon: <CrownIcon />, route: getRoute("vip") },
        ].map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => {
              triggerTapFeedback();
              setActiveNav(item.id);
              if (item.route) handleRoute(item.route);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sticky-bar">
        <button className="sticky-main" onClick={() => handleRoute(recentDestination)}>
          Continue to {recentDestination.title}
        </button>
      </div>

      {isRouting && (
        <div className="route-overlay">
          <div className="route-overlay-card">
            <div className="route-spinner" />
            <div className="route-overlay-text">{routingLabel}</div>
          </div>
        </div>
      )}

      <style jsx global>{`
        :root { color-scheme: dark; }
        html, body { margin: 0; padding: 0; background: #060a12; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { font: inherit; border: 0; cursor: pointer; color: inherit; }
        img { display: block; }
        svg { width: 100%; height: 100%; display: block; }
        button, a { transition: transform 0.14s ease, opacity 0.14s ease, box-shadow 0.18s ease, background 0.18s ease; }
        button:active, a:active { transform: scale(0.975); }
        @keyframes pulseButton { 0%, 100% { box-shadow: 0 18px 34px rgba(255,117,31,0.2); } 50% { box-shadow: 0 22px 44px rgba(255,117,31,0.34); } }
        @keyframes spinRoute { to { transform: rotate(360deg); } }
      `}</style>

      <style jsx>{`
        .app { min-height: 100vh; color: #ffffff; }
        .shell {
          position: relative; overflow-x: hidden;
          background: radial-gradient(circle at top, rgba(255,117,31,0.16) 0%, rgba(255,117,31,0.06) 12%, rgba(6,10,18,1) 38%), linear-gradient(180deg, #060a12 0%, #09111b 100%);
          padding-bottom: 170px;
        }
        .bg-orb { position: fixed; border-radius: 999px; pointer-events: none; filter: blur(22px); opacity: 0.5; }
        .bg-orb-a { width: 220px; height: 220px; top: -40px; left: -80px; background: rgba(255,117,31,0.18); }
        .bg-orb-b { width: 180px; height: 180px; top: 240px; right: -90px; background: rgba(0,162,255,0.1); }
        .wrap { position: relative; z-index: 1; width: min(100%, 520px); margin: 0 auto; padding: max(14px, env(safe-area-inset-top)) 14px 0; }
        .topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 2px 14px; backdrop-filter: blur(18px); background: linear-gradient(180deg, rgba(6,10,18,0.95), rgba(6,10,18,0.72)); }
        .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .brand-logo-box { width: 46px; height: 46px; border-radius: 16px; background: linear-gradient(180deg, rgba(255,117,31,0.18), rgba(255,117,31,0.05)); border: 1px solid rgba(255,117,31,0.28); display: flex; align-items: center; justify-content: center; box-shadow: 0 18px 28px rgba(0,0,0,0.2); flex-shrink: 0; }
        .brand-logo-icon { width: 28px; height: 28px; object-fit: contain; }
        .brand-copy { min-width: 0; }
        .brand-logo-wordmark { height: 22px; width: auto; max-width: 178px; object-fit: contain; }
        .brand-status { margin-top: 4px; font-size: 12px; color: rgba(255,255,255,0.56); }
        .topbar-actions { display: flex; gap: 8px; }
        .icon-button { width: 38px; height: 38px; padding: 9px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.82); }
        .auth-strip { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
        .login-button, .register-button { min-height: 48px; border-radius: 14px; font-weight: 900; }
        .login-button { background: linear-gradient(180deg, #1b7cff 0%, #0457d8 100%); color: #fff; box-shadow: 0 14px 28px rgba(27,124,255,0.24); }
        .register-button { background: linear-gradient(180deg, #2fe977 0%, #0fb856 100%); color: #05120a; box-shadow: 0 14px 28px rgba(28,201,102,0.2); }
        .install-bar { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 18px; background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.06); }
        .install-copy { display: flex; flex-direction: column; gap: 3px; }
        .install-copy strong { font-size: 13px; line-height: 1.2; }
        .install-copy span { font-size: 12px; line-height: 1.35; color: rgba(255,255,255,0.62); }
        .install-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .mini-primary, .mini-ghost { min-height: 36px; padding: 0 12px; border-radius: 12px; font-size: 12px; font-weight: 800; }
        .mini-primary { background: #ff751f; color: #fff; }
        .mini-ghost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.82); }
        .home-tabs { display: flex; gap: 8px; margin-top: 14px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .home-tabs::-webkit-scrollbar, .horizontal-row::-webkit-scrollbar { display: none; }
        .home-tab { flex-shrink: 0; min-height: 36px; padding: 0 14px; border-radius: 999px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.68); border: 1px solid rgba(255,255,255,0.05); font-size: 12px; font-weight: 800; }
        .home-tab.active { background: rgba(255,117,31,0.12); color: #ff9b5e; border-color: rgba(255,117,31,0.16); }
        .promo-panel { position: relative; margin-top: 14px; border-radius: 30px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); min-height: 300px; background-size: cover; background-position: center; box-shadow: 0 28px 60px rgba(0,0,0,0.34); }
        .promo-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 20% 24%, rgba(255,117,31,0.22), transparent 30%), radial-gradient(circle at 78% 78%, rgba(0,143,255,0.14), transparent 34%); pointer-events: none; }
        .promo-content { position: relative; z-index: 1; padding: 24px 20px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 300px; }
        .promo-eyebrow { color: #78c7ff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
        .promo-title { margin: 10px 0 8px; font-size: clamp(32px, 7vw, 42px); line-height: 0.96; font-weight: 950; letter-spacing: -0.05em; max-width: 10ch; }
        .promo-copy { margin: 0; max-width: 29ch; color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.55; text-shadow: 0 2px 16px rgba(0,0,0,0.32); }
        .promo-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .promo-primary, .sticky-main { background: linear-gradient(180deg, #ff8e45 0%, #ff751f 100%); color: #fff; border-radius: 16px; font-weight: 900; animation: pulseButton 2.2s ease-in-out infinite; }
        .promo-primary { min-height: 46px; padding: 0 16px; }
        .promo-dots { display: flex; gap: 8px; margin-top: 18px; }
        .dot { width: 8px; height: 8px; border-radius: 999px; padding: 0; background: rgba(255,255,255,0.24); }
        .dot.active { width: 24px; background: #ff751f; }
        .icon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 14px; }
        .feature-card { position: relative; min-height: 132px; border-radius: 22px; padding: 14px 10px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); border: 1px solid rgba(255,255,255,0.07); text-align: left; box-shadow: 0 16px 32px rgba(0,0,0,0.2); }
        .feature-icon, .quick-icon-box { width: 38px; height: 38px; padding: 8px; border-radius: 12px; background: rgba(255,117,31,0.12); color: #ff9b5e; border: 1px solid rgba(255,117,31,0.16); }
        .feature-title { margin-top: 12px; font-size: 15px; font-weight: 900; line-height: 1.1; letter-spacing: -0.02em; }
        .feature-sub { margin-top: 6px; font-size: 11px; line-height: 1.35; color: rgba(255,255,255,0.56); }
        .feature-badge { position: absolute; top: 12px; right: 12px; min-height: 22px; padding: 0 8px; border-radius: 999px; display: inline-flex; align-items: center; background: rgba(255,255,255,0.07); color: #ffbb92; font-size: 10px; font-weight: 800; }
        .row-head { margin-top: 22px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .row-head.compact { margin-top: 18px; }
        .row-head h2 { margin: 0; font-size: 20px; letter-spacing: -0.03em; }
        .row-link { background: transparent; color: #7bbfff; font-size: 13px; font-weight: 800; }
        .horizontal-row { display: flex; gap: 12px; overflow-x: auto; padding-top: 12px; padding-bottom: 2px; scrollbar-width: none; }
        .media-card { flex: 0 0 152px; border-radius: 22px; padding: 12px; text-align: left; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 14px 30px rgba(0,0,0,0.18); }
        .media-art { height: 118px; border-radius: 16px; margin-bottom: 12px; background-size: cover; background-position: center; }
        .media-card strong { display: block; font-size: 16px; line-height: 1.1; font-weight: 900; }
        .media-card span { display: block; margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.58); }
        .live-list { margin-top: 12px; display: grid; gap: 10px; }
        .live-item { min-height: 62px; padding: 0 16px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; }
        .live-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .live-left strong { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .live-badge { min-height: 24px; padding: 0 8px; border-radius: 999px; display: inline-flex; align-items: center; background: rgba(255,117,31,0.1); color: #ff9b5e; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .live-right { color: rgba(255,255,255,0.62); font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
        .quick-card { min-height: 118px; padding: 16px; border-radius: 22px; text-align: left; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 14px 28px rgba(0,0,0,0.18); }
        .quick-card strong { display: block; margin-top: 12px; font-size: 16px; line-height: 1.1; font-weight: 900; }
        .quick-card span { display: block; margin-top: 6px; font-size: 12px; line-height: 1.4; color: rgba(255,255,255,0.58); }
        .bottom-nav { position: fixed; left: 0; right: 0; bottom: calc(72px + env(safe-area-inset-bottom)); z-index: 40; width: min(calc(100% - 20px), 500px); margin: 0 auto; display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; padding: 8px; border-radius: 22px; background: rgba(8,12,20,0.92); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(18px); box-shadow: 0 18px 42px rgba(0,0,0,0.28); }
        .nav-item { min-height: 54px; border-radius: 16px; background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; color: rgba(255,255,255,0.6); }
        .nav-item.active { background: rgba(255,117,31,0.1); color: #ff9b5e; }
        .nav-icon { width: 18px; height: 18px; }
        .nav-label { font-size: 10px; font-weight: 800; }
        .sticky-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; padding: 12px 12px calc(12px + env(safe-area-inset-bottom)); background: linear-gradient(180deg, rgba(6,10,18,0), rgba(6,10,18,0.94) 24%, rgba(6,10,18,1) 100%); }
        .sticky-main { width: min(100%, 500px); min-height: 54px; display: block; margin: 0 auto; }
        .route-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(6,10,18,0.72); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
        .route-overlay-card { min-width: 168px; padding: 18px 20px; border-radius: 20px; background: linear-gradient(180deg, rgba(19,24,36,0.96), rgba(11,16,26,0.96)); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 24px 60px rgba(0,0,0,0.35); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .route-spinner { width: 28px; height: 28px; border-radius: 999px; border: 3px solid rgba(255,255,255,0.14); border-top-color: #ff751f; animation: spinRoute 0.85s linear infinite; }
        .route-overlay-text { font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.9); }
        @media (max-width: 460px) {
          .icon-grid { grid-template-columns: repeat(2, 1fr); }
          .brand-logo-wordmark { max-width: 146px; height: 20px; }
          .promo-panel, .promo-content { min-height: 280px; }
        }
        @media (max-width: 380px) {
          .quick-grid { grid-template-columns: 1fr; }
          .install-bar { flex-direction: column; align-items: stretch; }
          .install-actions { justify-content: space-between; }
        }
      `}</style>
    </main>
  );
}
