"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Merhaba! NextGenLAB Space Bioscience Explorer'a hoş geldiniz! Size nasıl yardımcı olabilirim?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "⚠️ Bağlantı hatası. Lütfen tekrar deneyin.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "🔍 Nasıl arama yapabilirim?",
    "🤖 AI özetleme nasıl çalışır?",
    "🕸️ Bilgi grafiği nedir?",
    "📊 Hangi veriler var?",
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-assistant-button"
          aria-label="AI Asistan"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(167, 139, 250, 0.9), rgba(96, 165, 250, 0.9))",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(167, 139, 250, 0.5), 0 0 0 0 rgba(167, 139, 250, 0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            zIndex: 9999,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
            e.currentTarget.style.boxShadow = "0 12px 48px rgba(167, 139, 250, 0.7), 0 0 0 8px rgba(167, 139, 250, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(167, 139, 250, 0.5), 0 0 0 0 rgba(167, 139, 250, 0.7)";
          }}
        >
          🤖
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="ai-assistant-window"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: "min(450px, calc(100vw - 48px))",
            height: "min(650px, calc(100vh - 48px))",
            background: "rgba(10, 10, 10, 0.98)",
            backdropFilter: "blur(30px)",
            border: "2px solid rgba(167, 139, 250, 0.5)",
            borderRadius: 24,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            overflow: "hidden",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.2))",
              borderBottom: "1px solid rgba(167, 139, 250, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>AI Asistan</div>
                <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                  NextGenLAB Rehberi
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#fff",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 10,
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #60a5fa, #3b82f6)"
                        : "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: 16,
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.2))"
                        : "rgba(167, 139, 250, 0.1)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    color: "#fff",
                    fontSize: 14,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", gap: 10, animation: "fadeIn 0.3s ease-out" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    background: "rgba(167, 139, 250, 0.1)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <div className="loading-dot" style={{ animation: "bounce 1s infinite 0s" }}>●</div>
                  <div className="loading-dot" style={{ animation: "bounce 1s infinite 0.2s" }}>●</div>
                  <div className="loading-dot" style={{ animation: "bounce 1s infinite 0.4s" }}>●</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div style={{ padding: "0 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    background: "rgba(167, 139, 250, 0.1)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    color: "#a78bfa",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(167, 139, 250, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(167, 139, 250, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.3)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: 20,
              borderTop: "1px solid rgba(167, 139, 250, 0.3)",
              background: "rgba(10, 10, 10, 0.5)",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Soru sorun..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(20, 20, 20, 0.6)",
                  border: "1.5px solid rgba(167, 139, 250, 0.3)",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167, 139, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  background: input.trim() && !isLoading
                    ? "linear-gradient(135deg, #a78bfa, #8b5cf6)"
                    : "rgba(167, 139, 250, 0.2)",
                  border: "none",
                  color: "#fff",
                  fontSize: 20,
                  cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  opacity: input.trim() && !isLoading ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !isLoading) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(167, 139, 250, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(167, 139, 250, 0.5), 0 0 0 0 rgba(167, 139, 250, 0.7);
          }
          50% {
            box-shadow: 0 8px 32px rgba(167, 139, 250, 0.8), 0 0 0 8px rgba(167, 139, 250, 0.2);
          }
        }

        .loading-dot {
          color: rgba(167, 139, 250, 0.8);
          font-size: 20px;
        }
      `}</style>
    </>
  );
}

