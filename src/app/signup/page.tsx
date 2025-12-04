'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { Textarea } from '@/components/ui/textarea';
import { GoogleIcon } from '@/components/icons/google';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }).optional(),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  city: z.string().min(1, { message: "City is required for matching." }),
  gymAddress: z.string().optional(),
  weight: z.coerce.number().min(0, { message: "Weight must be a positive number."}).optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      fitnessLevel: 'Beginner',
      bio: '',
      city: '',
      gymAddress: '',
      weight: '' as any,
      gender: 'Prefer not to say',
    },
  });

  useEffect(() => {
    if (searchParams.get('isGoogleSignUp')) {
      setIsGoogleSignUp(true);
      form.setValue('name', searchParams.get('name') || '');
      form.setValue('email', searchParams.get('email') || '');
      // Make password optional for Google sign-ups
      form.clearErrors('password');
    }
  }, [searchParams, form]);


  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      let user;
      // If it's a google sign up, the user is already "signed in"
      // we just need to create their full profile in firestore
      if (isGoogleSignUp) {
        if (!auth.currentUser) throw new Error("Google user not authenticated.");
        user = auth.currentUser;
      } else {
         if (!data.password) {
            toast({ variant: 'destructive', title: 'Password is required' });
            setIsLoading(false);
            return;
         }
         const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        user = userCredential.user;
        await updateProfile(user, {
            displayName: data.name,
        });
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      
      const photoURL = isGoogleSignUp ? searchParams.get('photoURL') : '';
      
      // In a real app, you'd geocode the address. For now, we use a placeholder.
      const placeholderCoords = data.gymAddress ? { latitude: 34.0522, longitude: -118.2437 } : null;

      await setDoc(userDocRef, {
        uid: user.uid,
        name: data.name,
        email: data.email,
        photoURL: photoURL,
        fitnessLevel: data.fitnessLevel,
        bio: data.bio || '',
        city: data.city,
        gymAddress: data.gymAddress || '',
        gymCoordinates: placeholderCoords,
        weight: data.weight || null,
        gender: data.gender || null,
        createdAt: serverTimestamp(),
      });

      await user.reload();
      router.push('/dashboard');
    } catch (error) {
       let description = 'An unexpected error occurred. Please try again.';
       if (error instanceof FirebaseError) {
         if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use. Please login or use a different email.';
         }
       }
        console.error('Signup error', error);
        toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12">
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {isGoogleSignUp ? "Complete Your Profile" : "Create an Account"}
          </CardTitle>
          <CardDescription>
            {isGoogleSignUp ? "Just a few more details and you're all set!" : "Enter your information to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex" {...field} readOnly={isGoogleSignUp}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                        readOnly={isGoogleSignUp}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isGoogleSignUp && (
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
               <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little about your fitness journey..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. Los Angeles" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="gymAddress"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gym Address</FormLabel>
                        <FormControl>
                        <Input placeholder="Optional: 123 Fitness St." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="70" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="fitnessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
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
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGoogleSignUp ? "Complete Profile" : "Create Account"}
              </Button>
            </form>
          </Form>
           {!isGoogleSignUp && (
             <>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/login')}
                    disabled={true}
                    >
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Google
                </Button>
             </>
           )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
