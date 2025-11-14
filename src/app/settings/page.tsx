'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useUser, useAuth, useFirebaseApp, useFirestore } from "@/firebase"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateProfile } from "firebase/auth"
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Dumbbell, Heart, Camera, BarChart3, Trophy, Flame, MapPin } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
    fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function EditProfileForm() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            bio: '',
            fitnessLevel: 'Beginner',
        }
    });

    useEffect(() => {
        if(user && firestore) {
            form.reset({
                name: user.displayName || '',
                bio: '', 
                fitnessLevel: 'Beginner', 
            });
        }
    }, [user, firestore, form]);


    const onSubmit = async (data: ProfileFormValues) => {
        if (!user || !auth.currentUser) return;
        setIsSubmitting(true);
        try {
            if (data.name !== user.displayName) {
                await updateProfile(auth.currentUser, { displayName: data.name });
            }
            
            const userDocRef = doc(firestore, 'users', user.uid);
            updateDocumentNonBlocking(userDocRef, {
                name: data.name,
                bio: data.bio,
                fitnessLevel: data.fitnessLevel,
            });

            toast({
                title: "Profile Updated ✅",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "There was a problem updating your profile.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSetGymLocation = () => {
        if (!user || !firestore) return;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const userDocRef = doc(firestore, 'users', user.uid);
                await updateDoc(userDocRef, { gymLocation: { latitude, longitude } });
                toast({ title: "✅ Gym location saved successfully." });
            }, (error) => {
                 toast({
                    variant: 'destructive',
                    title: "⚠️ Location Error",
                    description: error.code === error.PERMISSION_DENIED
                        ? "Location permission denied. Please enable it in your browser settings."
                        : "Could not get your location."
                });
            });
        } else {
            toast({ variant: 'destructive', title: "Geolocation is not supported by this browser." });
        }
    };


    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-muted-foreground"><User size={14}/> Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} className="bg-muted/40 border-border/30 focus:bg-background/60 transition-all"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                 <FormLabel className="flex items-center gap-2 text-muted-foreground"><Heart size={14}/> Bio</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell everyone a little about your fitness journey..." {...field} className="bg-muted/40 border-border/30 focus:bg-background/60 transition-all"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fitnessLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-muted-foreground"><Dumbbell size={14}/> Fitness Level</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="bg-muted/40 border-border/30 focus:bg-background/60 transition-all">
                                        <SelectValue placeholder="Select your fitness level" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground"><MapPin size={14}/> Gym Location</Label>
                        <Button type="button" variant="outline" onClick={handleSetGymLocation} className="w-full bg-muted/40 border-border/30 hover:bg-muted/80">
                           Set Gym Location
                        </Button>
                     </div>

                    <div>
                        <Button type="submit" disabled={isSubmitting || isUserLoading} className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold shadow-md transition-all hover:shadow-primary/40 animate-pulse-slow hover:animate-none">
                            {(isSubmitting || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    )
}

const statCards = [
  { label: 'Workouts', value: '78', icon: Dumbbell },
  { label: 'Streak', value: '12 days', icon: Flame },
  { label: 'Level', value: '4', icon: BarChart3 },
];

export default function SettingsPage() {
    const { user } = useUser();
    const auth = useAuth();
    const app = useFirebaseApp();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !auth.currentUser) return;
        
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please select a valid image file (.jpg, .png).",
          });
          return;
        }

        setIsUploading(true);
        const storage = getStorage(app);
        
        try {
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Update the user's profile in Firebase Authentication
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
            
            // Also update the user's document in Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL: downloadURL });

            // Reload the user to get the latest profile info, which will trigger the UI to update
            await auth.currentUser.reload();
            
            toast({
                title: 'Avatar Updated',
                description: 'Your new profile picture looks great!',
            });
        } catch (error) {
            console.error("Error uploading avatar:", error);
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
        <div className="space-y-6">
            <Card className="overflow-visible border-none bg-transparent shadow-none">
                <CardContent className="p-0">
                    <div className="relative h-40 md:h-56 w-full rounded-lg">
                        <Image
                            src="https://picsum.photos/seed/cover/1200/400"
                            alt="Cover image"
                            className="object-cover rounded-lg"
                            fill
                            data-ai-hint="fitness gym"
                        />
                         <div className="absolute top-2 right-2">
                            <Button variant="secondary" size="sm" className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm">
                                <Camera className="mr-2 h-4 w-4" /> Change Cover
                            </Button>
                        </div>
                    </div>
                    
                    <div className="relative px-4 md:px-6 -mt-16">
                        <div className="flex flex-col md:flex-row md:items-end">
                            <div className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0 group">
                                <Avatar className="h-full w-full border-4 border-background">
                                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200`} alt="User avatar" />
                                    <AvatarFallback><User size={40}/></AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full border-2 border-primary/80 animate-pulse-slow"></div>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={handleAvatarClick}
                                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                </Button>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleFileChange}
                                />
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-6">
                                <h1 className="text-2xl md:text-3xl font-bold">{user?.displayName || 'Alex'}</h1>
                                <p className="text-muted-foreground">Beginner | "Fitness is a journey, not a destination."</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                           {statCards.map(stat => (
                             <Card key={stat.label} className="bg-muted/40 border-border/30 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <stat.icon className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                           ))}
                            <Card className="bg-muted/40 border-border/30 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Trophy className="h-6 w-6 text-yellow-400" />
                                    <div>
                                        <p className="text-xl font-bold">12</p>
                                        <p className="text-xs text-muted-foreground">Achievements</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="workouts" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-4 bg-muted/60">
                    <TabsTrigger value="workouts">Workouts</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="workouts">
                    <Card className="bg-card/80 border-border/40">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Workout history will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="progress">
                     <Card className="bg-card/80 border-border/40">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Progress charts and stats will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="achievements">
                     <Card className="bg-card/80 border-border/40">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Unlocked achievements and badges will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="edit">
                    <EditProfileForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
