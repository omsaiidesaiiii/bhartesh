import { Department } from "@/app/actions/setup/types";
import { ActionResult } from "./auth-api";
import { Subject } from "@/app/actions/subject/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001";
const TOKEN_KEY = 'accessToken';

function getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    semester: number;
    departmentId: string;
    subjectId?: string;
    authorId: string;
    author: {
        name: string;
        role: string;
    };
    subject?: {
        name: string;
        code: string;
    };
    status?: "PENDING" | "SUBMITTED";
    submittedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentSubmission {
    id: string;
    name: string;
    email: string;
    submission: {
        status: "PENDING" | "SUBMITTED";
        submittedAt?: string;
    };
}

export async function fetchAssignments(filters?: {
    semester?: number;
    departmentId?: string;
}): Promise<ActionResult<Assignment[]>> {
    try {
        const url = new URL(`${API_URL}/assignments`);
        if (filters?.semester) url.searchParams.append('semester', filters.semester.toString());
        if (filters?.departmentId) url.searchParams.append('departmentId', filters.departmentId);

        const authHeader = getAuthHeader();
        console.log(`[API] Fetching assignments from: ${url.toString()}`);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...authHeader,
            } as HeadersInit,
        });

        console.log(`[API] Response status: ${response.status}`);

        const data = await response.json();

        if (!response.ok) {
            console.error(`[API] Error details:`, data);
            return {
                success: false,
                error: data.message || `Unauthorized (${response.status})`,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch assignments error:", error);
        return {
            success: false,
            error: "Failed to connect to server",
        };
    }
}

export async function fetchStudentAssignments(): Promise<ActionResult<Assignment[]>> {
    try {
        const authHeader = getAuthHeader();
        const fullUrl = `${API_URL}/assignments/student`;
        console.log(`[API] Fetching student assignments from: ${fullUrl}`);

        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...authHeader,
            } as HeadersInit,
        });

        console.log(`[API] Student Response status: ${response.status}`);

        const data = await response.json();

        if (!response.ok) {
            console.error(`[API] Student Error details:`, data);
            return {
                success: false,
                error: data.message || `Unauthorized (${response.status})`,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch student assignments error:", error);
        return {
            success: false,
            error: "Failed to connect to server",
        };
    }
}

export async function createAssignment(assignmentData: {
    title: string;
    description?: string;
    dueDate: string;
    semester: number;
    departmentId: string;
    subjectId?: string;
}): Promise<ActionResult<Assignment>> {
    try {
        const authHeader = getAuthHeader();
        console.log(`[API] Creating assignment at: ${API_URL}/assignments`);

        const response = await fetch(`${API_URL}/assignments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeader,
            } as HeadersInit,
            body: JSON.stringify(assignmentData),
        });

        console.log(`[API] Create status: ${response.status}`);
        const data = await response.json();

        if (!response.ok) {
            console.error(`[API] Create Error:`, data);
            return {
                success: false,
                error: data.message || `Creation failed (${response.status})`,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Create assignment error:", error);
        return {
            success: false,
            error: "Failed to create assignment",
        };
    }
}

export async function fetchAssignmentSubmissions(assignmentId: string): Promise<ActionResult<StudentSubmission[]>> {
    try {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}/submissions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            } as HeadersInit,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || "Failed to fetch submissions",
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch submissions error:", error);
        return {
            success: false,
            error: "Failed to fetch submissions",
        };
    }
}

export async function markAsSubmitted(assignmentId: string, studentId: string): Promise<ActionResult<void>> {
    try {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}/submissions/${studentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            } as HeadersInit,
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.message || "Failed to mark as submitted",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Mark as submitted error:", error);
        return {
            success: false,
            error: "Failed to mark as submitted",
        };
    }
}

export async function deleteAssignment(id: string): Promise<ActionResult<void>> {
    try {
        const response = await fetch(`${API_URL}/assignments/${id}`, {
            method: "DELETE",
            headers: {
                ...getAuthHeader(),
            } as HeadersInit,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return {
                success: false,
                error: data.message || "Failed to delete assignment",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Delete assignment error:", error);
        return {
            success: false,
            error: "Failed to delete assignment",
        };
    }
}

export async function fetchDepartments(): Promise<ActionResult<Department[]>> {
    try {
        const response = await fetch(`${API_URL}/setup/departments`, {
            headers: getAuthHeader() as HeadersInit,
        });
        const data = await response.json();
        return response.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
        return { success: false, error: "Failed to fetch departments" };
    }
}

export async function fetchSubjects(departmentId: string, semester?: number): Promise<ActionResult<Subject[]>> {
    try {
        let url = `${API_URL}/subjects/department/${departmentId}`;
        if (semester) url += `?semester=${semester}`;
        const response = await fetch(url, {
            headers: getAuthHeader() as HeadersInit,
        });
        const data = await response.json();
        return response.ok ? { success: true, data } : { success: false, error: data.message };
    } catch {
        return { success: false, error: "Failed to fetch subjects" };
    }
}
