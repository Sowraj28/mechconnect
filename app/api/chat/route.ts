import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are MechBot, a friendly AI assistant for MechConnect — India's platform for sewage and septic tank cleaning services. Help users identify what service or machinery they need. Keep replies concise (2-4 sentences or bullet points max). Available services: Septic Tank Cleaning, Sewage Drain, Vacuum Tanker, Manhole Cleaning, Jetting Machine, Suction-cum-Jetting. Always suggest users find verified operators on MechConnect. Be warm, helpful, and practical. Do not go off-topic.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", response.status, err);
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const text =
      data?.content
        ?.find((b: { type: string }) => b.type === "text")
        ?.text?.trim() || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
