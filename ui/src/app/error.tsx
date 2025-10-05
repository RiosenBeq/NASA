"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(20px, 5vw, 40px)",
      textAlign: "center",
      background: "var(--deep-space)",
    }}>
      {/* Logo with error glow */}
      <div style={{
        marginBottom: "clamp(30px, 6vw, 48px)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: -20,
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)",
          filter: "blur(20px)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <Image 
          src="/logo.png" 
          alt="NextGenLAB" 
          width={100} 
          height={100}
          style={{ 
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))",
            opacity: 0.9,
          }}
        />
      </div>

      {/* Error Icon */}
      <div style={{
        fontSize: "clamp(48px, 10vw, 80px)",
        marginBottom: "clamp(16px, 3vw, 24px)",
      }}>
        ⚠️
      </div>

      {/* Error Title */}
      <h1 style={{
        fontSize: "clamp(28px, 6vw, 42px)",
        fontWeight: 700,
        color: "var(--text-primary)",
        marginBottom: "clamp(12px, 2vw, 16px)",
      }}>
        Something Went Wrong
      </h1>

      {/* Error Message */}
      <p style={{
        fontSize: "clamp(14px, 3.5vw, 16px)",
        color: "var(--text-secondary)",
        maxWidth: 600,
        marginBottom: "clamp(8px, 2vw, 12px)",
        lineHeight: 1.6,
      }}>
        We encountered an unexpected error while processing your request.
      </p>

      {/* Error Details (Dev Mode) */}
      {process.env.NODE_ENV === "development" && (
        <details style={{
          marginBottom: "clamp(24px, 5vw, 32px)",
          padding: "clamp(12px, 3vw, 16px)",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: 12,
          maxWidth: 600,
          width: "100%",
          textAlign: "left",
        }}>
          <summary style={{
            cursor: "pointer",
            fontSize: "clamp(12px, 3vw, 14px)",
            color: "#ef4444",
            fontWeight: 600,
            marginBottom: 8,
          }}>
            Technical Details
          </summary>
          <code style={{
            display: "block",
            fontSize: "clamp(11px, 2.5vw, 12px)",
            color: "rgba(255, 255, 255, 0.7)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
          </code>
        </details>
      )}

      {/* Action Buttons */}
      <div style={{
        display: "flex",
        gap: "clamp(12px, 3vw, 16px)",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "clamp(16px, 3vw, 24px)",
      }}>
        <button 
          onClick={reset}
          className="btn-primary" 
          style={{
            padding: "clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px)",
            fontSize: "clamp(14px, 3.5vw, 16px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Image src="/logo.png" alt="" width={20} height={20} style={{ objectFit: "contain" }} />
          <span>Try Again</span>
        </button>
        
        <button 
          onClick={() => window.location.href = "/"}
          style={{
            padding: "clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px)",
            fontSize: "clamp(14px, 3.5vw, 16px)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            color: "var(--text-primary)",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          🏠 Go Home
        </button>
      </div>

      {/* Help Text */}
      <p style={{
        fontSize: "clamp(12px, 2.5vw, 14px)",
        color: "rgba(255, 255, 255, 0.5)",
        marginTop: "clamp(24px, 5vw, 40px)",
        maxWidth: 500,
      }}>
        If this problem persists, please try refreshing the page or contact support.
      </p>

      {/* Decorative Stars */}
      <div className="starfield" aria-hidden="true" />
    </div>
  );
}

