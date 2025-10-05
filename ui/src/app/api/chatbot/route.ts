import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the helpful assistant of the NextGenLAB Space Bioscience Explorer platform.

Language policy:
- Default to ENGLISH for all responses and UI tone.
- If the user's latest message is in TURKISH, respond ENTIRELY in TURKISH.
- Otherwise, respond in ENGLISH.

About the platform:
- NextGenLAB makes 608 NASA space biology publications accessible with AI
- Features: semantic search, AI summarization, Q&A, interactive knowledge graph
- Summaries use GPT-4o-mini (600–1000 words) with role-tailored insights
- Knowledge graph: 3,107 nodes and 40,967 edges
- Supports Turkish and English
- Built for NASA Space Apps Challenge 2025

Key features to highlight when asked:
1) Search: natural language across 608 publications with smart suggestions
2) AI Summaries: detailed, structured, role-aware analysis
3) Q&A: answers grounded in publication content (NCBI PMC)
4) Knowledge Graph: explore relationships and research clusters
5) Analytics: trends, distributions, and insights

Guidelines:
- Be concise, clear, and actionable
- Use bullets and short paragraphs when helpful
- Use emojis sparingly (🔍🤖🕸️📊) to improve scannability
- If unsure, ask a brief clarifying question
- Never invent facts beyond the provided context
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({
        response: "⚠️ OpenAI API key is not configured. Please contact the site administrator.",
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: apiKey,
      maxRetries: 2,
      timeout: 20000,
    });

    // Build messages array with conversation history
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];

    // Add conversation history (last 10 messages max)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        }
      });
    } else {
      // If no history, just add current message
      messages.push({
        role: "user",
        content: message,
      });
    }

    // Call OpenAI API with conversation context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      response,
      success: true,
    });

  } catch (error: unknown) {
    console.error("Chatbot error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Handle specific error types
    if (errorMessage.includes("rate_limit")) {
      return NextResponse.json({
        response: "⏳ Rate limit exceeded. Please try again in a few seconds.",
      });
    }
    
    if (errorMessage.includes("timeout")) {
      return NextResponse.json({
        response: "⏱️ Request timed out. Please try again.",
      });
    }

    if (errorMessage.includes("API key")) {
      return NextResponse.json({
        response: "🔑 Invalid API key. Please contact the administrator.",
      });
    }
    
    return NextResponse.json({
      response: "❌ An unexpected error occurred. Please try again later or ask a different question.",
    });
  }
}

