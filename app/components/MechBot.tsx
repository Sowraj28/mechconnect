"use client";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  Minimize2,
  Wrench,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

const SUGGESTION_MAP: Record<string, string[]> = {
  // Sewage / Septic
  blocked: [
    "How urgent is it?",
    "What machine clears blocks?",
    "Estimated cost?",
  ],
  septic: ["How often to clean?", "Which truck size?", "Signs it's full?"],
  drain: ["Jetting or suction?", "How long does it take?", "Cost estimate?"],
  vacuum: ["What capacity do I need?", "How to book?", "Is it for household?"],
  manhole: [
    "How deep is the manhole?",
    "Need safety equipment?",
    "Cost to clean?",
  ],
  sewer: [
    "Blocked or overflow?",
    "Need jetting machine?",
    "How to find operator?",
  ],
  suction: [
    "Suction tanker capacity?",
    "How long does it take?",
    "Residential or commercial?",
  ],

  // Water Tanker
  water: [
    "What capacity tanker?",
    "For construction or drinking?",
    "Daily or one-time supply?",
  ],
  tanker: [
    "Water or sewage tanker?",
    "What capacity needed?",
    "How to book a tanker?",
  ],
  drinking: [
    "Is it potable water?",
    "What capacity needed?",
    "How far is the delivery?",
  ],

  // Iron / Steel / Cargo Carriers
  iron: [
    "How many tonnes to carry?",
    "What distance to transport?",
    "Open or closed carrier?",
  ],
  steel: [
    "Flat bed or enclosed truck?",
    "What weight to transport?",
    "Any special handling?",
  ],
  cargo: ["What type of cargo?", "How many tonnes?", "Need loading equipment?"],
  carrier: [
    "What are you transporting?",
    "How many tonnes?",
    "Local or long distance?",
  ],
  material: [
    "Construction material?",
    "How many trips needed?",
    "Need crane or loader?",
  ],

  // Crane / Heavy Lifting
  crane: [
    "What weight to lift?",
    "Mobile or tower crane?",
    "How many hours needed?",
  ],
  lift: ["What needs to be lifted?", "How high?", "Indoor or outdoor?"],
  hoist: [
    "What weight?",
    "Fixed or mobile hoist?",
    "Construction or industrial?",
  ],

  // Tipper / Dumper
  tipper: ["What material to dump?", "How many loads?", "What distance?"],
  dumper: [
    "Sand, gravel or debris?",
    "How many trips?",
    "Tipper capacity needed?",
  ],
  sand: [
    "How many tonnes of sand?",
    "Delivery location?",
    "One-time or regular supply?",
  ],
  gravel: [
    "How many tonnes?",
    "Crushed stone or natural?",
    "Need delivery or pickup?",
  ],
  debris: [
    "Construction or demolition debris?",
    "How many loads?",
    "Need dumper or tipper?",
  ],

  // JCB / Excavator / Earth Moving
  jcb: [
    "Excavation or loading work?",
    "How many hours needed?",
    "What's the site size?",
  ],
  excavat: [
    "Depth of excavation?",
    "Soil type — soft or rocky?",
    "How many days needed?",
  ],
  bulldozer: [
    "Land clearing or levelling?",
    "Site area in acres?",
    "Any trees or structures?",
  ],
  earthmov: ["What earth moving job?", "Site size?", "How many days?"],

  // Transit Mixer / Concrete
  mixer: [
    "Ready-mix concrete?",
    "How many cubic metres?",
    "What grade of concrete?",
  ],
  concrete: [
    "Ready-mix or site-mix?",
    "How many cubic metres?",
    "Column, slab or foundation?",
  ],
  cement: ["Bulk cement or bags?", "How many tonnes?", "Need transit mixer?"],

  // Trucks / Logistics
  truck: [
    "What are you transporting?",
    "How many tonnes?",
    "Local or inter-city?",
  ],
  lorry: ["What type of goods?", "Distance?", "Need open or closed lorry?"],
  transport: [
    "What needs transporting?",
    "Weight estimate?",
    "Any special vehicle needed?",
  ],

  // Roller / Compactor
  roller: [
    "Road work or soil compaction?",
    "Area in square metres?",
    "How many passes needed?",
  ],
  compact: ["Soil or asphalt?", "Site area?", "How many days?"],

  // Cost / Booking
  cost: ["What affects pricing?", "Is there a fixed rate?", "Any packages?"],
  price: [
    "What type of vehicle?",
    "How many hours or trips?",
    "Any negotiation possible?",
  ],
  rent: ["What vehicle to rent?", "How many days?", "Operator included?"],
  hire: [
    "What vehicle to hire?",
    "Duration needed?",
    "Local operators available?",
  ],
  book: [
    "Which service to book?",
    "When do you need it?",
    "How to find operators?",
  ],

  default: [
    "Book a water tanker 🚛",
    "Septic tank cleaning 🪣",
    "Hire a crane 🏗️",
    "Transport iron/steel 🔩",
    "Tipper / dumper truck 🚜",
    "JCB / excavator 🦺",
  ],
};

function getSuggestions(text: string): string[] {
  const lower = text.toLowerCase();
  for (const [key, suggestions] of Object.entries(SUGGESTION_MAP)) {
    if (key !== "default" && lower.includes(key)) return suggestions;
  }
  return SUGGESTION_MAP.default;
}

const SYSTEM_CONTEXT = `You are MechBot, a friendly and knowledgeable AI assistant for MechConnect — India's platform for booking heavy vehicles and industrial services.

You help users find the right vehicle or service for their needs. Keep replies concise (2-4 sentences or bullet points max).

Available services on MechConnect:
🚛 Water Tankers — drinking water supply, construction water supply
🪣 Sewage & Septic — Septic Tank Cleaning, Vacuum Tanker, Jetting Machine, Suction-cum-Jetting, Manhole Cleaning, Sewage Drain Cleaning
🔩 Iron & Steel Carriers — flat bed trucks, open carriers for metal/steel/iron transport
🏗️ Cranes & Lifting — mobile cranes, tower cranes, hoists for construction and industry
🚜 Tippers & Dumpers — sand, gravel, debris, construction material transport
🦺 Earth Moving — JCB, Excavators, Bulldozers, Earth Movers for site work
🔄 Transit Mixers — ready-mix concrete delivery
🚚 Trucks & Lorries — general cargo, logistics, inter-city transport
🛞 Compactors & Rollers — road work, soil compaction

Always suggest users find verified operators on MechConnect. Be warm, helpful, and practical. If unsure, ask a clarifying question. Do not go off-topic from vehicle or machinery services.`;

const MODELS_TO_TRY = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

async function callGemini(
  apiKey: string,
  contents: { role: string; parts: { text: string }[] }[],
): Promise<string> {
  let lastError = "";

  for (const model of MODELS_TO_TRY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_CONTEXT }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 350,
            topP: 0.9,
          },
        }),
      },
    );

    if (res.status === 404) {
      lastError = `${model}: not found`;
      continue;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData?.error?.message || JSON.stringify(errData);
      lastError = `${model}: HTTP ${res.status} — ${errMsg}`;
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        throw new Error(lastError);
      }
      continue;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) return text;
    throw new Error(`${model}: empty response from API`);
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}

export default function MechBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Hi! I'm **MechBot**, your MechConnect assistant!\n\nI can help you book or find:\n• 🚛 Water Tankers & Sewage Services\n• 🔩 Iron / Steel Carriers\n• 🏗️ Cranes & Heavy Lifting\n• 🚜 Tippers, Dumpers & JCB\n• 🚚 Trucks, Lorries & more\n\nWhat vehicle or service do you need today?",
      timestamp: new Date(),
      suggestions: [
        "Book a water tanker 🚛",
        "Septic tank cleaning 🪣",
        "Hire a crane 🏗️",
        "Transport iron/steel 🔩",
        "Tipper / dumper truck 🚜",
        "JCB / excavator 🦺",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      setKeyStatus({
        ok: false,
        msg: "❌ No key — add NEXT_PUBLIC_GEMINI_API_KEY to .env and restart server",
      });
    } else {
      setKeyStatus({ ok: true, msg: `✅ Key found: ${key.slice(0, 10)}...` });
    }
  }, []);

  useEffect(() => {
    if (open && !minimized)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, minimized]);

  const buildContents = (msgs: Message[], newUserText: string) => {
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of msgs.slice(1)) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
    contents.push({ role: "user", parts: [{ text: newUserText }] });
    return contents;
  };

  async function sendMessage(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText, timestamp: new Date() },
    ]);
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "NEXT_PUBLIC_GEMINI_API_KEY is missing from .env — restart dev server after adding it",
        );

      const botText = await callGemini(
        apiKey,
        buildContents(messages, userText),
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: botText,
          timestamp: new Date(),
          suggestions: getSuggestions(botText + " " + userText),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("MechBot error:", msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `⚠️ ${msg}`,
          timestamp: new Date(),
          suggestions: ["Try again", "What services exist?", "How to book?"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
      );
      const isBullet =
        line.trim().startsWith("•") ||
        line.trim().startsWith("- ") ||
        /^\* /.test(line.trim());
      return (
        <span
          key={i}
          className={`block ${isBullet ? "pl-1" : ""} ${
            i > 0 && line.trim() ? "mt-1" : ""
          }`}
        >
          {rendered}
        </span>
      );
    });
  }

  const lastBotMsg = [...messages].reverse().find((m) => m.role === "bot");

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          open
            ? "scale-0 opacity-0 pointer-events-none"
            : "scale-100 opacity-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #3b0764 100%)",
        }}
        aria-label="Open MechBot"
      >
        <Bot className="w-7 h-7 text-white" />
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ background: "#7c3aed" }}
        />
        <span className="absolute right-16 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Ask MechBot 🤖
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 origin-bottom-right ${
          open
            ? "scale-100 opacity-100"
            : "scale-75 opacity-0 pointer-events-none"
        }`}
        style={{ width: "370px" }}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-purple-100 bg-white">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #3b0764 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  MechBot
                  <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                </div>
                <div className="text-purple-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                  Online · MechConnect Assistant
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Key status bar */}
              {keyStatus && (
                <div
                  className={`px-3 py-1.5 text-xs font-mono truncate ${
                    keyStatus.ok
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {keyStatus.msg}
                </div>
              )}

              {/* Messages */}
              <div
                className="overflow-y-auto p-3 space-y-3 bg-gray-50"
                style={{ height: "300px" }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {msg.role === "bot" && (
                      <div
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                        style={{
                          background:
                            "linear-gradient(135deg, #7c3aed, #3b0764)",
                        }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #7c3aed, #5b21b6)",
                            }
                          : {}
                      }
                    >
                      {renderText(msg.text)}
                      <div
                        className={`text-xs mt-1.5 ${
                          msg.role === "user"
                            ? "text-purple-200"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading dots */}
                {loading && (
                  <div className="flex justify-start gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #3b0764)",
                      }}
                    >
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply chips */}
              {!loading &&
                lastBotMsg?.suggestions &&
                lastBotMsg.suggestions.length > 0 && (
                  <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1.5">
                      Quick replies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lastBotMsg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="text-xs bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-full transition-all font-medium whitespace-nowrap"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask about any vehicle or service..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #3b0764)",
                    }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1.5">
                  Powered by Gemini AI · MechConnect
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
