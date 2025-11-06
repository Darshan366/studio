
'use client';

import { Button } from "@/components/ui/button";
import { Users, Heart, Dumbbell, BarChart3, Calendar, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
       <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full bg-background"
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>
      {/* Header */}
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
             <Dumbbell className="h-6 w-6 text-primary" />
             <span className="font-bold">GymFlow</span>
          </Link>
          <nav className="flex items-center gap-4">
             <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
             </Button>
             <Button asChild>
                <Link href="/signup">Get Started</Link>
             </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="container px-4 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Badge variant="outline" className="mb-6 border-primary/50 bg-primary/10 text-primary">
                Find Your Perfect Gym Partner
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Connect, Train, &amp; Transform
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                GymFlow helps you find workout partners who match your goals, schedule, and fitness level. Stop training alone, start achieving more together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button size="lg" asChild>
                    <Link href="/signup">Sign Up for Free</Link>
                 </Button>
                 <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Login</Link>
                 </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-muted/20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Everything You Need in One App
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                From finding the right partner to tracking every part of your fitness journey.
              </p>
            </div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                { icon: Users, title: 'Smart Matching', desc: 'Our AI finds partners who match your goals, location, and schedule.' },
                { icon: Heart, title: 'Real-time Chat', desc: 'Connect instantly with matches to plan workouts and motivate each other.' },
                { icon: BarChart3, title: 'Progress Tracking', desc: 'Monitor your personal records, workout consistency, and gains over time.' },
                { icon: Calendar, title: 'Workout Scheduling', desc: 'Plan your weekly workouts and track your gym attendance automatically.' },
                { icon: Utensils, title: 'Meal Planner', desc: 'Organize your nutrition to perfectly complement your training regimen.' },
                { icon: Dumbbell, title: 'AI Suggestions', desc: 'Get AI-powered suggestions for alternative exercises based on your equipment.' },
              ].map((feature, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="h-full bg-card/50 hover:bg-card/90 transition-colors border-border/50 hover:border-primary/30">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                           <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              Ready to Find Your Flow?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of others who are already making connections and crushing their fitness goals. It's free to get started.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Start Your Journey Today</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            <p className="text-sm font-semibold">GymFlow</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GymFlow. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add Badge and Card components if they are not globally available.
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: any }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}


const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"


const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"
