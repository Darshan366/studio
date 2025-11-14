
"use client";

import { useState, useEffect } from "react";
import { BarChart, Dumbbell, Clock, TrendingUp, Edit, Loader2 } from "lucide-react";
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProgressData = {
  benchPR?: string;
  squatPR?: string;
  deadliftPR?: string;
  weeklyVolume?: string;
  weeklyChange?: string;
  consistencyWeek?: string;
  consistencyMonth?: string;
};

// A single, reusable component for the edit dialog for single-value cards
function EditMetricDialog({
  metricKey,
  label,
  currentValue,
  onSave,
}: {
  metricKey: keyof ProgressData;
  label: string;
  currentValue: string;
  onSave: (field: keyof ProgressData, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentValue);

  useEffect(() => {
    setInputValue(currentValue);
  }, [currentValue]);

  const handleSave = () => {
    onSave(metricKey, inputValue);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update {label}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor={metricKey} className="sr-only">
            {label}
          </Label>
          <Input
            id={metricKey}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter new ${label.toLowerCase()}`}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// A specific dialog component for editing all Personal Records
function EditPRsDialog({
  currentValues,
  onSave,
}: {
  currentValues: { bench: string; squat: string; deadlift: string };
  onSave: (newPRs: { bench: string; squat: string; deadlift: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [bench, setBench] = useState(currentValues.bench);
  const [squat, setSquat] = useState(currentValues.squat);
  const [deadlift, setDeadlift] = useState(currentValues.deadlift);

  useEffect(() => {
    setBench(currentValues.bench);
    setSquat(currentValues.squat);
    setDeadlift(currentValues.deadlift);
  }, [currentValues]);

  const handleSave = () => {
    onSave({ bench, squat, deadlift });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Personal Records</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="benchPR">Bench Press (kg)</Label>
            <Input id="benchPR" value={bench} onChange={(e) => setBench(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="squatPR">Squat (kg)</Label>
            <Input id="squatPR" value={squat} onChange={(e) => setSquat(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadliftPR">Deadlift (kg)</Label>
            <Input id="deadliftPR" value={deadlift} onChange={(e) => setDeadlift(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// A specific dialog component for editing Weekly Volume
function EditVolumeDialog({
  currentValues,
  onSave,
}: {
  currentValues: { volume: string; change: string };
  onSave: (newVolume: { volume: string; change: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(currentValues.volume);
  const [change, setChange] = useState(currentValues.change);

  useEffect(() => {
    setVolume(currentValues.volume);
    setChange(currentValues.change);
  }, [currentValues]);

  const handleSave = () => {
    onSave({ volume, change });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Weekly Volume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weeklyVolume">Weekly Volume (kg)</Label>
            <Input id="weeklyVolume" value={volume} onChange={(e) => setVolume(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weeklyChange">Weekly Change (%)</Label>
            <Input id="weeklyChange" value={change} onChange={(e) => setChange(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function ProgressPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [data, setData] = useState<ProgressData>({});
  const [isLoading, setIsLoading] = useState(true);

  const progressDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/progress/metrics`);
  }, [user, firestore]);

  useEffect(() => {
    if (!progressDocRef) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(progressDocRef, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as ProgressData);
      } else {
        // Set default data if document doesn't exist
        const defaultData = {
          benchPR: '90',
          squatPR: '140',
          deadliftPR: '160',
          weeklyVolume: '14800',
          weeklyChange: '6',
          consistencyWeek: '4 / 6',
          consistencyMonth: '17 / 24'
        };
        setData(defaultData);
        // Optionally, create the document with default data
        setDoc(progressDocRef, defaultData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to fetch progress data:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [progressDocRef]);

  const handleSaveMetric = async (field: keyof ProgressData, value: string) => {
    if (!progressDocRef) return;
    await setDoc(progressDocRef, { [field]: value }, { merge: true });
  };
  
  const handleSavePRs = async (newPRs: { bench: string; squat: string; deadlift: string }) => {
    if (!progressDocRef) return;
    await setDoc(progressDocRef, { 
      benchPR: newPRs.bench,
      squatPR: newPRs.squat,
      deadliftPR: newPRs.deadlift,
    }, { merge: true });
  };

  const handleSaveVolume = async (newVolume: { volume: string; change: string }) => {
    if (!progressDocRef) return;
    await setDoc(progressDocRef, {
      weeklyVolume: newVolume.volume,
      weeklyChange: newVolume.change,
    }, { merge: true });
  };


  if (isLoading) {
    return (
        <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Loading your progress...</p>
        </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* PR CARD */}
        <div className="relative bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Personal Records</h2>
            <Dumbbell className="w-5 h-5 text-neutral-400" />
          </div>
          <EditPRsDialog 
            currentValues={{
              bench: data.benchPR || '',
              squat: data.squatPR || '',
              deadlift: data.deadliftPR || '',
            }}
            onSave={handleSavePRs}
          />
          <div className="space-y-2 text-neutral-300">
             <p><span className="text-white font-semibold">Bench:</span> {data.benchPR || 'N/A'} kg</p>
             <p><span className="text-white font-semibold">Squat:</span> {data.squatPR || 'N/A'} kg</p>
             <p><span className="text-white font-semibold">Deadlift:</span> {data.deadliftPR || 'N/A'} kg</p>
          </div>
        </div>

        {/* VOLUME CARD */}
        <div className="relative bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
           <EditVolumeDialog
            currentValues={{
              volume: data.weeklyVolume || '',
              change: data.weeklyChange || '',
            }}
            onSave={handleSaveVolume}
          />
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Weekly Volume</h2>
            <BarChart className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold">{parseInt(data.weeklyVolume || '0').toLocaleString()} kg</p>
          <p className="text-green-400 text-sm mt-1">
             ▲ {data.weeklyChange || '0'}% from last week
          </p>
        </div>

        {/* CONSISTENCY CARD */}
        <div className="relative bg-[#111111] border border-neutral-800 p-5 rounded-2xl shadow-lg">
            <EditMetricDialog metricKey="consistencyWeek" label="Weekly Consistency" currentValue={data.consistencyWeek || ''} onSave={handleSaveMetric} />
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Consistency</h2>
            <Clock className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-neutral-300">
            <span className="text-white font-semibold">This Week:</span> {data.consistencyWeek || 'N/A'} days
          </p>
          <p className="text-neutral-300 mt-1">
            <span className="text-white font-semibold">This Month:</span> {data.consistencyMonth || 'N/A'} days
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
            Trend Graph Coming Soon
          </div>
        </div>

      </div>
    </div>
  );
}
