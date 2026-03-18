export interface AttendanceSession {
    id: string;
    date: string;
    timetableId: string;
    staffId: string;
    subjectId: string;
    departmentId: string;
    semester: number;
    section: string | null;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    isLocked: boolean;
    timetable?: {
        subject: {
            name: string;
            code: string;
        };
        department: {
            name: string;
        };
    };
}

export interface AttendanceRecord {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
}

export interface StudentWithProfile {
    id: string;
    name: string;
    profile?: {
        regno: string | null;
    };
}

export interface AttendanceResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface StaffAttendanceReport {
    id: string;
    date: string;
    subject: {
        name: string;
    };
    semester: number;
    section: string | null;
    status: string;
    _count: {
        records: number;
    };
}

export interface SubjectAttendanceReport {
    studentId: string;
    name: string;
    rollNumber: string | null;
    total: number;
    present: number;
}

export interface StudentAttendanceRecord {
    id: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    session: {
        subject: {
            name: string;
        };
    };
}

export interface StudentAttendanceReport {
    percentage: number;
    records: StudentAttendanceRecord[];
}
