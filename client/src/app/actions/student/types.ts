import { User, UsersResponse, Department } from '../user/types';

export interface StudentProfile {
    id: string;
    userId: string;
    bio?: string;
    location?: string;
    regno?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    address?: string;
    DOB?: string;
    semester?: number;
    section?: string;
    cgpa?: number;
}

export interface Student extends User {
    profile?: StudentProfile;
}

export interface StudentsResponse {
    students: Student[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface StudentStats {
    totalStudents: number;
    activeStudents: number;
    activeBatches: number;
    courseDistribution: {
        course: string;
        count: number;
    }[];
}

export interface CreateStudentData {
    name: string;
    email: string;
    phone?: string;
    departmentId?: string;
    semester?: number;
    section?: string;
    regno?: string;
    cgpa?: number;
}

export interface UpdateStudentData {
    name?: string;
    email?: string;
    phone?: string;
    departmentId?: string;
    semester?: number;
    section?: string;
    isActive?: boolean;
    regno?: string;
    cgpa?: number;
}

export interface BulkPromoteData {
    studentIds: string[];
    targetSemester: number;
    section?: string;
}
