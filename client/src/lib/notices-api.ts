import { ActionResult } from "./auth-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001";
const TOKEN_KEY = 'accessToken';

function getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    audience: "ALL" | "STAFF" | "STUDENTS";
    pinned: boolean;
    authorId: string;
    author: {
        name: string;
        role: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedNotices {
    notices: Notice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export async function fetchNotices(params?: { 
    audience?: string; 
    page?: number; 
    limit?: number; 
    search?: string;
}): Promise<ActionResult<PaginatedNotices>> {
    try {
        const url = new URL(`${API_URL}/notices`);
        if (params?.audience && params.audience !== 'all') {
            url.searchParams.append('audience', params.audience.toUpperCase());
        }
        if (params?.page) {
            url.searchParams.append('page', params.page.toString());
        }
        if (params?.limit) {
            url.searchParams.append('limit', params.limit.toString());
        }
        if (params?.search) {
            url.searchParams.append('search', params.search);
        }

        const response = await fetch(url.toString(), {
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
                error: data.message || "Failed to fetch notices",
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch notices error:", error);
        return {
            success: false,
            error: "Failed to connect to server",
        };
    }
}

export async function createNotice(noticeData: {
    title: string;
    content: string;
    audience: string;
    pinned?: boolean;
}): Promise<ActionResult<Notice>> {
    try {
        const response = await fetch(`${API_URL}/notices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            } as HeadersInit,
            body: JSON.stringify({
                ...noticeData,
                audience: noticeData.audience.toUpperCase()
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || "Failed to create notice",
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Create notice error:", error);
        return {
            success: false,
            error: "Failed to create notice",
        };
    }
}

export async function updateNotice(id: string, noticeData: {
    title?: string;
    content?: string;
    audience?: string;
    pinned?: boolean;
}): Promise<ActionResult<Notice>> {
    try {
        const response = await fetch(`${API_URL}/notices/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            } as HeadersInit,
            body: JSON.stringify({
                ...noticeData,
                audience: noticeData.audience?.toUpperCase()
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || "Failed to update notice",
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Update notice error:", error);
        return {
            success: false,
            error: "Failed to update notice",
        };
    }
}

export async function deleteNotice(id: string): Promise<ActionResult<void>> {
    try {
        const response = await fetch(`${API_URL}/notices/${id}`, {
            method: "DELETE",
            headers: getAuthHeader() as HeadersInit,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return {
                success: false,
                error: data.message || "Failed to delete notice",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Delete notice error:", error);
        return {
            success: false,
            error: "Failed to delete notice",
        };
    }
}

export async function toggleNoticePin(id: string): Promise<ActionResult<Notice>> {
    try {
        const response = await fetch(`${API_URL}/notices/${id}/pin`, {
            method: "PATCH",
            headers: getAuthHeader() as HeadersInit,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || "Failed to toggle pin",
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Toggle pin error:", error);
        return {
            success: false,
            error: "Failed to toggle pin",
        };
    }
}
