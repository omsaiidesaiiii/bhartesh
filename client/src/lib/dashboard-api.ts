import { secureApiClient } from "./secure-api";

export interface DashboardStats {
  title: string;
  value: string;
  icon: string;
  description: string;
  color?: string;
}

export interface FeaturedEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
  attachmentUrl?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
  attachmentUrl?: string;
}

export interface AdminDashboardData {
  stats: DashboardStats[];
  studentData: { name: string; total: number }[];
  staffData: { name: string; total: number }[];
  upcomingEvents: UpcomingEvent[];
  featuredEvents: FeaturedEvent[];
}

export interface StaffDashboardData {
  stats: DashboardStats[];
  schedule: { subject: string; class: string; time: string; status: string }[];
  featuredEvents: FeaturedEvent[];
}

export interface StudentDashboardData {
  name: string;
  stats: { label: string; value: string }[];
  upcomingExams: { title: string; date: string }[];
  featuredEvents: FeaturedEvent[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const response = await secureApiClient.get<AdminDashboardData>("/dashboard/admin");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to fetch admin dashboard data");
  }
  return response.data;
}

export async function getStaffDashboardData(): Promise<StaffDashboardData> {
  const response = await secureApiClient.get<StaffDashboardData>("/dashboard/staff");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to fetch staff dashboard data");
  }
  return response.data;
}

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const response = await secureApiClient.get<StudentDashboardData>("/dashboard/student");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to fetch student dashboard data");
  }
  return response.data;
}
