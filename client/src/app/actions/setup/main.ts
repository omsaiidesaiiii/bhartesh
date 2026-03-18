"use server";

import { secureApiClient } from '@/lib/secure-api';
import type { ActionResult } from '@/lib/auth-types';
import type { Department, CreateDepartmentData, UpdateDepartmentData } from './types';

// Re-export types for convenience
export type { Department, CreateDepartmentData, UpdateDepartmentData, DepartmentStatus, DepartmentUser } from './types';

// ==================== DEPARTMENT CRUD ====================

/**
 * Fetch all departments
 */
export async function fetchDepartments(): Promise<ActionResult<Department[]>> {
  try {
    const response = await secureApiClient.get<Department[]>('/setup/departments');

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
    console.error('Fetch departments error:', error);
    return {
      success: false,
      error: 'Failed to fetch departments',
    };
  }
}

/**
 * Fetch a single department by ID
 */
export async function fetchDepartmentById(id: string): Promise<ActionResult<Department>> {
  try {
    const response = await secureApiClient.get<Department>(`/setup/departments/${id}`);

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
    console.error('Fetch department error:', error);
    return {
      success: false,
      error: 'Failed to fetch department',
    };
  }
}

/**
 * Create a new department
 */
export async function createDepartment(data: CreateDepartmentData): Promise<ActionResult<Department>> {
  try {
    const response = await secureApiClient.post<Department>('/setup/departments', data);

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
    console.error('Create department error:', error);
    return {
      success: false,
      error: 'Failed to create department',
    };
  }
}

/**
 * Update a department
 */
export async function updateDepartment(id: string, data: UpdateDepartmentData): Promise<ActionResult<Department>> {
  try {
    const response = await secureApiClient.put<Department>(`/setup/departments/${id}`, data);

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
    console.error('Update department error:', error);
    return {
      success: false,
      error: 'Failed to update department',
    };
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(id: string): Promise<ActionResult<void>> {
  try {
    const response = await secureApiClient.delete<void>(`/setup/departments/${id}`);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete department error:', error);
    return {
      success: false,
      error: 'Failed to delete department',
    };
  }
}
