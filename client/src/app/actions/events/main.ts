"use server"

import { revalidatePath } from "next/cache"
import { AcademicEvent, CreateEventPayload, ApiResponse } from "@/types/academic"
import { getSession } from "../auth/main"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "http://localhost:3001"

async function getHeaders() {
    const session = await getSession()
    const token = session.accessToken
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
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

export async function getEventById(id: string): Promise<AcademicEvent | null> {
    try {
        const res = await fetch(`${API_URL}/events/${id}`, {
            headers: await getHeaders(),
            cache: "no-store"
        })
        if (!res.ok) return null
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch event", error)
        return null
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

        revalidatePath("/admin-dashboard/events")
        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Event created successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

export async function deleteEvent(id: string): Promise<ApiResponse> {
    try {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: "DELETE",
            headers: await getHeaders(),
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to delete event" }
        }

        revalidatePath("/admin-dashboard/events")
        revalidatePath("/admin-dashboard/academics")
        return { success: true, message: "Event deleted successfully" }
    } catch {
        return { success: false, message: "Network error occurred" }
    }
}

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
