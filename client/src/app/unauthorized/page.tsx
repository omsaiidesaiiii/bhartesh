"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    if (user) {
      const roleRedirects = {
        ADMIN: '/admin-dashboard',
        STAFF: '/staff',
        STUDENT: '/student'
      };
      const redirectUrl = roleRedirects[user.role as keyof typeof roleRedirects] || '/admin-dashboard';
      router.push(redirectUrl);
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Your role: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Button onClick={handleGoBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Your Dashboard
          </Button>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}