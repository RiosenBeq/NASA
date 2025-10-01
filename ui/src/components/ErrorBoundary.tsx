"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-card" style={{ 
          padding: 32, 
          textAlign: "center", 
          margin: "24px auto",
          maxWidth: 600,
          border: "2px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.1)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚨</div>
          <h2 style={{ color: "#ef4444", marginBottom: 16, fontSize: 24 }}>
            Bir Hata Oluştu
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ marginRight: 12 }}
          >
            🔄 Sayfayı Yenile
          </button>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-secondary"
          >
            🔙 Geri Dön
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: 24, textAlign: "left" }}>
              <summary style={{ cursor: "pointer", color: "var(--text-secondary)" }}>
                Hata Detayları (Geliştirici Modu)
              </summary>
              <pre style={{ 
                marginTop: 12, 
                padding: 12, 
                background: "rgba(0, 0, 0, 0.3)", 
                borderRadius: 8, 
                fontSize: 12, 
                overflow: "auto",
                color: "#ef4444"
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
