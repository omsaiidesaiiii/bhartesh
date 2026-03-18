"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useState } from "react";
import Link from "next/link";
import { AuthPage } from "@/components/ui/auth-page";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
        toast.error("Please enter your email");
        return;
    }
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
      toast.success("Reset link sent");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthPage
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
      topButtonLabel="Login"
      topButtonHref="/login"
    >
      <div className="space-y-6">
        <div className="space-y-2">
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
            {message && (
                <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
                    {message}
                </p>
            )}
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 group hover:brightness-110 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Sending link...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <Send size={18} className="opacity-50" />
            </>
          )}
        </button>

        <div className="text-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline transition-all group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Login
            </Link>
        </div>
      </div>
    </AuthPage>
  );
}
