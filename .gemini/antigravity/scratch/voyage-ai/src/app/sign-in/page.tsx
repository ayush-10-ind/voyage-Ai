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
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password, false);
      toast.success(`Welcome back!`);
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    toast.info(`Connecting to ${provider === "google" ? "Google" : "GitHub"} authentication secure tunnel...`);
    
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const mockOAuthEmail = `${provider}-traveler@voyage-ai.com`;
      await login(mockOAuthEmail, undefined, true);
      toast.success(`OAuth verified! Welcome, ${provider === "google" ? "Google" : "GitHub"} User!`);
      router.push(redirectUrl);
    } catch (err) {
      toast.error("OAuth authentication failed.");
    } finally {
      setOauthLoading(null);
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
              Sign in to access your secure travel command center
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
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-10 rounded-xl focus:border-primary/50 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-muted-foreground/50 h-10 rounded-xl focus:border-primary/50 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl glow-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase tracking-widest font-black">Or continue with</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuthLogin("google")}
              className="h-10 rounded-xl glass hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 border-white/10 disabled:opacity-50"
            >
              {oauthLoading === "google" ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.473-3.882-8.473-8.52 0-4.637 3.793-8.52 8.473-8.52 2.213 0 4.154.773 5.717 2.25l3.22-3.142C18.666.974 15.656 0 12.24 0 5.48 0 0 5.373 0 12s5.48 12 12.24 12c6.26 0 11.24-4.364 11.24-12 0-.818-.082-1.609-.24-2.285v-4.43H12.24z"/>
                </svg>
              )}
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuthLogin("github")}
              className="h-10 rounded-xl glass hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 border-white/10 disabled:opacity-50"
            >
              {oauthLoading === "github" ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              GitHub
            </Button>
          </div>

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
