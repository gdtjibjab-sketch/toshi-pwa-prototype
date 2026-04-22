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
  const [showSplash, setShowSplash] = useState(true);

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

    const splashTimer = setTimeout(() => setShowSplash(false), 900);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      clearTimeout(splashTimer);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  const primaryCards = useMemo(
    () => [
      {
        title: "Casino",
        subtitle: "Slots, live casino, dojo",
        icon: "🎰",
        href: "https://toshi.bet",
        glow: "rgba(255,117,31,0.20)",
      },
      {
        title: "Sports",
        subtitle: "Fixtures, markets, bets",
        icon: "⚽",
        href: "https://toshi.bet/sports/home",
        glow: "rgba(255,117,31,0.14)",
      },
      {
        title: "Rewards",
        subtitle: "Bonuses, rakeback, perks",
        icon: "🎁",
        href: "https://toshi.bet/rewards",
        glow: "rgba(255,117,31,0.12)",
      },
      {
        title: "VIP",
        subtitle: "Levels, boosts, status",
        icon: "💎",
        href: "https://toshi.bet/vip",
        glow: "rgba(255,117,31,0.10)",
      },
    ],
    []
  );

  const quickActions = useMemo(
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
        subtitle: "Help when needed",
        icon: "🛟",
        href: "https://toshi.bet",
      },
    ],
    []
  );

  if (showSplash) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 50% 28%, rgba(255,117,31,0.25) 0%, rgba(255,117,31,0.08) 24%, rgba(11,15,26,1) 58%), linear-gradient(180deg, #0b0f1a 0%, #090d16 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            animation: "fadeInUp 0.55s ease",
          }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "24px",
              margin: "0 auto 18px",
              background: "linear-gradient(180deg, rgba(255,117,31,0.20) 0%, rgba(255,117,31,0.06) 100%)",
              border: "1px solid rgba(255,117,31,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(255,117,31,0.18)",
            }}
          >
            <img
              src="/icons/icon-192.png"
              alt="Toshi.bet"
              style={{ width: "48px", height: "48px", objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              fontSize: "34px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            Toshi.bet
          </div>
          <div
            style={{
              marginTop: "8px",
              color: "rgba(255,255,255,0.62)",
              fontSize: "14px",
            }}
          >
            Crypto Casino & Sportsbook
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulseGlow {
            0%,
            100% {
              box-shadow: 0 0 0 rgba(255, 117, 31, 0);
            }
            50% {
              box-shadow: 0 0 22px rgba(255, 117, 31, 0.28);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,117,31,0.22) 0%, rgba(255,117,31,0.08) 16%, rgba(11,15,26,1) 44%), linear-gradient(180deg, #0b0f1a 0%, #090d16 100%)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "98px",
      }}
    >
      <div
        style={{
          maxWidth: "510px",
          margin: "0 auto",
          padding: "16px 14px 0",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            padding: "10px 2px 16px",
            backdropFilter: "blur(14px)",
            background: "linear-gradient(180deg, rgba(11,15,26,0.96) 0%, rgba(11,15,26,0.74) 100%)",
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
                  width: "48px",
                  height: "48px",
                  borderRadius: "15px",
                  background: "linear-gradient(180deg, rgba(255,117,31,0.22) 0%, rgba(255,117,31,0.06) 100%)",
                  border: "1px solid rgba(255,117,31,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 26px rgba(255,117,31,0.14)",
                }}
              >
                <img
                  src="/icons/icon-192.png"
                  alt="Toshi.bet"
                  style={{ width: "30px", height: "30px", objectFit: "contain" }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                  }}
                >
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
                fontWeight: 800,
                padding: "10px 13px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.09)",
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
            borderRadius: "30px",
            padding: "22px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.028) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-70px",
              right: "-40px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background:
                "radial-gradient(circle, rgba(255,117,31,0.26) 0%, rgba(255,117,31,0) 72%)",
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
              color: "#ff9d63",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            <span style={{ color: "#ff751f" }}>●</span>
            <span>{installed ? "Installed Experience" : "Install Toshi.bet"}</span>
          </div>

          <h1
            style={{
              marginTop: "16px",
              marginBottom: "10px",
              fontSize: "40px",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
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
              maxWidth: "96%",
              color: "rgba(255,255,255,0.72)",
              fontSize: "15px",
              lineHeight: 1.6,
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
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.56)" }}>Games</div>
              <div style={{ marginTop: "7px", fontSize: "24px", fontWeight: 900 }}>3000+</div>
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.56)" }}>Core Modes</div>
              <div style={{ marginTop: "7px", fontSize: "24px", fontWeight: 900 }}>
                Casino + Sports
              </div>
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
                padding: "15px 18px",
                borderRadius: "16px",
                fontWeight: 900,
                boxShadow: "0 14px 30px rgba(255,117,31,0.28)",
                animation: "pulseGlow 2.2s ease-in-out infinite",
              }}
            >
              Launch Toshi.bet
            </a>

            {!installed && deferredPrompt && (
              <button
                onClick={handleInstall}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.055)",
                  color: "#fff",
                  padding: "15px 18px",
                  borderRadius: "16px",
                  fontWeight: 900,
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
                background: "rgba(255,255,255,0.045)",
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
            <div style={{ fontSize: "18px", fontWeight: 900 }}>Core Access</div>
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
                  minHeight: "136px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: `0 12px 28px rgba(0,0,0,0.22), inset 0 0 60px ${card.glow}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,117,31,0.12)",
                    border: "1px solid rgba(255,117,31,0.22)",
                    fontSize: "20px",
                  }}
                >
                  {card.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      letterSpacing: "-0.02em",
                    }}
                  >
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
          <div style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px" }}>
            Quick Actions
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {quickActions.map((card) => (
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
                  minHeight: "114px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "20px" }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900 }}>{card.title}</div>
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
            borderRadius: "26px",
            padding: "18px",
            background:
              "linear-gradient(135deg, rgba(255,117,31,0.18) 0%, rgba(255,117,31,0.08) 45%, rgba(255,255,255,0.04) 100%)",
            border: "1px solid rgba(255,117,31,0.18)",
            boxShadow: "0 16px 32px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ fontSize: "13px", color: "#ffb181", fontWeight: 900 }}>
            Featured Experience
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "24px",
              lineHeight: 1.12,
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
              color: "rgba(255,255,255,0.72)",
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
          background: "rgba(8,11,18,0.94)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            maxWidth: "510px",
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
                fontWeight: item.active ? 900 : 700,
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

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
        }

        * {
          box-sizing: border-box;
        }

        a,
        button {
          transition: transform 0.16s ease, opacity 0.16s ease, box-shadow 0.16s ease,
            background 0.16s ease;
        }

        a:active,
        button:active {
          transform: scale(0.98);
        }

        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 14px 30px rgba(255, 117, 31, 0.18);
          }
          50% {
            box-shadow: 0 18px 36px rgba(255, 117, 31, 0.34);
          }
        }
      `}</style>
    </main>
  );
}