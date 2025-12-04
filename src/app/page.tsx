
'use client';

import { Button } from "@/components/ui/button";
import { Users, Heart, Star, Dumbbell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gym-dark text-gym-light-gray">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <Image 
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&h=1080"
          alt="Gym background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
          data-ai-hint="fitness gym"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gym-dark/90 to-gym-dark/60" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Find Your Perfect
            <span className="text-gym-green block">Gym Partner</span>
          </h1>
          <p className="text-xl md:text-2xl text-gym-muted mb-8 max-w-2xl mx-auto">
            Connect with like-minded fitness enthusiasts, share workout goals, and achieve more together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              className="gradient-btn px-8 py-6 rounded-xl text-white font-semibold text-lg shadow-gym-glow hover:scale-105 transition-transform duration-300"
            >
              <Link href="/signup">Sign Up Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="px-8 py-6 rounded-xl border-2 border-gym-green text-gym-green font-semibold text-lg hover:bg-gym-green hover:text-white transition-all duration-300 hover:scale-105"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gym-muted">
            <div className="flex items-center space-x-2">
              <Users className="text-gym-green" />
              <span>10K+ Active Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="text-gym-green" />
              <span>50K+ Connections</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="text-gym-green" />
              <span>4.9 Rating</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gym-green/5 via-transparent to-gym-green/10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-gym-green/20 text-gym-green rounded-full text-sm font-medium mb-6">
              WHY CHOOSE GYM GRINDERS
            </span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gym-muted bg-clip-text text-transparent">
              Everything You Need to
              <span className="block text-gym-green">Find Your Perfect Match</span>
            </h2>
            <p className="text-xl text-gym-muted max-w-3xl mx-auto leading-relaxed">
              Join thousands of fitness enthusiasts who've found their ideal workout partners through our innovative platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="group relative">
              <div className="glassmorphism rounded-3xl p-10 text-center h-full border border-white/10 hover:border-gym-green/30 feature-card">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gym-green to-gym-green/80 rounded-2xl flex items-center justify-center mx-auto shadow-gym-glow">
                    <Users className="text-3xl text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gym-green rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Smart Matching</h3>
                <p className="text-gym-muted leading-relaxed text-lg">
                  Our AI-powered algorithm analyzes your fitness goals, experience level, location, and schedule to find your perfect workout companion.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="glassmorphism rounded-3xl p-10 text-center h-full border border-white/10 hover:border-gym-green/30 feature-card">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gym-green to-gym-green/80 rounded-2xl flex items-center justify-center mx-auto shadow-gym-glow">
                    <Heart className="text-3xl text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gym-green rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Real-time Chat</h3>
                <p className="text-gym-muted leading-relaxed text-lg">
                  Connect instantly with your matches through our built-in messaging system. Plan workouts, share progress, and motivate each other.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="glassmorphism rounded-3xl p-10 text-center h-full border border-white/10 hover:border-gym-green/30 feature-card">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gym-green to-gym-green/80 rounded-2xl flex items-center justify-center mx-auto shadow-gym-glow">
                    <Star className="text-3xl text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gym-green rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Nutrition Guidance</h3>
                <p className="text-gym-muted leading-relaxed text-lg">
                  Access personalized meal plans, nutrition tips, and diet recommendations tailored to your fitness goals and dietary preferences.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-24 text-center">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="glassmorphism rounded-2xl p-6 border border-white/5">
                <div className="text-3xl font-bold text-gym-green mb-2">10K+</div>
                <div className="text-gym-muted">Active Members</div>
              </div>
              <div className="glassmorphism rounded-2xl p-6 border border-white/5">
                <div className="text-3xl font-bold text-gym-green mb-2">50K+</div>
                <div className="text-gym-muted">Successful Matches</div>
              </div>
              <div className="glassmorphism rounded-2xl p-6 border border-white/5">
                <div className="text-3xl font-bold text-gym-green mb-2">4.9★</div>
                <div className="text-gym-muted">User Rating</div>
              </div>
              <div className="glassmorphism rounded-2xl p-6 border border-white/5">
                <div className="text-3xl font-bold text-gym-green mb-2">24/7</div>
                <div className="text-gym-muted">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gym-green/10 via-gym-green/5 to-gym-green/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your
            <span className="block text-gym-green">Fitness Journey?</span>
          </h2>
          <p className="text-xl text-gym-muted mb-8 max-w-2xl mx-auto">
            Join thousands of fitness enthusiasts who've already found their perfect workout partners. Start your journey today - it's completely free!
          </p>
          <Button
            asChild
            className="gradient-btn px-10 py-6 rounded-xl text-white font-semibold text-lg shadow-gym-glow hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Link href="/signup">Start Finding Partners</Link>
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="text-gym-green text-2xl" />
                <h3 className="text-xl font-bold text-gym-green">Gym Grinders</h3>
              </div>
              <p className="text-gym-muted text-sm">
                The ultimate platform for finding your perfect workout partner and achieving your fitness goals together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <div className="space-y-2 text-sm text-gym-muted">
                <div>Find Partners</div>
                <div>Diet Plans</div>
                <div>Sponsor Offers</div>
                <div>Real-time Chat</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <div className="space-y-2 text-sm text-gym-muted">
                <div>Help Center</div>
                <div>Safety Guidelines</div>
                <div>Community Rules</div>
                <div>Contact Us</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <div className="space-y-2 text-sm text-gym-muted">
                <div>About Us</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Careers</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gym-muted mb-4 md:mb-0">
              © 2024 Gym Grinders. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
