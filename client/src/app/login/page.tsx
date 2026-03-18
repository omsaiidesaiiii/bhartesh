"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../../lib/firebase"
import { useAuth } from "@/context/AuthContext"
import { AuthPage } from "@/components/ui/auth-page"
import { Mail, Lock, Loader2, GraduationCap, Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

type LoginMode = "student" | "staff"

function LoginContent() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get("mode") as LoginMode) || "student"

  const [mode, setMode] = useState<LoginMode>(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()
  const { isAuthenticated, loginCredentials, loginGoogle, user, loading: authLoading } = useAuth()

  // Handle Redirects
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const roleRedirects = {
        ADMIN: "/admin-dashboard",
        STAFF: "/staff/dashboard",
        STUDENT: "/student/dashboard",
      }
      router.push(roleRedirects[user.role as keyof typeof roleRedirects] || "/admin-dashboard")
    }
  }, [isAuthenticated, user, authLoading, router])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) newErrors.email = "Email is required"
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format"

    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCredentialLogin = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await loginCredentials(email, password)
      if (result.success) {
        toast.success("Welcome back!")
      } else {
        toast.error(result.error || "Invalid credentials")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ hd: process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "*" })
      await signInWithPopup(auth, provider)
      await loginGoogle()
    } catch (error) {
      console.error("Google Sign-In error:", error)
      toast.error("Google Sign-In failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPage 
      title="Welcome Back" 
      description={"Sign in to your account"}
      // topButtonLabel="Sign Up"
      // topButtonHref="/signup"
    >
      <div className="space-y-6">
        {/* Mode Switcher */}
        

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Google Login for Students */}
            {mode === "student" && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-background hover:bg-accent/50 transition-all duration-200 font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Continue with College Email</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-px bg-border/60"></div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or login with credentials</span>
                  <div className="flex-1 h-px bg-border/60"></div>
                </div>
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder={mode === "student" ? "you@college.edu" : "staff@college.edu"}
                    className={`w-full rounded-xl border-2 bg-muted/20 px-11 py-3 text-sm font-medium transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 ${
                      errors.email ? "border-destructive/50" : "border-transparent hover:border-border/50 focus:border-primary"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-destructive" />
                  )}
                </div>
                {errors.email && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                    Password
                  </label>
                  <Link href="/forgot-password" title="Reset password" className="text-[11px] text-primary hover:underline font-bold transition-all">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border-2 bg-muted/20 px-11 py-3 text-sm font-medium transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 ${
                      errors.password ? "border-destructive/50" : "border-transparent hover:border-border/50 focus:border-primary"
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCredentialLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{errors.password}</p>}
              </div>
            </div>

            <button
              onClick={handleCredentialLogin}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 group hover:brightness-110 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <Shield size={18} className="opacity-50" />
                  </motion.div>
                </>
              )}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthPage>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
