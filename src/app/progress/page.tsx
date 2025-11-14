
"use client";

import { BarChart, Dumbbell, Clock, TrendingUp } from "lucide-react";

export default function ProgressPage() {
  const prs = {
    bench: 90,
    squat: 140,
    deadlift: 160,
  };

  const volume = {
    weeklyVolume: 14800,
    changePercent: 6,
  };

  const consistency = {
    week: "4 / 6 days",
    month: "17 / 24 days",
  };

  return (
    <div className="w-full min-h-screen px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Progress</h1>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* PR CARD */}
        <div className="bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Personal Records</h2>
            <Dumbbell className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-2 text-neutral-300">
            <p><span className="text-white font-semibold">Bench:</span> {prs.bench} kg</p>
            <p><span className="text-white font-semibold">Squat:</span> {prs.squat} kg</p>
            <p><span className="text-white font-semibold">Deadlift:</span> {prs.deadlift} kg</p>
          </div>
        </div>

        {/* VOLUME CARD */}
        <div className="bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Weekly Volume</h2>
            <BarChart className="w-5 h-5 text-neutral-400" />
          </div>

          <p className="text-2xl font-bold">{volume.weeklyVolume.toLocaleString()} kg</p>
          <p className="text-green-400 text-sm mt-1">
            ▲ {volume.changePercent}% from last week
          </p>
        </div>

        {/* CONSISTENCY CARD */}
        <div className="bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Consistency</h2>
            <Clock className="w-5 h-5 text-neutral-400" />
          </div>

          <p className="text-neutral-300">
            <span className="text-white font-semibold">This Week:</span> {consistency.week}
          </p>
          <p className="text-neutral-300 mt-1">
            <span className="text-white font-semibold">This Month:</span> {consistency.month}
          </p>
        </div>

        {/* STRENGTH TREND CARD */}
        <div className="bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Strength Trend</h2>
            <TrendingUp className="w-5 h-5 text-neutral-400" />
          </div>

          <p className="text-neutral-400 text-sm">
            Track how your strength changes over time.
          </p>

          <div className="h-28 mt-4 bg-[#1a1a1a] rounded-xl border border-neutral-800 flex items-center justify-center text-neutral-500">
            {/* Placeholder for future chart */}
            Trend Graph Coming Soon
          </div>
        </div>

      </div>
    </div>
  );
}
