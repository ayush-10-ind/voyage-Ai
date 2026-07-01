"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "@/features/auth/context/user-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { toast } from "sonner";

const IS_CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
let ClerkSignUp: any = null;

if (IS_CLERK_CONFIGURED) {
  try {
    ClerkSignUp = require("@clerk/nextjs").SignUp;
  } catch (e) {}
}

function SignUpForm() {
  const { signUp } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams ? (searchParams.get("redirect_url") || "/dashboard") : "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please enter a name, email address, and secure password.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, name, password, phone || undefined, country || undefined);
      toast.success(`Account created successfully! Welcome, ${name}!`);
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b19] to-[#02040a] flex items-center justify-center p-4 relative overflow-hidden w-full">
      {/* Abstract Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {IS_CLERK_CONFIGURED && ClerkSignUp ? (
        <div className="z-10">
          <ClerkSignUp redirectUrl={redirectUrl} />
        </div>
      ) : (
        <GlassCard padding="lg" className="w-full max-w-md border-glow shadow-glass z-10 text-left space-y-5">
          <div className="text-center space-y-1">
            <Typography variant="title" className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Icons.explore className="h-6 w-6 text-primary" />
              Voyage AI
            </Typography>
            <p className="text-xs text-muted-foreground">
              Register your secure travel profile to start planning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="name" className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-9 rounded-xl focus:border-primary/50 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-9 rounded-xl focus:border-primary/50 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-9 rounded-xl focus:border-primary/50 text-xs"
                required
              />
            </div>

            {/* Optional Fields Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1">
                <label htmlFor="phone" className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Phone (Optional)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/30 h-9 rounded-xl focus:border-primary/50 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="country" className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Country (Optional)
                </label>
                <Input
                  id="country"
                  type="text"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/30 h-9 rounded-xl focus:border-primary/50 text-[11px]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl glow-primary mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icons.lock className="h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground border-t border-white/5 pt-4">
            Already have an account?{" "}
            <Link href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`} className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
