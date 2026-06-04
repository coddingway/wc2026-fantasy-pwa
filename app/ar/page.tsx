"use client";
import Link from "next/link";
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-6xl mb-4">🚧</p>
      <p className="text-white text-xl font-bold">Coming Soon</p>
      <p className="text-slate-400 text-sm mt-2">This feature is under construction</p>
      <Link href="/" className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">← Back to Dashboard</Link>
    </div>
  );
}
