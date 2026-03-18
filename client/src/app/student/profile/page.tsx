"use client"

import React, { useState, useEffect } from "react"
import { getStudentProfileWithCourses, getStudentRegno } from "@/app/actions/profile/main"
import { useAuth } from "@/context/AuthContext"
import {
  User,
  Lock,
  LogOut,
  ChevronRight,
  Camera,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  BookOpen,
  GraduationCap
} from "lucide-react"
import { toast } from "sonner"
import { ProfileData, CourseData as Course, StudentProfileWithCourses } from "@/lib/types/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Local interfaces removed in favor of imported ones

export default function StudentProfilePage() {
  const { logout, user } = useAuth()
  const [profileData, setProfileData] = useState<StudentProfileWithCourses | null>(null)
  const [regno, setRegno] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch profile with courses
        const profileResult = await getStudentProfileWithCourses()
        if (profileResult.success && profileResult.data) {
          setProfileData(profileResult.data)
        } else {
          setError(profileResult.error || 'Failed to fetch profile')
        }

        // Fetch regno separately (for demonstration)
        const regnoResult = await getStudentRegno()
        if (regnoResult.success) {
          setRegno(regnoResult.regno || null)
        }

      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile data')
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const menuGroups = [
    {
      label: "Account Settings",
      items: [
        { icon: User, label: "Edit Profile" },
        { icon: Lock, label: "Change Password" },
        { icon: Bell, label: "Notifications" },
      ]
    },
    {
      label: "Academic & Records",
      items: [
        { icon: FileText, label: "Digital ID Card" },
        { icon: CreditCard, label: "Fee Statements" },
      ]
    },
    {
      label: "Support",
      items: [
        { icon: HelpCircle, label: "Get Help" },
      ]
    }
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 mt-4">
      {/* Profile Header Card */}
      <section className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-28 w-28 border-4 border-card shadow-sm ring-1 ring-border">
            <AvatarImage src={user?.firebaseUser?.photoURL || user?.profileImageUrl || ""} />
            <AvatarFallback>{user?.name?.charAt(0) || "S"}</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full border-2 border-card shadow-md active:scale-90 transition-transform">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="text-center mt-6 space-y-1">
          <h2 className="text-xl font-bold text-foreground">{profileData?.user.name || "Student"}</h2>
          <p className="text-muted-foreground font-medium text-xs">
            {profileData?.courses[0]?.title || "Course"} • Semester {profileData?.courses[0] ? "5" : "N/A"}
          </p>
          <div className="flex justify-center gap-2 pt-3">
            <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
              ID: {regno || profileData?.regno || "N/A"}
            </div>
          </div>
        </div>
      </section>

      {/* Course Information */}
      {profileData?.courses && profileData.courses.length > 0 && (
        <section className="px-4">
          <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enrolled Course</h3>
                <p className="text-sm text-muted-foreground">Your current academic program</p>
              </div>
            </div>

            <div className="space-y-3">
              {profileData.courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.code} • {course.department.name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {course.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Options */}
      <div className="space-y-8">
        {menuGroups.map((group, i) => (
          <div key={i} className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">{group.label}</h3>
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              {group.items.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-4 active:bg-muted transition-all border-b border-border/50 last:border-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-active:text-primary transition-colors">
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full h-14 rounded-2xl bg-card border border-destructive/20 flex items-center justify-center gap-2 group active:bg-destructive/10 transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4 text-destructive" />
            <span className="text-sm font-bold text-destructive">Log Out</span>
          </button>
          <p className="text-center text-[9px] text-muted-foreground font-medium mt-6 uppercase tracking-[0.2em] opacity-60">v2.4.0 • Built with Love</p>
        </div>
      </div>
    </div>
  )
}

