"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthPage } from "@/components/ui/auth-page";
import { Mail, Lock, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/admin-dashboard");
    }
  }, [user, router]);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
    }
    if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }
    if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/admin-dashboard");
      toast.success("Account created successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage
      title="Create Account"
      description="Join Campus HMS and start managing your academics."
      topButtonLabel="Login"
      topButtonHref="/login"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5 focus-within:z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-xl border-2 border-transparent bg-muted/20 px-11 py-3 text-sm font-medium transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-border/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 focus-within:z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-transparent bg-muted/20 px-11 py-3 text-sm font-medium transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-border/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 focus-within:z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-transparent bg-muted/20 px-11 py-3 text-sm font-medium transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-border/50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 group hover:brightness-110 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <UserPlus size={18} className="opacity-50" />
            </>
          )}
        </button>

        <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                    Login here
                </Link>
            </p>
        </div>
      </div>
    </AuthPage>
  );
}
