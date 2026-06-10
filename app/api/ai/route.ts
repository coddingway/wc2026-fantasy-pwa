import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Grove Street AI Advisor — real Claude-powered fantasy analysis.
// Key stays server-side. Soft per-IP rate limit (cost protection, equal for all).

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_PER_WINDOW;
}

const SYSTEM = `You are the Grove Street FC fantasy advisor for FIFA World Cup 2026 Fantasy.
Scoring: GK/DEF clean sheet +5 (60+ min), DEF goal +7, MID goal +6, FWD goal +5, GK goal +9,
assist +3, captain doubles points, extra transfers -3pts each.
Country limits: group stage max 3/nation, rising each knockout round (4,5,6,8).
Transfer windows: MD2 +2 free, MD3 +2 free, R32 unlimited +$5M budget, R16 +4, QF +4, SF +5, Final +6.
Boosters (once each): Wildcard (best at R32), 12th Man, Max Captain, Qualification Booster (+2/advancing starter), Mystery.
Be concise and specific: name players, prices, and exact reasoning. Use short sections. A little Grove Street / GTA San Andreas flavor is welcome but keep the analysis sharp.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ configured: false, advice: null });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { configured: true, error: "Rate limit: 10 AI analyses per hour. Try again soon, homie." },
      { status: 429 }
    );
  }

  try {
    const { squad, question } = await req.json();
    const squadText = Array.isArray(squad)
      ? squad.map((p: any) =>
          `${p.knownName || p.lastName} (${p.nation}, ${p.position}, $${p.price}M${p.isCaptain ? ", CAPTAIN" : ""}${p.isViceCaptain ? ", VC" : ""}${p.isStarting ? "" : ", bench"})`
        ).join("\n")
      : "No squad provided";

    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{
        role: "user",
        content: `My current 15-man squad:\n${squadText}\n\nMy question: ${question || "Analyze my squad and suggest improvements for the next round."}`,
      }],
    });

    const advice = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({ configured: true, advice });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    const friendly = msg.includes("credit balance")
      ? "The AI account needs credits — top up at console.anthropic.com → Plans & Billing."
      : `AI request failed: ${msg.slice(0, 160)}`;
    return NextResponse.json({ configured: true, error: friendly }, { status: 500 });
  }
}
