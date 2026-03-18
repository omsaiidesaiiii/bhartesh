"use server"

export type { Subject, SubjectsResponse } from "./types";
import { secureApiClient } from "@/lib/secure-api";
import { Subject as SubjectType, SubjectsResponse as SubjectsResponseType } from "./types";

export async function fetchSubjectsByDepartment(departmentId: string, semester?: number): Promise<SubjectsResponseType> {
    try {
        const query = semester ? `?semester=${semester}` : '';
        const res = await secureApiClient.get<SubjectType[]>(`/subjects/department/${departmentId}${query}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch subjects" };
    }
}

export async function fetchSubjects(): Promise<SubjectsResponseType> {
    try {
        const res = await secureApiClient.get<SubjectType[]>('/subjects');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch subjects" };
    }
}
