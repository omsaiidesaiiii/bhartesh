"use server"

import { secureApiClient } from "@/lib/secure-api";
import { Exam, ExamStats, ResultOverview, CreateExamInput, UpdateExamInput } from "./types";
import { revalidatePath } from "next/cache";

export async function fetchExams() {
    try {
        const res = await secureApiClient.get<Exam[]>('/exams');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch exams" };
    }
}

export async function fetchExamStats() {
    try {
        const res = await secureApiClient.get<ExamStats>('/exams/stats');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch exam stats" };
    }
}

export async function fetchResultOverview() {
    try {
        const res = await secureApiClient.get<ResultOverview[]>('/exams/results-overview');
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch result overview" };
    }
}

export async function createExam(data: CreateExamInput) {
    try {
        const res = await secureApiClient.post<Exam>('/exams', data);
        if (res.error) return { success: false, error: res.error };
        revalidatePath('/admin-dashboard/exams');
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to create exam" };
    }
}

export async function updateExam(id: string, data: UpdateExamInput) {
    try {
        const res = await secureApiClient.patch<Exam>(`/exams/${id}`, data);
        if (res.error) return { success: false, error: res.error };
        revalidatePath('/admin-dashboard/exams');
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to update exam" };
    }
}

export async function deleteExam(id: string) {
    try {
        const res = await secureApiClient.delete<any>(`/exams/${id}`);
        if (res.error) return { success: false, error: res.error };
        revalidatePath('/admin-dashboard/exams');
        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to delete exam" };
    }
}
