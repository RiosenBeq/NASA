import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
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
      {/* Logo with glow effect */}
      <div style={{
        marginBottom: "clamp(30px, 6vw, 48px)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: -20,
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)",
          filter: "blur(20px)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <Image 
          src="/logo.png" 
          alt="NextGenLAB" 
          width={120} 
          height={120}
          style={{ 
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 0 20px rgba(167, 139, 250, 0.6))",
          }}
        />
      </div>

      {/* 404 Title */}
      <h1 style={{
        fontSize: "clamp(48px, 15vw, 120px)",
        fontWeight: 900,
        background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: "clamp(16px, 3vw, 24px)",
        letterSpacing: "-0.02em",
      }}>
        404
      </h1>

      {/* Error Message */}
      <h2 style={{
        fontSize: "clamp(24px, 5vw, 36px)",
        fontWeight: 700,
        color: "var(--text-primary)",
        marginBottom: "clamp(12px, 2vw, 16px)",
      }}>
        Page Not Found
      </h2>

      <p style={{
        fontSize: "clamp(14px, 3.5vw, 18px)",
        color: "var(--text-secondary)",
        maxWidth: 500,
        marginBottom: "clamp(32px, 6vw, 48px)",
        lineHeight: 1.6,
      }}>
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to exploring NASA space biology research! 🚀
      </p>

      {/* Action Buttons */}
      <div style={{
        display: "flex",
        gap: "clamp(12px, 3vw, 16px)",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        <Link href="/">
          <button className="btn-primary" style={{
            padding: "clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px)",
            fontSize: "clamp(14px, 3.5vw, 16px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Image src="/logo.png" alt="" width={20} height={20} style={{ objectFit: "contain" }} />
            <span>Back to Home</span>
          </button>
        </Link>
        
        <Link href="/analytics">
          <button className="btn-secondary" style={{
            padding: "clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px)",
            fontSize: "clamp(14px, 3.5vw, 16px)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            color: "var(--text-primary)",
            cursor: "pointer",
            transition: "all 0.3s",
          }}>
            📊 View Analytics
          </button>
        </Link>
      </div>

      {/* Decorative Stars */}
      <div className="starfield" aria-hidden="true" />
    </div>
  );
}

