"use server"

import { revalidatePath } from "next/cache"
import { Department, Staff, Subject, TimetableEntry, AcademicYear, AcademicEvent, ApiResponse, HodAssignmentData, CreateTimetablePayload, CreateAcademicYearPayload, CreateEventPayload, CreateSubjectPayload } from "@/types/academic"
import { getSession } from "../auth/main"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

async function getHeaders() {
    const session = await getSession()
    const token = session.accessToken
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
}

// --- Fetch Data ---

export async function getDepartments(): Promise<Department[]> {
    try {
        const res = await fetch(`${API_URL}/setup/departments`, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch departments", error)
        return []
    }
}

export async function getStaffList(departmentId?: string): Promise<Staff[]> {
    try {
        let url = `${API_URL}/users?role=STAFF&limit=100`;
        if (departmentId) {
            url += `&departmentId=${departmentId}`;
        }

        const res = await fetch(url, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.users || []
    } catch (error) {
        console.error("Failed to fetch staff", error)
        return []
    }
}

export async function getSubjects(departmentId?: string): Promise<Subject[]> {
    try {
        const url = departmentId
            ? `${API_URL}/subjects/department/${departmentId}`
            : `${API_URL}/subjects`;

        const res = await fetch(url, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch subjects", error)
        return []
    }
}

export async function getStaffSubjects(staffId: string): Promise<any[]> {
    try {
        const res = await fetch(`${API_URL}/staff/${staffId}/subjects`, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch staff subjects", error)
        return []
    }
}

export async function getTimetable(options: { staffId?: string, departmentId?: string }): Promise<TimetableEntry[]> {
    try {
        let url = `${API_URL}/timetable/staff/${options.staffId}`;
        if (options.departmentId) {
            url = `${API_URL}/timetable/department/${options.departmentId}`;
        }

        const res = await fetch(url, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch timetable", error)
        return []
    }
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
    try {
        const res = await fetch(`${API_URL}/academic-years`, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch academic years", error)
        return []
    }
}

export async function getEvents(): Promise<AcademicEvent[]> {
    try {
        const res = await fetch(`${API_URL}/events`, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch events", error)
        return []
    }
}


// --- Mutations ---

export async function assignSubjectToStaff(staffId: string, subjectId: string): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/staff/${staffId}/subjects`, {
            method: "POST",
            headers: await getHeaders(),
            body: JSON.stringify({ subjectId }),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to assign subject" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Subject assigned successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function assignHodToDepartment(departmentId: string, staffId: string): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/hod`, {
            method: "POST",
            headers: await getHeaders(),
            body: JSON.stringify({ departmentId, staffId }),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to assign HOD" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "HOD assigned successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function createTimetableEntry(data: CreateTimetablePayload): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/timetable`, {
            method: "POST",
            headers: await getHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to create timetable entry" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Timetable entry created" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function updateTimetableEntry(id: string, data: Partial<CreateTimetablePayload>): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/timetable/${id}`, {
            method: "PATCH",
            headers: await getHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to update timetable entry" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Timetable entry updated" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function deleteTimetableEntry(id: string): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/timetable/${id}`, {
            method: "DELETE",
            headers: await getHeaders(),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to delete timetable entry" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Timetable entry deleted" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function createAcademicYear(data: CreateAcademicYearPayload): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/academic-years`, {
            method: "POST",
            headers: await getHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to create academic year" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Academic year created successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function createEvent(data: CreateEventPayload): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: await getHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to create event" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Event created successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "http://localhost:3001"

export interface UploadResponse {
    success: boolean
    message?: string
    url?: string
    filename?: string
}

export async function uploadEventAttachment(file: File): Promise<UploadResponse> {
    try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch(`${CDN_URL}/events/upload`, {
            method: "POST",
            body: formData,
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to upload attachment" }
        }

        const data = await res.json()
        return { 
            success: true, 
            url: data.url,
            filename: data.filename,
        }
    } catch {
        return { success: false, message: "Network error occurred during upload" }
    }
}

export async function createSubject(data: CreateSubjectPayload): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/subjects`, {
            method: "POST",
            headers: await getHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to create subject" }
        }

        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Subject created successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function getHodAssignments(): Promise<HodAssignmentData[]> {
    try {
        const res = await fetch(`${API_URL}/hod`, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch HOD assignments", error)
        return []
    }
}
