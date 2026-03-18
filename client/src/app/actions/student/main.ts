"use server";

import { secureApiClient } from '@/lib/secure-api';
import type { ActionResult } from '@/lib/auth-types';
import type {
    Student,
    StudentsResponse,
    StudentStats,
    CreateStudentData,
    UpdateStudentData,
    BulkPromoteData
} from './types';

/**
 * Fetch students with pagination and filters
 */
export async function fetchStudents(
    page: number = 1,
    limit: number = 10,
    search?: string,
    courseId?: string
): Promise<ActionResult<StudentsResponse>> {
    try {
        let url = `/students?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (courseId) url += `&courseId=${courseId}`;

        const response = await secureApiClient.get<StudentsResponse>(url);

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Fetch students error:', error);
        return { success: false, error: 'Failed to fetch students' };
    }
}

/**
 * Fetch student statistics
 */
export async function fetchStudentStats(): Promise<ActionResult<StudentStats>> {
    try {
        const response = await secureApiClient.get<StudentStats>('/students/stats');

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Fetch student stats error:', error);
        return { success: false, error: 'Failed to fetch student stats' };
    }
}

/**
 * Fetch a single student by ID
 */
export async function fetchStudentById(studentId: string): Promise<ActionResult<Student>> {
    try {
        const response = await secureApiClient.get<Student>(`/students/${studentId}`);

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Fetch student by ID error:', error);
        return { success: false, error: 'Failed to fetch student details' };
    }
}

/**
 * Create a new student (Admin only)
 */
export async function createStudent(data: CreateStudentData): Promise<ActionResult<Student>> {
    try {
        const response = await secureApiClient.post<Student>('/students', data);

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Create student error:', error);
        return { success: false, error: 'Failed to create student' };
    }
}

/**
 * Bulk create students (Admin only)
 */
export async function bulkCreateStudents(data: CreateStudentData[]): Promise<ActionResult<{ success: number; failed: number; errors: any[] }>> {
    try {
        const response = await secureApiClient.post<{ success: number; failed: number; errors: any[] }>('/students/bulk', data);

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Bulk create students error:', error);
        return { success: false, error: 'Failed to bulk create students' };
    }
}

/**
 * Update student details (Admin only)
 */
export async function updateStudent(id: string, data: UpdateStudentData): Promise<ActionResult<Student>> {
    try {
        const response = await secureApiClient.patch<Student>(`/students/${id}`, data);

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Update student error:', error);
        return { success: false, error: 'Failed to update student' };
    }
}

/**
 * Bulk promote students (Admin only)
 */
export async function bulkPromoteStudents(data: BulkPromoteData): Promise<ActionResult<any>> {
    try {
        const response = await secureApiClient.post<any>('/students/bulk-promote', data);

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Bulk promote error:', error);
        return { success: false, error: 'Failed to promote students' };
    }
}

/**
 * Update student section/semester (Admin only)
 */
export async function updateStudentSection(
    id: string,
    section: string,
    semester?: number
): Promise<ActionResult<any>> {
    try {
        const response = await secureApiClient.patch<any>(`/students/${id}/section`, { section, semester });

        if (response.error) {
            return { success: false, error: response.error };
        }

        return { success: true, data: response.data! };
    } catch (error) {
        console.error('Update section error:', error);
        return { success: false, error: 'Failed to update student section' };
    }
}
