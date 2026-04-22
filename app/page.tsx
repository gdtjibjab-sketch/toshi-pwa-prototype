"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowIOSInstall(false);
    };

    setInstalled(isStandalone());
    setShowIOSInstall(isIOS() && !isStandalone());

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const primaryCards = useMemo(
    () => [
      {
        title: "Casino",
        subtitle: "Slots, live casino, dojo",
        icon: "🎰",
        href: "https://toshi.bet",
      },
      {
        title: "Sports",
        subtitle: "Fixtures, markets, bets",
        icon: "⚽",
        href: "https://toshi.bet/sports/home",
      },
      {
        title: "Rewards",
        subtitle: "Bonuses, rakeback, perks",
        icon: "🎁",
        href: "https://toshi.bet/rewards",
      },
      {
        title: "VIP",
        subtitle: "Levels, boosts, status",
        icon: "💎",
        href: "https://toshi.bet/vip",
      },
    ],
    []
  );

  const secondaryCards = useMemo(
    () => [
      {
        title: "Affiliate",
        subtitle: "Partners & revenue",
        icon: "🤝",
        href: "https://toshi.bet/affiliate",
      },
      {
        title: "LMS",
        subtitle: "Last Man Standing",
        icon: "🏆",
        href: "https://toshi.bet/last-man-standing",
      },
      {
        title: "Deposit",
        subtitle: "Fast crypto funding",
        icon: "💳",
        href: "https://toshi.bet",
      },
      {
        title: "Support",
        subtitle: "Help when you need it",
        icon: "🛟",
        href: "https://toshi.bet",
      },
    ],
    []
  );

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,117,31,0.18) 0%, rgba(255,117,31,0.06) 18%, rgba(11,15,26,1) 42%), linear-gradient(180deg, #0b0f1a 0%, #090d16 100%)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "92px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "18px 14px 0",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            padding: "10px 2px 16px",
            backdropFilter: "blur(12px)",
            background: "linear-gradient(180deg, rgba(11,15,26,0.95) 0%, rgba(11,15,26,0.72) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "linear-gradient(180deg, rgba(255,117,31,0.22) 0%, rgba(255,117,31,0.08) 100%)",
                  border: "1px solid rgba(255,117,31,0.32)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 28px rgba(255,117,31,0.16)",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/icons/icon-192.png"
                  alt="Toshi.bet"
                  style={{ width: "28px", height: "28px", objectFit: "contain" }}
                />
              </div>

              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Toshi.bet
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.62)" }}>
                  Crypto Casino & Sportsbook
                </div>
              </div>
            </div>

            <a
              href="https://toshi.bet"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                padding: "10px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Launch
            </a>
          </div>
        </header>

        <section
          style={{
            marginTop: "16px",
            borderRadius: "28px",
            padding: "22px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-30px",
              width: "180px",
              height: "180px",
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(255,117,31,0.24) 0%, rgba(255,117,31,0) 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(255,117,31,0.12)",
              border: "1px solid rgba(255,117,31,0.24)",
              color: "#ff9a5c",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <span>●</span>
            <span>{installed ? "Installed Experience" : "Install Toshi.bet"}</span>
          </div>

          <h1
            style={{
              marginTop: "16px",
              marginBottom: "10px",
              fontSize: "34px",
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              fontWeight: 900,
            }}
          >
            Open faster.
            <br />
            Play sharper.
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.72)",
              maxWidth: "92%",
            }}
          >
            Fast access to Casino, Sports, Rewards, VIP, and Last Man Standing in a cleaner mobile-first experience.
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{
                borderRadius: "18px",
                padding: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.56)" }}>Games</div>
              <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 800 }}>3000+</div>
            </div>
            <div
              style={{
                borderRadius: "18px",
                padding: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.56)" }}>Core Modes</div>
              <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 800 }}>Casino + Sports</div>
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <a
              href="https://toshi.bet"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "#ff751f",
                color: "#fff",
                padding: "14px 18px",
                borderRadius: "16px",
                fontWeight: 800,
                boxShadow: "0 14px 30px rgba(255,117,31,0.28)",
              }}
            >
              Launch Toshi.bet
            </a>

            {!installed && deferredPrompt && (
              <button
                onClick={handleInstall}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Install App
              </button>
            )}
          </div>

          {!installed && showIOSInstall && !deferredPrompt && (
            <div
              style={{
                marginTop: "14px",
                padding: "14px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              On iPhone, tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to install Toshi.bet like an app.
            </div>
          )}
        </section>

        <section style={{ marginTop: "22px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "17px", fontWeight: 800 }}>Core Access</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              One tap entry
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {primaryCards.map((card) => (
              <a
                key={card.title}
                href={card.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  borderRadius: "24px",
                  padding: "18px",
                  minHeight: "130px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.035) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,117,31,0.12)",
                    border: "1px solid rgba(255,117,31,0.2)",
                    fontSize: "20px",
                  }}
                >
                  {card.icon}
                </div>

                <div>
                  <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {card.title}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "22px" }}>
          <div style={{ fontSize: "17px", fontWeight: 800, marginBottom: "12px" }}>
            Quick Actions
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {secondaryCards.map((card) => (
              <a
                key={card.title}
                href={card.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  borderRadius: "22px",
                  padding: "16px",
                  minHeight: "112px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "20px" }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 800 }}>{card.title}</div>
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.58)",
                    }}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: "22px",
            marginBottom: "10px",
            borderRadius: "24px",
            padding: "18px",
            background:
              "linear-gradient(135deg, rgba(255,117,31,0.18) 0%, rgba(255,117,31,0.06) 45%, rgba(255,255,255,0.04) 100%)",
            border: "1px solid rgba(255,117,31,0.18)",
          }}
        >
          <div style={{ fontSize: "13px", color: "#ffb181", fontWeight: 800 }}>
            Featured Experience
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "22px",
              lineHeight: 1.15,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            Toshi Dojo, Sports, VIP perks,
            <br />
            and fast crypto flow.
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            Use this installable shell as the clean mobile entry point into the Toshi.bet ecosystem.
          </div>
        </section>
      </div>

      <nav
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          background: "rgba(8,11,18,0.92)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "4px",
            padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
            textAlign: "center",
          }}
        >
          {[
            { label: "Home", href: "https://toshi.bet", active: true },
            { label: "Casino", href: "https://toshi.bet" },
            { label: "Sports", href: "https://toshi.bet/sports/home" },
            { label: "Rewards", href: "https://toshi.bet/rewards" },
            { label: "Menu", href: "https://toshi.bet/vip" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: item.active ? "#ff751f" : "rgba(255,255,255,0.68)",
                fontSize: "12px",
                fontWeight: item.active ? 800 : 700,
                padding: "10px 4px",
                borderRadius: "14px",
                background: item.active ? "rgba(255,117,31,0.08)" : "transparent",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}