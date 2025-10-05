"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#000",
        color: "#fff",
      }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 40 }}>
            <Image 
              src="/logo.png" 
              alt="NextGenLAB" 
              width={80} 
              height={80}
              style={{ 
                filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))",
                opacity: 0.8,
              }}
            />
          </div>

          <div style={{ fontSize: 64, marginBottom: 20 }}>💥</div>
          
          <h1 style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Critical Error
          </h1>

          <p style={{
            fontSize: "clamp(14px, 3vw, 16px)",
            color: "#a0a0a0",
            maxWidth: 500,
            marginBottom: 32,
          }}>
            A critical error occurred in the application. We apologize for the inconvenience.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button 
              onClick={reset}
              style={{
                padding: "12px 24px",
                fontSize: 14,
                background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Image src="/logo.png" alt="" width={16} height={16} style={{ objectFit: "contain" }} />
              <span>Try Again</span>
            </button>
            
            <button 
              onClick={() => window.location.href = "/"}
              style={{
                padding: "12px 24px",
                fontSize: 14,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

