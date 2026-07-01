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
let ClerkSignIn: any = null;

if (IS_CLERK_CONFIGURED) {
  try {
    ClerkSignIn = require("@clerk/nextjs").SignIn;
  } catch (e) {}
}

function SignInForm() {
  const { login } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams ? (searchParams.get("redirect_url") || "/dashboard") : "/dashboard";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const displayName = name || email.split("@")[0];
      await login(email, displayName);
      toast.success(`Welcome back, ${displayName}!`);
      router.push(redirectUrl);
    } catch (err) {
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b19] to-[#02040a] flex items-center justify-center p-4 relative overflow-hidden w-full">
      {/* Abstract Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {IS_CLERK_CONFIGURED && ClerkSignIn ? (
        <div className="z-10">
          <ClerkSignIn redirectUrl={redirectUrl} />
        </div>
      ) : (
        <GlassCard padding="lg" className="w-full max-w-md border-glow shadow-glass z-10 text-left space-y-6">
          <div className="text-center space-y-2">
            <Typography variant="title" className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Icons.explore className="h-6 w-6 text-primary" />
              Voyage AI
            </Typography>
            <p className="text-xs text-muted-foreground">
              Sign in to access your travel workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-10 rounded-xl focus:border-primary/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Full Name (Optional)
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-10 rounded-xl focus:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl glow-primary mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icons.lock className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground border-t border-white/5 pt-4">
            Don't have an account?{" "}
            <Link href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`} className="text-primary hover:underline font-semibold">
              Sign Up
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
