'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Trophy, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const weeklyProgress = 75; // percentage
const records = [
  { title: 'Max Bench', value: '90 kg', icon: Dumbbell },
  { title: 'Longest Run', value: '8 km', icon: Activity },
  { title: 'Best Streak', value: '14 days', icon: Trophy },
  { title: 'Total Hours', value: '25 hrs', icon: Clock },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90">
        <circle
          className="text-muted/20"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="72"
          cy="72"
        />
        <motion.circle
          className="text-primary from-purple-500 to-pink-500 bg-gradient-to-r"
          stroke="url(#gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="72"
          cy="72"
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9b5de5" />
              <stop offset="100%" stopColor="#f15bb5" />
            </linearGradient>
        </defs>
      </svg>
      <motion.span
        className="text-3xl font-bold text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {progress}%
      </motion.span>
    </div>
  );
};


export default function ProgressPage() {
  return (
    <div className="min-h-full w-full bg-gradient-to-br from-[#0e0e0e] to-[#1a1a1a] p-4 sm:p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-5xl space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Weekly Progress Section */}
        <motion.section variants={itemVariants}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
            Weekly Progress
          </h2>
          <Card className="rounded-2xl border-white/10 bg-[#1a1a1a] shadow-2xl shadow-black/30">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="order-2 sm:order-1">
                <p className="text-4xl font-bold text-foreground">5/7 Days Active</p>
                <p className="mt-2 text-muted-foreground">
                  You've crushed it this week! Keep the momentum going.
                </p>
              </div>
              <div className="order-1 mb-6 sm:order-2 sm:mb-0">
                <ProgressRing progress={weeklyProgress} />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Personal Records Section */}
        <motion.section variants={itemVariants}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
            Personal Records
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {records.map((record, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="h-full rounded-2xl border-white/10 bg-[#1a1a1a] shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-primary/20">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <record.icon className="mb-4 h-8 w-8 text-primary bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500" />
                    <p className="text-xl font-semibold text-foreground">
                      {record.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{record.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
