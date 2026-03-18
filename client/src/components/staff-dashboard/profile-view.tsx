import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, ShieldCheck } from "lucide-react"

export function StaffProfileView({ user, profileData }: { user: any; profileData: any }) {
    const displayUser = profileData?.user || user;

    return (
        <div className="space-y-6">
            <div className="relative h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 px-4 -mt-16 relative z-10">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                        <AvatarImage src={displayUser?.photoURL || displayUser?.profileImageUrl} />
                        <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                            {displayUser?.name?.charAt(0) || displayUser?.displayName?.charAt(0) || "S"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-2xl font-bold">{displayUser?.name || displayUser?.displayName || "Staff Member"}</h1>
                        <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
                            <Briefcase className="h-3.5 w-3.5" /> {displayUser?.department?.name || "Staff"}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                            <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1">{displayUser?.role}</Badge>
                            <Badge className="bg-green-100 text-green-700 border-none px-3 py-1">{displayUser?.isActive ? "Active" : "Inactive"}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-16 md:mt-16">
                    <Card className="bg-card/40 backdrop-blur-sm border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium truncate">{displayUser?.email}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/40 backdrop-blur-sm border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Contact Number
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{displayUser?.phone || "Not provided"}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/40 backdrop-blur-sm border-none shadow-sm md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Workplace
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{profileData?.location || "Campus"}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card/30 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            Bio & About
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Biography</p>
                            <p className="text-sm font-semibold leading-relaxed">{profileData?.bio || "No bio available"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Address</p>
                            <p className="text-sm font-semibold">{profileData?.address || "Not provided"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                            Identity Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-1.5 border-b border-muted/50">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Joined
                            </span>
                            <span className="text-sm font-bold">{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-muted/50">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Registration ID
                            </span>
                            <span className="text-sm font-bold font-mono">{profileData?.regno || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-muted/50">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Gender
                            </span>
                            <span className="text-sm font-bold">{profileData?.gender || "Not specified"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
