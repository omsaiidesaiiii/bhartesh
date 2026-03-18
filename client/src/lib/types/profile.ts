export interface ProfileData {
    id: string;
    userId: string;
    bio?: string;
    location?: string;
    regno?: string;
    gender?: string;
    address?: string;
    dob?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        department?: {
            id: string;
            name: string;
        };
    };
}

export interface CourseData {
    id: string;
    title: string;
    code: string;
    description?: string;
    type: string;
    duration: string;
    totalSemesters: number;
    credits?: number;
    status: string;
    department: {
        id: string;
        name: string;
    };
}

export interface StudentProfileWithCourses extends ProfileData {
    courses: CourseData[];
}
