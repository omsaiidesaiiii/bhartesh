export interface Department {
  id: string;
  name: string;
}

import { Subject } from "../subject/types";

export interface StaffSubject {
  id: string;
  staffId: string;
  subjectId: string;
  subject: Subject;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  regno?: string;
}

// User types matching backend
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT';
  isActive: boolean;
  isVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  department?: Department;
  staffSubjects?: StaffSubject[];
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  departments: number;
  avgWorkload: number;
}

export interface CreateStaffData {
  name: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  departmentId?: string;
}

export interface StaffWorkload {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  subjectsCount: number;
  weeklyClassesCount: number;
  weeklyHours: number;
}
