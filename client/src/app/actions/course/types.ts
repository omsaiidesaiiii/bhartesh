// Course types matching backend

export type CourseType = 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DIPLOMA' | 'PUC' | 'SCHOOL';
export type CourseStatus = 'ACTIVE' | 'INACTIVE';

export interface CourseDepartment {
  id: string;
  name: string;
}

export interface CourseEnrollment {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  type: CourseType;
  duration: string;
  totalSemesters: number;
  credits?: number;
  maxEnrollment?: number;
  status: CourseStatus;
  departmentId: string;
  department: CourseDepartment;
  enrollments?: CourseEnrollment[];
  _count?: {
    enrollments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  code: string;
  description?: string;
  type?: CourseType;
  duration: string;
  totalSemesters: number;
  credits?: number;
  maxEnrollment?: number;
  status?: CourseStatus;
  departmentId: string;
}

export interface UpdateCourseData {
  title?: string;
  code?: string;
  description?: string;
  type?: CourseType;
  duration?: string;
  totalSemesters?: number;
  credits?: number;
  maxEnrollment?: number;
  status?: CourseStatus;
  departmentId?: string;
}
