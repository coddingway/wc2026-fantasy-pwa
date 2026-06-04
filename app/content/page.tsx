"use client";
import { useFantasyStore } from "@/lib/store";
import { Share2, Download, Camera, FileText } from "lucide-react";

export default function ContentPage() {
  const { squad, totalPoints, teamName } = useFantasyStore();
  const nations = new Set(squad.map(p => p.nation)).size;
  const totalCost = squad.reduce((s, p) => s + p.price, 0);
  const captain = squad.find(p => p.isCaptain);

  const shareText = `🌍 My #WC2026 Fantasy Squad — "${teamName}"
⚽ ${nations} nations | 💰 $${totalCost.toFixed(1)}M | 🏆 ${totalPoints} pts
© Captain: ${captain?.flag} ${captain?.knownName || captain?.lastName}
Built with Grove Street FC PWA 🟢
#FIFAWorldCup2026 #Fantasy`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-4">
        <Camera size={24} className="text-cyan-200 mb-2" />
        <p className="text-white font-bold text-lg">Content Creator</p>
        <p className="text-white/80 text-sm">Share your squad, create cards, export data</p>
      </div>

      {/* Squad Share Card Preview */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-5 border border-emerald-500/30">
        <div className="text-center mb-4">
          <p className="text-emerald-400 text-xs font-bold">GROVE STREET FC</p>
          <p className="text-white text-xl font-black">{teamName}</p>
          <p className="text-slate-400 text-xs">FIFA World Cup 2026 Fantasy</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-black/30 rounded-xl p-2">
            <p className="text-emerald-400 font-black text-lg">{totalPoints}</p>
            <p className="text-slate-400 text-[10px]">Points</p>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-2">
            <p className="text-blue-400 font-black text-lg">{nations}</p>
            <p className="text-slate-400 text-[10px]">Nations</p>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-2">
            <p className="text-purple-400 font-black text-lg">${totalCost.toFixed(0)}M</p>
            <p className="text-slate-400 text-[10px]">Budget</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 justify-center mb-3">
          {squad.map(p => <span key={p.id} title={p.knownName || p.lastName}>{p.flag}</span>)}
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">© Captain: {captain?.flag} {captain?.knownName || captain?.lastName}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => copyToClipboard(shareText)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
          <Share2 size={16} /> Share Text
        </button>
        <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all">
          <Download size={16} /> Save Card
        </button>
      </div>

      {/* Share Templates */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Share Templates</p>
        {[
          { label: "WhatsApp", icon: "💬", text: `My WC2026 Fantasy squad is ready! ${nations} nations, $${totalCost.toFixed(1)}M budget. Captain: ${captain?.knownName}. Let's go! 🏆` },
          { label: "Twitter/X", icon: "🐦", text: shareText },
          { label: "Instagram Story", icon: "📸", text: `WC2026 Fantasy 🌍\n${squad.filter(p=>p.isStarting).map(p=>p.flag).join("")}\n${teamName} | ${nations} nations` },
        ].map(t => (
          <div key={t.label} className="mb-3 p-3 bg-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">{t.icon} {t.label}</p>
              <button onClick={() => copyToClipboard(t.text)} className="text-emerald-400 text-xs font-bold">Copy</button>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{t.text.slice(0, 100)}...</p>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-purple-400" />
          <p className="text-white font-semibold">Weekly Newsletter</p>
        </div>
        <p className="text-slate-400 text-sm mb-3">Auto-generate your weekly squad briefing</p>
        <div className="bg-slate-800 rounded-xl p-3 text-sm text-slate-300 leading-relaxed">
          <p className="font-bold text-white mb-1">📰 {teamName} — Week 1 Briefing</p>
          <p>Your squad of {squad.length} players from {nations} nations is ready for the World Cup. Captain {captain?.knownName} leads the charge. Budget perfectly spent at ${totalCost.toFixed(1)}M. 5 boosters in reserve including the Wildcard for Round of 32. Stay tuned for transfer recommendations each window. Grove Street FC — always ready. 🟢</p>
        </div>
        <button className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-sm transition-all">
          📧 Export Newsletter
        </button>
      </div>
    </div>
  );
}
