'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Trophy, Clock, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const initialRecords = [
  { title: 'Max Bench', value: '90 kg', icon: 'Dumbbell' },
  { title: 'Longest Run', value: '8 km', icon: 'Activity' },
  { title: 'Best Streak', value: '14 days', icon: 'Trophy' },
  { title: 'Total Hours', value: '25 hrs', icon: 'Clock' },
];

const icons: { [key: string]: React.ElementType } = {
    Dumbbell,
    Activity,
    Trophy,
    Clock,
};

const weeklyProgress = 75; // percentage

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
          transition={{ duration: 1.5, ease: 'easeInOut' }}
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
  const [records, setRecords] = useState(initialRecords);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editingData, setEditingData] = useState({ title: '', value: '' });
  const { toast } = useToast();

  const handleEditClick = (index: number) => {
    setIsEditing(index);
    setEditingData({
      title: records[index].title,
      value: records[index].value,
    });
  };

  const handleSave = () => {
    if (isEditing === null) return;
    const updatedRecords = [...records];
    updatedRecords[isEditing] = { ...updatedRecords[isEditing], ...editingData };
    setRecords(updatedRecords);
    setIsEditing(null);
    toast({
      title: 'Record Updated',
      description: `Your record for "${editingData.title}" has been saved.`,
    });
  };

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
            {records.map((record, index) => {
              const Icon = icons[record.icon];
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="group relative"
                >
                  <Card className="h-full rounded-2xl border-white/10 bg-[#1a1a1a] shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-primary/20">
                    <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                      {Icon && <Icon className="mb-4 h-8 w-8 text-primary bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500" />}
                      <p className="text-xl font-semibold text-foreground">
                        {record.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{record.title}</p>
                    </CardContent>
                  </Card>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(index)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 text-white/70 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </motion.div>

       {/* Edit Dialog */}
       <Dialog open={isEditing !== null} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Personal Record</DialogTitle>
                <DialogDescription>Update the title and value for your personal record.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="record-title">Title</Label>
                    <Input 
                        id="record-title" 
                        value={editingData.title}
                        onChange={(e) => setEditingData({...editingData, title: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="record-value">Value</Label>
                    <Input 
                        id="record-value" 
                        value={editingData.value}
                        onChange={(e) => setEditingData({...editingData, value: e.target.value})}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsEditing(null)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>
    </div>
  );
}
