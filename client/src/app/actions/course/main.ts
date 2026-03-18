"use server";

import { secureApiClient } from '@/lib/secure-api';
import type { ActionResult } from '@/lib/auth-types';
import type { Course, CreateCourseData, UpdateCourseData } from './types';

// Re-export types for convenience
export type { Course, CreateCourseData, UpdateCourseData, CourseType, CourseStatus, CourseDepartment } from './types';

// ==================== COURSE CRUD ====================

/**
 * Fetch all courses with optional filters
 */
export async function fetchCourses(params?: {
  departmentId?: string;
  status?: string;
  type?: string;
}): Promise<ActionResult<Course[]>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.append('departmentId', params.departmentId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);

    const queryString = searchParams.toString();
    const url = `/courses${queryString ? `?${queryString}` : ''}`;

    const response = await secureApiClient.get<Course[]>(url);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data!,
    };
  } catch (error) {
    console.error('Fetch courses error:', error);
    return {
      success: false,
      error: 'Failed to fetch courses',
    };
  }
}

/**
 * Fetch a single course by ID
 */
export async function fetchCourseById(id: string): Promise<ActionResult<Course>> {
  try {
    const response = await secureApiClient.get<Course>(`/courses/${id}`);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data!,
    };
  } catch (error) {
    console.error('Fetch course error:', error);
    return {
      success: false,
      error: 'Failed to fetch course',
    };
  }
}

/**
 * Fetch courses by department
 */
export async function fetchCoursesByDepartment(departmentId: string): Promise<ActionResult<Course[]>> {
  try {
    const response = await secureApiClient.get<Course[]>(`/courses/department/${departmentId}`);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data!,
    };
  } catch (error) {
    console.error('Fetch courses by department error:', error);
    return {
      success: false,
      error: 'Failed to fetch courses by department',
    };
  }
}

/**
 * Create a new course
 */
export async function createCourse(data: CreateCourseData): Promise<ActionResult<Course>> {
  try {
    const response = await secureApiClient.post<Course>('/courses', data);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data!,
    };
  } catch (error) {
    console.error('Create course error:', error);
    return {
      success: false,
      error: 'Failed to create course',
    };
  }
}

/**
 * Update a course
 */
export async function updateCourse(id: string, data: UpdateCourseData): Promise<ActionResult<Course>> {
  try {
    const response = await secureApiClient.put<Course>(`/courses/${id}`, data);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data!,
    };
  } catch (error) {
    console.error('Update course error:', error);
    return {
      success: false,
      error: 'Failed to update course',
    };
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<ActionResult<void>> {
  try {
    const response = await secureApiClient.delete<void>(`/courses/${id}`);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Delete course error:', error);
    return {
      success: false,
      error: 'Failed to delete course',
    };
  }
}
