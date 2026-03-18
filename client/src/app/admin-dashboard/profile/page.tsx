"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, Shield, Mail, User as UserIcon, Badge, Phone, MapPin, Info } from "lucide-react"
import { useEffect } from "react"
import { getMyProfile } from "@/app/actions/profile/main"

export default function ProfilePage() {
  const { user, loading, isAdmin, isStaff, isStudent, logout } = useAuth()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetchingProfile(true)
      const res = await getMyProfile()
      if (res.success) {
        setProfileData(res.data)
      }
      setIsFetchingProfile(false)
    }
    if (user) fetchProfile()
  }, [user])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!user) {
    return <div className="flex h-full items-center justify-center">Please log in to view profile.</div>
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setIsUpdatingPassword(true)
    try {
      // TODO: Implement password change API call
      toast.info("Password change feature coming soon")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update password"
      toast.error(message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case "ADMIN":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "STAFF":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "STUDENT":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Profile & Account</h2>
          <p className="text-sm text-muted-foreground">
            View your account information and security settings.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details and role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.firebaseUser?.photoURL || ""} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor()}`}>
                    <Badge className="h-3 w-3" />
                    {user.role}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="font-medium">{user.email}</p>
                </div>

                {user.username && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Username
                    </Label>
                    <p className="font-medium">{user.username}</p>
                  </div>
                )}

                {profileData?.regno && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Registration/Staff ID
                    </Label>
                    <p className="font-medium">{profileData.regno}</p>
                  </div>
                )}

                {profileData?.user?.phone && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="font-medium">{profileData.user.phone}</p>
                  </div>
                )}

                {profileData?.location && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <p className="font-medium">{profileData.location}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="font-mono text-sm text-muted-foreground">{user.id}</p>
                </div>

                {profileData?.bio && (
                  <div className="col-span-full space-y-2 border-t pt-4">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Bio
                    </Label>
                    <p className="text-sm leading-relaxed">{profileData.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Password Change - Only for Admin/Staff */}
          {(isAdmin || isStaff) && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button type="submit" disabled={isUpdatingPassword} variant="outline" className="w-full">
                    {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Login Type:</span>
                <span className="font-medium">
                  {isStudent ? "Google (Firebase)" : "Email & Password"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{user.role}</span>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div >
    </div >
  )
}
