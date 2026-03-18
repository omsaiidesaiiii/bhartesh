import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Mail, Phone, Camera, Save, ShieldAlert, MapPin, Info } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateMyProfile } from "@/app/actions/profile/main"
import { toast } from "sonner"

export function StaffEditProfile({ user, profileData }: { user: any; profileData: any }) {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    bio: profileData?.bio || "",
    location: profileData?.location || "",
    address: profileData?.address || "",
    gender: profileData?.gender || "",
    regno: profileData?.regno || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await updateMyProfile(formData)
      if (res.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(res.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const displayUser = profileData?.user || user;

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-none shadow-xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information and account security.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4" /> Professional info
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-32 w-32 ring-4 ring-muted group-hover:ring-blue-400 transition-all cursor-pointer">
                    <AvatarImage src={displayUser?.photoURL || displayUser?.profileImageUrl} />
                    <AvatarFallback className="text-3xl font-bold bg-muted text-muted-foreground uppercase">
                      {displayUser?.name?.charAt(0) || displayUser?.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">Change Photo</Button>
              </div>

              <div className="flex-1 grid gap-4 w-full">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" defaultValue={displayUser?.name || displayUser?.displayName} readOnly className="bg-muted/30 cursor-not-allowed opacity-70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue={displayUser?.email} readOnly className="bg-muted/30 cursor-not-allowed opacity-70" />
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" /> Contact IT to change your official email.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="regno">Registration ID / Staff ID</Label>
                    <Input id="regno" value={formData.regno} onChange={handleChange} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Workplace / Location</Label>
                    <Input id="location" value={formData.location} onChange={handleChange} className="bg-background/50" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={handleChange} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input id="gender" value={formData.gender} onChange={handleChange} placeholder="MALE / FEMALE / OTHER" className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Input id="bio" value={formData.bio} onChange={handleChange} className="bg-background/50" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Professional Details
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="max-w-md mx-auto space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pass">Current Password</Label>
                <Input id="current-pass" type="password" placeholder="••••••••" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pass">New Password</Label>
                <Input id="new-pass" type="password" placeholder="••••••••" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirm New Password</Label>
                <Input id="confirm-pass" type="password" placeholder="••••••••" className="bg-background/50" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-100 dark:bg-orange-950/10 dark:border-orange-900">
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                Strong passwords use at least 8 characters, with a mix of letters, numbers, and symbols.
              </p>
            </div>
            <Button className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-black gap-2">
              <Lock className="h-4 w-4" /> Update Access Credentials
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

import { Loader2 } from "lucide-react"
