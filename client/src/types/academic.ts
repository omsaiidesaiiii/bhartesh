export interface Staff {
    id: string;
    name: string;
    email: string;
    role: "STAFF" | "ADMIN" | "STUDENT";
    departmentId?: string;
    department?: {
        id: string;
        name: string;
    };
    staffSubjects?: {
        subject: {
            id: string;
            name: string;
            code: string;
        }
    }[];
}

export interface Department {
    id: string;
    name: string;
    hod?: {
        id: string;
        staffId: string;
        departmentId: string;
        staff: {
            id: string;
            name: string;
        };
    };
}

export interface HodAssignmentData {
    id: string;
    departmentId: string;
    staffId: string;
    department: {
        id: string;
        name: string;
    };
    staff: {
        id: string;
        name: string;
    };
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    departmentId: string;
    teachers?: {
        staff: {
            id: string;
            name: string;
        }
    }[];
}

export interface TimetableEntry {
    id: string;
    dayOfWeek: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    subjectId?: string;
    subject?: {
        id: string;
        name: string;
        code: string;
    };
    staffId?: string;
    staff?: {
        id: string;
        name: string;
    };
    room?: string;
    semester?: number;
    section?: string;
}

export interface CreateTimetablePayload {
    departmentId: string;
    subjectId: string;
    staffId: string;
    dayOfWeek: string;
    startTime: Date | string;
    endTime: Date | string;
    room?: string;
    semester?: number;
    section?: string;
}

export interface TimetableResponse {
    success: boolean;
    message?: string;
    data?: TimetableEntry[];
}

export interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "UPCOMING" | "PAST";
}

export interface AcademicEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    type: "EVENT" | "HOLIDAY" | "EXAM";
    attachmentUrl?: string;
}

export interface CreateAcademicYearPayload {
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    status: "ACTIVE" | "UPCOMING" | "PAST";
}

export interface CreateEventPayload {
    title: string;
    description?: string;
    date: Date | string;
    type: "EVENT" | "HOLIDAY" | "EXAM";
    attachmentUrl?: string;
}

export interface CreateSubjectPayload {
    name: string;
    code: string;
    credits?: number;
    semester: number;
    departmentId: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
}
