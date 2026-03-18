export interface AttendanceTrend {
    month: string;
    present: number;
    absent: number;
}

export interface DepartmentPerformance {
    name: string;
    score: number;
}

export interface PassRateData {
    name: string;
    value: number;
}

export interface StaffActivity {
    day: string;
    active: number;
}

export interface ReportSummary {
    totalStudents: number;
    totalStudentsChange: string;
    avgAttendance: number;
    avgAttendanceNote: string;
    passRate: number;
    passRateChange: string;
    topDept: string;
    topDeptNote: string;
}

export interface TopClass {
    name: string;
    avg: number;
}

export interface RecentAssessment {
    name: string;
    date: string;
}

export interface ReportData {
    summary: ReportSummary;
    attendanceTrends: AttendanceTrend[];
    departmentPerformance: DepartmentPerformance[];
    passRate: PassRateData[];
    staffActivity: StaffActivity[];
    topClasses: TopClass[];
    recentAssessments: RecentAssessment[];
}
