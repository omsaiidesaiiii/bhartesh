"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconChartBar,
  IconDashboard,
  IconBuilding,
  IconBook,
  IconSchool,
  IconFileDescription,
  IconListDetails,
  IconUsers,
  IconCertificate,
  IconSpeakerphone,
  IconUserCircle,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

const adminNav = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: IconDashboard,
  },
  // {
  //   title: "Users",
  //   url: "/admin-dashboard/users",
  //   icon: IconUsers,
  // },
  {
    title: "Departments",
    url: "/admin-dashboard/departments",
    icon: IconBuilding,
  },
  {
    title: "Courses",
    url: "/admin-dashboard/courses",
    icon: IconBook,
  },
  {
    title: "Academics",
    url: "/admin-dashboard/academics",
    icon: IconSchool,
  },
  {
    title: "Staff",
    url: "/admin-dashboard/staff",
    icon: IconUsers,
  },
  {
    title: "Students",
    url: "/admin-dashboard/students",
    icon: IconSchool,
  },
  {
    title: "Assignments",
    url: "/admin-dashboard/assignments",
    icon: IconFileDescription,
  },
  {
    title: "Exams & Results",
    url: "/admin-dashboard/exams",
    icon: IconCertificate,
  },
  {
    title: "Notices",
    url: "/admin-dashboard/notices",
    icon: IconSpeakerphone,
  },
  {
    title: "Report & Analytics",
    url: "/admin-dashboard/reports",
    icon: IconChartBar
  }
];

const staffNav = [
  {
    title: "Dashboard",
    url: "/staff/dashboard",
    icon: IconDashboard,
  },
  {
    title: "My Classes",
    url: "/staff/classes",
    icon: IconListDetails,
  },
  {
    title: "Attendance",
    url: "/staff/attendance",
    icon: IconUsers,
  },
  {
    title: "Assignments",
    url: "/staff/assignments",
    icon: IconFileDescription,
  },
  {
    title: "Study Materials",
    url: "/staff/notes",
    icon: IconBook,
  },
  {
    title: "PYQs",
    url: "/staff/pyq",
    icon: IconFileDescription,
  },
  {
    title: "Exams & Marks",
    url: "/staff/exams",
    icon: IconCertificate,
  },
  {
    title: "Profile",
    url: "/staff/profile",
    icon: IconUserCircle,
  },
  {
    title: "Notices",
    url: "/staff/notices",
    icon: IconSpeakerphone,
  },
];

const studentNav = [
  {
    title: "Dashboard",
    url: "/student/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Academics",
    url: "/student/academics",
    icon: IconBook,
  },
  {
    title: "Assignments",
    url: "/student/assignments",
    icon: IconFileDescription,
  },
  {
    title: "Attendance",
    url: "/student/attendance",
    icon: IconChartBar,
  },
  {
    title: "Profile",
    url: "/student/profile",
    icon: IconUserCircle,
  },
  {
    title: "Notices",
    url: "/student/notices",
    icon: IconSpeakerphone,
  },
];



interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "admin" | "staff" | "student";
}

export function AppSidebar({ role = "admin", ...props }: AppSidebarProps) {
  const { user } = useAuth();

  const sidebarUser = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.firebaseUser?.photoURL || "",
  };

  const navItems = role === "staff" ? staffNav : role === "student" ? studentNav : adminNav;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
               <Image src="/cms.png" alt="Campus HMS Logo" width={32} height={32} / >
                <span className="text-base font-semibold">Campus HMS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} role={role} />
      </SidebarFooter>
    </Sidebar>
  )
}
