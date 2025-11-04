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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useUser, useAuth, useFirebaseApp, useFirestore } from "@/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useState, useRef, useEffect } from "react"
import { Loader2, User } from "lucide-react"
import { doc } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const app = useFirebaseApp();
    const firestore = useFirestore();
    const storage = getStorage(app);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        values: {
            name: user?.displayName || '',
            email: user?.email || '',
            bio: '',
        },
    });

    useEffect(() => {
        if(user && firestore) {
            // You would typically fetch the user profile from Firestore here
            // to get fields like 'bio'. For now, we'll just reset form fields.
            form.reset({
                name: user.displayName || '',
                email: user.email || '',
                bio: '' // This would be populated from Firestore profile
            });
        }
    }, [user, firestore, form]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            await updateProfile(user, { photoURL });
            
            const userDocRef = doc(firestore, 'users', user.uid);
            updateDocumentNonBlocking(userDocRef, { photoURL });


            toast({
                title: "Avatar Updated",
                description: "Your new avatar has been saved.",
            });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "There was a problem uploading your avatar.",
            });
        } finally {
            setIsUploading(false);
        }
    };


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
                bio: data.bio
            });

            toast({
                title: "Profile Updated",
                description: "Your profile information has been saved.",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and app preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
                            <AvatarImage src={user?.photoURL || 'https://picsum.photos/seed/user-avatar/200/200'} alt="User avatar" />
                            <AvatarFallback>
                                {isUploading ? <Loader2 className="animate-spin" /> : <User />}
                            </AvatarFallback>
                        </Avatar>
                        {isUploading && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50"><Loader2 className="animate-spin text-white"/></div>}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">{user?.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Button type="button" size="sm" variant="outline" onClick={handleAvatarClick} disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Change Photo'}
                        </Button>
                        <Input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                    </div>
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register("name")} defaultValue={user?.displayName || ''} />
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" {...form.register("bio")} placeholder="Tell us a little about yourself."/>
                  {form.formState.errors.bio && <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} defaultValue={user?.email || ''} readOnly disabled />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting || isUserLoading}>
                    {(isSubmitting || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what you want to be notified about.
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
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-summary" className="flex flex-col space-y-1">
                  <span>Weekly Summary</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive a summary of your progress every week.
                  </span>
                </Label>
                <Switch id="weekly-summary" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="flex flex-col space-y-1">
                  <span>Theme</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Select your preferred color scheme.
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground">System</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
