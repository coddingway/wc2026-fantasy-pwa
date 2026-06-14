"use client";
import Link from "next/link";
import { ArrowLeft, Code2, Server, Brain, Radio, Rocket, Layers } from "lucide-react";

const STACK = [
  {
    title: "Frontend", icon: Layers, color: "text-blue-400",
    items: [
      ["Next.js 16", "App Router + Turbopack — pages, routing, rendering"],
      ["React + TypeScript", "Type-safe UI components"],
      ["Tailwind CSS v4", "Styling, dark theme & dynamic nation colors"],
      ["Zustand", "App state — squad, points, settings (local + cloud)"],
      ["next-pwa", "Installable on home screen, works offline"],
      ["Recharts · Lucide · Radix", "Charts, icons & accessible UI"],
    ],
  },
  {
    title: "Backend", icon: Server, color: "text-emerald-400",
    items: [
      ["Next.js API Routes", "Serverless endpoints on Vercel"],
      ["Neon Postgres", "Cloud database — users, squads, leagues, match cache"],
      ["Phone + 4-digit PIN", "Custom auth, salted SHA-256 — no 3rd-party login"],
    ],
  },
  {
    title: "Intelligence", icon: Brain, color: "text-purple-400",
    items: [
      ["Anthropic Claude", "AI Coach — real squad analysis (claude-sonnet-4-6)"],
    ],
  },
  {
    title: "Live Data", icon: Radio, color: "text-red-400",
    items: [
      ["football-data.org", "Fixtures, live scores, results, top scorers"],
      ["TheSportsDB", "Goals, assists, cards & match timelines"],
    ],
  },
  {
    title: "Infrastructure", icon: Rocket, color: "text-orange-400",
    items: [
      ["Vercel", "Hosting + serverless compute + auto-deploy"],
      ["GitHub", "Source control — push = live in 60s"],
      ["Custom domain", "fantasy.amritpodder.dev with auto SSL"],
    ],
  },
];

export default function DeveloperPage() {
  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <Link href="/more" className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
        <ArrowLeft size={14} /> Back to More
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 rounded-2xl p-6 text-center">
        <Code2 size={32} className="text-emerald-300 mx-auto mb-2" />
        <p className="text-white font-black text-xl">Built by Amrit Podder</p>
        <p className="text-emerald-200 text-sm mt-1">WC2026 Fantasy Hub — Grove Street FC Edition</p>
        <p className="text-emerald-100/70 text-xs mt-3 leading-relaxed">
          From a single <span className="font-mono bg-black/30 px-1 rounded">players.json</span> to a
          full live platform — squad builder, AI coach, real-time scores, cloud save & crew leagues.
          One person, modern tools, a World Cup deadline.
        </p>
      </div>

      {/* Stack sections */}
      {STACK.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={section.color} />
              <p className="text-white font-semibold text-sm uppercase tracking-wide">{section.title}</p>
            </div>
            <div className="space-y-2">
              {section.items.map(([name, desc]) => (
                <div key={name} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{name}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Architecture one-liner */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-emerald-500/30">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-2">The Architecture</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Next.js + TypeScript + Tailwind on the front · Neon Postgres + serverless API routes on the back ·
          Claude AI for coaching · two live football feeds for data — all deployed on Vercel.
          Scales to zero between matches, spikes at kickoff. No servers to babysit.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[["100%", "Free"], ["0", "Servers"], ["1", "Builder"]].map(([n, l]) => (
          <div key={l} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-black text-xl">{n}</p>
            <p className="text-slate-400 text-xs">{l}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-slate-500 text-xs">Made with ⚽ &amp; ☕ for the crew</p>
        <p className="text-emerald-400 text-xs font-semibold mt-1">Grove Street for life 🟢</p>
      </div>
    </div>
  );
}
