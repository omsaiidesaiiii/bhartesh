"use server"

import { secureApiClient } from "@/lib/secure-api";
import {
    AttendanceTrend,
    DepartmentPerformance,
    PassRateData,
    StaffActivity,
    ReportSummary,
    TopClass,
    RecentAssessment
} from "./types";

export async function fetchReportSummary(year: string) {
    try {
        const res = await secureApiClient.get<ReportSummary>(`/reports/summary?year=${year}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch  {
        return { success: false || "Failed to fetch report summary" };
    }
}

export async function fetchAttendanceTrends(year: string) {
    try {
        const res = await secureApiClient.get<AttendanceTrend[]>(`/reports/attendance-trends?year=${year}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch  {
        return { success: false|| "Failed to fetch attendance trends" };
    }
}

export async function fetchDepartmentPerformance(year: string) {
    try {
        const res = await secureApiClient.get<DepartmentPerformance[]>(`/reports/department-performance?year=${year}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch  {
        return { success: false|| "Failed to fetch department performance" };
    }
}

export async function fetchPassRateData(year: string) {
    try {
        const res = await secureApiClient.get<PassRateData[]>(`/reports/result-analysis?year=${year}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch  {
        return { success: false|| "Failed to fetch pass rate data" };
    }
}

export async function fetchStaffActivity(year: string) {
    try {
        const res = await secureApiClient.get<StaffActivity[]>(`/reports/staff-activity?year=${year}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch  {
        return { success: false|| "Failed to fetch staff activity" };
    }
}

export async function fetchAcademicStats(year: string) {
    try {
        const res = await secureApiClient.get<{ topClasses: TopClass[], recentAssessments: RecentAssessment[] }>(`/reports/academic-stats?year=${year}`);
        if (res.error) return { success: false, error: res.error };
        return { success: true, data: res.data };
    } catch  {
        return { success: false || "Failed to fetch academic stats" };
    }
}
