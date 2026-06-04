"use client";
import { useState } from "react";
import { BookOpen, Trophy, CheckCircle } from "lucide-react";

const LESSONS = [
  {
    id: 1, icon: "🎯", title: "How to Pick a Captain",
    content: "Your captain scores DOUBLE points. Always pick someone with: 1) Easy fixture 2) Penalty duty 3) Good recent form. Kane (ENG) vs Panama/Ghana = near-certain goals. Bruno Fernandes vs DR Congo/Uzbekistan = assists & set pieces.",
    quiz: { q: "Who should you captain vs an easy opponent?", options: ["Bench GK","Star FWD/MID with penalty duty","Budget DEF","Random pick"], correct: 1 }
  },
  {
    id: 2, icon: "📊", title: "Understanding the Scoring System",
    content: "GK/DEF Clean Sheet = +5 pts (HUGE!). DEF Goal = +7. MID Goal = +6. FWD Goal = +5. Assist = +3. Captain doubles all points. Stack defenders from nations likely to keep clean sheets (Belgium vs Iran = easy CS!).",
    quiz: { q: "Which scores more points per goal?", options: ["FWD (+5)","MID (+6)","DEF (+7)","GK (+9)"], correct: 3 }
  },
  {
    id: 3, icon: "🔄", title: "Transfer Strategy",
    content: "Free transfers per window: MD2=2, MD3=2, R32=Unlimited (+$5M boost!). Extra transfers cost -3 pts each. NEVER waste your Wildcard early. Save it for Round of 32 when you know which nations survived.",
    quiz: { q: "When is the best time to use Wildcard?", options: ["MD1","MD2","Round of 32","The Final"], correct: 2 }
  },
  {
    id: 4, icon: "💰", title: "Budget Management",
    content: "Budget = $100M for 15 players. Spend big on 3-4 premiums (Kane $10.5M, Yamal $10M). Use value DEFs for clean sheets (Kimmich $5.5M = assists + CSs). Cheap bench = budget for starting XI.",
    quiz: { q: "Best budget strategy is?", options: ["Spread evenly","Premium attack + value DEF","All on bench","Save everything"], correct: 1 }
  },
  {
    id: 5, icon: "🌍", title: "Nation Diversity Strategy",
    content: "Max 3 players per country in group stage. Pick 1-2 from each strong nation. 15 players from 15 different nations = maximum exposure. If one nation exits, minimal damage. Our squad: 15 players = 15 nations!",
    quiz: { q: "Why pick players from many nations?", options: ["Rule requirement","Diversity reduces risk","Better prices","More clean sheets"], correct: 1 }
  },
];

export default function EducationPage() {
  const [current, setCurrent] = useState<number | null>(null);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState<number[]>([]);

  const lesson = current !== null ? LESSONS[current] : null;

  const answer = (lessonId: number, idx: number) => {
    setAnswered(prev => ({ ...prev, [lessonId]: idx }));
    if (idx === LESSONS[lessonId - 1].quiz.correct) {
      setCompleted(prev => prev.includes(lessonId) ? prev : [...prev, lessonId]);
    }
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4">
        <BookOpen size={24} className="text-green-200 mb-2" />
        <p className="text-white font-bold text-lg">Fantasy Football School</p>
        <p className="text-white/80 text-sm">{completed.length}/{LESSONS.length} lessons completed</p>
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(completed.length / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      {!lesson ? (
        <div className="space-y-3">
          {LESSONS.map((l, i) => (
            <button key={l.id} onClick={() => setCurrent(i)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${completed.includes(l.id) ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-800 bg-slate-900"}`}>
              <span className="text-3xl">{l.icon}</span>
              <div className="flex-1">
                <p className="text-white font-semibold">{l.title}</p>
                <p className="text-slate-400 text-xs">Lesson {l.id} of {LESSONS.length}</p>
              </div>
              {completed.includes(l.id) ? <CheckCircle size={20} className="text-emerald-400" /> : <span className="text-slate-600">→</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setCurrent(null)} className="text-emerald-400 text-sm font-semibold">← Back to Lessons</button>
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-3xl mb-2">{lesson.icon}</p>
            <p className="text-white font-bold text-lg mb-3">{lesson.title}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{lesson.content}</p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-yellow-400 font-semibold text-sm mb-3">Quick Quiz</p>
            <p className="text-white text-sm mb-3">{lesson.quiz.q}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const userAns = answered[lesson.id];
                const isCorrect = i === lesson.quiz.correct;
                const isSelected = userAns === i;
                return (
                  <button key={i} onClick={() => answer(lesson.id, i)} disabled={userAns !== undefined}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                      userAns === undefined ? "bg-slate-800 hover:bg-slate-700 text-white" :
                      isCorrect ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" :
                      isSelected ? "bg-red-500/20 border border-red-500 text-red-400" :
                      "bg-slate-800 text-slate-500"}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered[lesson.id] !== undefined && (
              <p className={`mt-2 text-sm font-semibold ${answered[lesson.id] === lesson.quiz.correct ? "text-emerald-400" : "text-red-400"}`}>
                {answered[lesson.id] === lesson.quiz.correct ? "✅ Correct! Grove Street knows!" : `❌ Correct answer: ${lesson.quiz.options[lesson.quiz.correct]}`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {current !== null && current > 0 && <button onClick={() => setCurrent((current ?? 0) - 1)} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-semibold">← Previous</button>}
            {current !== null && current < LESSONS.length - 1 && <button onClick={() => setCurrent((current ?? 0) + 1)} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold">Next →</button>}
          </div>
        </div>
      )}
    </div>
  );
}
