"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "👋 **Welcome!** This is the NextGenLAB Space Bioscience Explorer.\n\nHow can I help you today? You can ask about search, AI summaries, Q&A, or the knowledge graph. 🚀",
  timestamp: new Date(),
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai-assistant-messages");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }));
        } catch {
          return [INITIAL_MESSAGE];
        }
      }
    }
    return [INITIAL_MESSAGE];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai-assistant-messages", JSON.stringify(messages));
    }
  }, [messages]);

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

  // Parse markdown-like formatting
  const formatMessage = (text: string) => {
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    // Lists
    formatted = formatted.replace(/^- (.+)$/gm, '• $1');
    return formatted;
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ai-assistant-messages");
    }
  };

  const sendMessage = async (quickQuestion?: string) => {
    const messageToSend = quickQuestion || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Send conversation history for context
      const conversationHistory = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageToSend,
          history: conversationHistory
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "⚠️ Connection error. Please try again.",
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
    "🔍 How can I search publications?",
    "🤖 How do AI summaries work?",
    "🕸️ What is the knowledge graph?",
    "📊 What data is available?",
    "🚀 What are the platform features?",
    "💡 How to use the Q&A feature?",
    "📈 What does the Analytics page show?",
    "🌌 Where do NASA data sources come from?",
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
                  {messages.length - 1} mesaj
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  title="Konuşmayı Temizle"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "#ef4444",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  }}
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Kapat"
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
                  position: "relative",
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
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "75%", flex: 1 }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 16,
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.2))"
                          : "rgba(167, 139, 250, 0.1)",
                      border: "1px solid rgba(167, 139, 250, 0.3)",
                      color: "#fff",
                      fontSize: 14,
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                  <button
                    onClick={() => copyToClipboard(msg.content, idx)}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: copiedIndex === idx ? "rgba(34, 197, 94, 0.2)" : "rgba(167, 139, 250, 0.1)",
                      border: "1px solid " + (copiedIndex === idx ? "rgba(34, 197, 94, 0.3)" : "rgba(167, 139, 250, 0.2)"),
                      color: copiedIndex === idx ? "#22c55e" : "rgba(255, 255, 255, 0.5)",
                      fontSize: 11,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (copiedIndex !== idx) {
                        e.currentTarget.style.background = "rgba(167, 139, 250, 0.2)";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedIndex !== idx) {
                        e.currentTarget.style.background = "rgba(167, 139, 250, 0.1)";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                      }
                    }}
                  >
                    {copiedIndex === idx ? "✓ Kopyalandı" : "📋 Kopyala"}
                  </button>
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
          {messages.length <= 2 && !isLoading && (
            <div style={{ padding: "0 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickQuestions.slice(0, messages.length === 1 ? 8 : 4).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    background: "rgba(167, 139, 250, 0.1)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    color: "#a78bfa",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(167, 139, 250, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.5)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(167, 139, 250, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
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
                onClick={() => sendMessage()}
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

