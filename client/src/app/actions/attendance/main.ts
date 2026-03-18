"use server"

import { secureApiClient } from "@/lib/secure-api";
import { 
    AttendanceSession, 
    AttendanceRecord, 
    StudentWithProfile, 
    AttendanceResponse,
    StaffAttendanceReport,
    SubjectAttendanceReport,
    StudentAttendanceReport
} from "./types";

export async function fetchTodaySessions(): Promise<AttendanceResponse<AttendanceSession[]>> {
    try {
        const res = await secureApiClient.get<AttendanceSession[]>('/attendance/sessions/today');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch sessions";
        return { success: false, error: errorMessage };
    }
}

export async function fetchSessionStudents(sessionId: string): Promise<AttendanceResponse<StudentWithProfile[]>> {
    try {
        const res = await secureApiClient.get<StudentWithProfile[]>(`/attendance/sessions/${sessionId}/students`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch students";
        return { success: false, error: errorMessage };
    }
}

export async function markAttendance(sessionId: string, records: AttendanceRecord[]): Promise<AttendanceResponse> {
    try {
        const res = await secureApiClient.post(`/attendance/sessions/${sessionId}/mark`, records);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to mark attendance";
        return { success: false, error: errorMessage };
    }
}

export async function lockAttendanceSession(sessionId: string): Promise<AttendanceResponse> {
    try {
        const res = await secureApiClient.post(`/attendance/sessions/${sessionId}/lock`, {});
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to lock session";
        return { success: false, error: errorMessage };
    }
}

export async function cancelAttendanceSession(sessionId: string): Promise<AttendanceResponse> {
    try {
        const res = await secureApiClient.post(`/attendance/sessions/${sessionId}/cancel`, {});
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to cancel session";
        return { success: false, error: errorMessage };
    }
}

export async function fetchSubjectAttendanceReport(subjectId: string): Promise<AttendanceResponse<SubjectAttendanceReport[]>> {
    try {
        const res = await secureApiClient.get<SubjectAttendanceReport[]>(`/attendance/report/subject/${subjectId}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch subject report";
        return { success: false, error: errorMessage };
    }
}

export async function fetchStaffAttendanceReport(staffId: string): Promise<AttendanceResponse<StaffAttendanceReport[]>> {
    try {
        const res = await secureApiClient.get<StaffAttendanceReport[]>(`/attendance/report/staff/${staffId}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch staff report";
        return { success: false, error: errorMessage };
    }
}

export async function fetchMyAttendanceReport(): Promise<AttendanceResponse<StaffAttendanceReport[]>> {
    try {
        const res = await secureApiClient.get<StaffAttendanceReport[]>(`/attendance/report/staff/me`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch your report";
        return { success: false, error: errorMessage };
    }
}

export async function fetchStudentAttendance(studentId: string): Promise<AttendanceResponse<StudentAttendanceReport>> {
    try {
        const res = await secureApiClient.get<StudentAttendanceReport>(`/attendance/report/student/${studentId}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch student attendance";
        return { success: false, error: errorMessage };
    }
}
