"use server"

import { secureApiClient } from "@/lib/secure-api";
import { revalidatePath } from "next/cache";

export interface StudentMarkEntry {
    studentId: string;
    marks: number;
}

export interface SubmitMarksInput {
    examId: string;
    subjectId: string;
    semester: number;
    assessmentType: 'IA1' | 'IA2' | 'IA3' | 'IA4';
    maxMarks: number;
    marks: StudentMarkEntry[];
}

export interface StudentForMarksEntry {
    id: string;
    name: string;
    email: string;
    profile: {
        regno: string | null;
    } | null;
}

export interface SubjectInfo {
    id: string;
    name: string;
    code: string;
    semester: number;
    credits: number | null;
    department: {
        id: string;
        name: string;
    };
}

export interface StaffSubjectsResponse {
    department: {
        id: string;
        name: string;
    } | null;
    subjects: SubjectInfo[];
}

export async function submitMarks(data: SubmitMarksInput) {
    try {
        const res = await secureApiClient.post<any>('/exams/submit-marks', data);
        if (res.error) return { success: false, error: res.error };
        revalidatePath('/staff/exams');
        return { success: true, data: res.data, message: "Marks submitted successfully" };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to submit marks" };
    }
}

export async function fetchStudentsForMarksEntry(examId: string, subjectId: string, semester: number) {
    try {
        const res = await secureApiClient.get<StudentForMarksEntry[]>(
            `/exams/${examId}/students?subjectId=${subjectId}&semester=${semester}`
        );
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch students" };
    }
}

export async function fetchStaffExams() {
    try {
        const res = await secureApiClient.get<any[]>('/exams/staff-exams');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch staff exams" };
    }
}

export async function fetchStaffSubjects() {
    try {
        const res = await secureApiClient.get<StaffSubjectsResponse>('/exams/staff-subjects');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch staff subjects" };
    }
}

