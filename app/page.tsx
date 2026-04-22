"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  const cards = [
    { label: "Casino", href: "https://toshi.bet" },
    { label: "Sports", href: "https://toshi.bet/sports/home" },
    { label: "Rewards", href: "https://toshi.bet/rewards" },
    { label: "VIP", href: "https://toshi.bet/vip" },
    { label: "Affiliate", href: "https://toshi.bet/affiliate" },
    { label: "LMS", href: "https://toshi.bet/last-man-standing" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b0b0f 0%, #10131b 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "90px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "20px 16px 0",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(11,11,15,0.92)",
            backdropFilter: "blur(8px)",
            padding: "14px 0 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700 }}>Toshi.bet</div>
          <div style={{ color: "#9aa3b2", fontSize: "14px", marginTop: "4px" }}>
            Installable app shell prototype
          </div>
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700 }}>Open Toshi fast</div>
          <div
            style={{
              color: "#aab2c0",
              fontSize: "14px",
              marginTop: "8px",
              lineHeight: 1.5,
            }}
          >
            This prototype shows the app shell layer that can sit on top of the real
            Toshi.bet experience.
          </div>

          <a
            href="https://toshi.bet"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: "14px",
              background: "#ffffff",
              color: "#000",
              padding: "12px 16px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open Main Site
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "18px",
          }}
        >
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "white",
                padding: "18px 14px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: "88px",
                display: "flex",
                alignItems: "flex-end",
                fontWeight: 700,
                fontSize: "18px",
              }}
            >
              {card.label}
            </a>
          ))}
        </div>
      </div>

      <nav
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(11,11,15,0.96)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            textAlign: "center",
            padding: "10px 8px",
            fontSize: "12px",
            color: "#c6cfdb",
          }}
        >
          <a href="https://toshi.bet" style={{ color: "inherit", textDecoration: "none" }}>
            Home
          </a>
          <a href="https://toshi.bet" style={{ color: "inherit", textDecoration: "none" }}>
            Casino
          </a>
          <a href="https://toshi.bet/sports/home" style={{ color: "inherit", textDecoration: "none" }}>
            Sports
          </a>
          <a href="https://toshi.bet/rewards" style={{ color: "inherit", textDecoration: "none" }}>
            Rewards
          </a>
          <a href="https://toshi.bet/vip" style={{ color: "inherit", textDecoration: "none" }}>
            VIP
          </a>
        </div>
      </nav>
    </main>
  );
}