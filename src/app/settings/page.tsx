'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useUser, useAuth, useFirebaseApp, useFirestore } from "@/firebase"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useState, useRef, useEffect } from "react"
import { Loader2, User, Dumbbell, MapPin, Heart } from "lucide-react"
import { doc } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import ProfileOverviewCard from "@/components/profile-overview-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
    fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const app = useFirebaseApp();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.displayName || '',
            bio: '',
            fitnessLevel: 'Beginner',
        }
    });

    useEffect(() => {
        if(user && firestore) {
            // In a real app, you'd fetch the full profile from Firestore here.
            // For now, we'll reset with what we have and some placeholders.
            form.reset({
                name: user.displayName || '',
                bio: '', // This would be populated from the fetched profile
                fitnessLevel: 'Beginner', // This would also come from the profile
            });
        }
    }, [user, firestore, form]);


    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (data.name !== user.displayName) {
                await updateProfile(user, { displayName: data.name });
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and account settings.
        </p>
      </div>

       <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProfileOverviewCard />
        </div>

        <div className="md:col-span-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="border-border/40 bg-card/80 shadow-lg">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>
                        Update your public information and fitness details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting || isUserLoading} className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold shadow-md transition-all hover:shadow-primary/40 animate-pulse-slow hover:animate-none">
                            {(isSubmitting || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </Button>
                    </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
       </div>

        <Separator />
        
        {/* Placeholder for other settings */}
        <Card className="border-border/40 bg-card/80 shadow-lg">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize notifications and app appearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="workout-reminders" className="flex flex-col space-y-1">
                  <span>Workout Reminders</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Get reminders for your scheduled workouts.
                  </span>
                </Label>
                <Switch id="workout-reminders" defaultChecked />
              </div>
               <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="flex flex-col space-y-1">
                  <span>Theme</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Current theme is set to dark mode.
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground">Dark</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>Save Preferences</Button>
            </CardFooter>
          </Card>
    </div>
  )
}
