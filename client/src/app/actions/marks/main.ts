"use server"

import { secureApiClient } from "@/lib/secure-api";
import { UpsertMarkData, MarkResponse, MarksResponse, InternalMark, ResultsResponse, ExternalMarkResponse, StudentSubjectResult } from "./types";

export interface UpsertExternalMarkData {
    studentId: string;
    subjectId: string;
    marks: number;
    maxMarks?: number;
    semester: number;
    remarks?: string;
}

export async function upsertMark(data: UpsertMarkData): Promise<MarkResponse> {
    try {
        const res = await secureApiClient.post<InternalMark>('/internal-marks', data);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to save marks" };
    }
}

export async function fetchStudentMarks(studentId: string, semester?: number): Promise<MarksResponse> {
    try {
        const query = semester ? `?semester=${semester}` : '';
        const res = await secureApiClient.get<InternalMark[]>(`/internal-marks/student/${studentId}${query}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch marks" };
    }
}

export async function fetchSubjectMarks(subjectId: string, semester: number): Promise<MarksResponse> {
    try {
        const res = await secureApiClient.get<InternalMark[]>(`/internal-marks/subject/${subjectId}?semester=${semester}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch subject marks" };
    }
}

export async function upsertExternalMark(data: UpsertExternalMarkData): Promise<ExternalMarkResponse> {
    try {
        const res = await secureApiClient.post<any>('/internal-marks/external', data);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to save external marks" };
    }
}

export async function fetchStudentResults(studentId: string, semester: number): Promise<ResultsResponse> {
    try {
        const res = await secureApiClient.get<StudentSubjectResult[]>(`/internal-marks/results/${studentId}?semester=${semester}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch student results" };
    }
}
