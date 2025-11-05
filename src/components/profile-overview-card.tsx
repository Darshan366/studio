
'use client';

import { useState, useRef } from 'react';
import { useUser, useFirebaseApp, useAuth } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Camera, Dumbbell, Flame, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';

const statCards = [
  { label: 'Workouts', value: '78', icon: Dumbbell },
  { label: 'Streak', value: '12 days', icon: Flame },
  { label: 'Level', value: '4', icon: CheckCircle },
];

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * The profile overview functionality has been integrated directly into the settings page.
 * Please use `src/app/settings/page.tsx` instead.
 */
export default function ProfileOverviewCard() {
  const { user } = useUser();
  const app = useFirebaseApp();
  const auth = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !auth.currentUser) return;

    setIsUploading(true);
    const storage = getStorage(app);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL });
      await auth.currentUser.reload();


      toast({
        title: 'Avatar Updated',
        description: 'Your new profile picture looks great!',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was a problem uploading your avatar.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="relative flex h-full flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 shadow-2xl border-purple-500/20">
        <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <CardContent className="relative z-10 flex flex-col items-center p-0 text-center">
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user?.photoURL || 'https://picsum.photos/seed/user-avatar/200/200'} alt="User avatar" />
                <AvatarFallback className="bg-muted">
                    {isUploading ? <Loader2 className="animate-spin" /> : <User size={48} />}
                </AvatarFallback>
                </Avatar>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleAvatarClick}
                    className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm transition-all group-hover:bg-black/70"
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">{user?.displayName || 'Alex'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="border-purple-500/50 bg-purple-500/10 text-purple-300">Level 4 Grinder</Badge>
                <Badge variant="secondary" className="border-orange-500/50 bg-orange-500/10 text-orange-300">🔥 20 Days</Badge>
            </div>
        </CardContent>
        <CardFooter className="relative z-10 grid w-full grid-cols-3 gap-2 p-0 text-center mt-6">
            {statCards.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-white/5 p-3 backdrop-blur-sm">
                <stat.icon className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1 text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            ))}
      </CardFooter>
    </Card>
  );
}

    