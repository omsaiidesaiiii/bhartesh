'use server';

import { secureApiClient } from '../../../lib/secure-api';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { ironSessionOptions } from '../../../lib/sessionLib';

interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  accessToken?: string;
  username?: string;
  name?: string;
  email?: string;
  roles?: string[];
}

import { ProfileData, StudentProfileWithCourses } from '../../../lib/types/profile';

/**
 * Get current user's profile
 * Works for all authenticated users
 */
export async function getMyProfile(): Promise<{
  success: boolean;
  data?: ProfileData;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, ironSessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const response = await secureApiClient.get<ProfileData>('/profile/me');

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      error: 'Failed to fetch profile',
    };
  }
}

/**
 * Get current student's profile and enrolled courses
 * Only works for authenticated students
 */
export async function getStudentProfileWithCourses(): Promise<{
  success: boolean;
  data?: StudentProfileWithCourses;
  error?: string;
}> {
  try {
    // Get session to check user role
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, ironSessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if user is a student
    if (session.roles?.[0] !== 'STUDENT') {
      return {
        success: false,
        error: 'This endpoint is only available for students',
      };
    }

    // Fetch profile data with courses
    const profileResponse = await secureApiClient.get<StudentProfileWithCourses>('/profile/me/courses');

    if (profileResponse.error) {
      return {
        success: false,
        error: profileResponse.error,
      };
    }

    return {
      success: true,
      data: profileResponse.data,
    };
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return {
      success: false,
      error: 'Failed to fetch profile data',
    };
  }
}

/**
 * Update current user's profile
 * Works for all authenticated users
 */
export async function updateMyProfile(profileData: {
  bio?: string;
  location?: string;
  regno?: string;
  gender?: string;
  address?: string;
  dob?: string;
}): Promise<{
  success: boolean;
  data?: ProfileData;
  error?: string;
}> {
  try {
    // Get session to check user role
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, ironSessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }


    // Convert dob to ISO string if provided
    const updateData = {
      ...profileData,
      DOB: profileData.dob ? new Date(profileData.dob).toISOString() : undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const response = await secureApiClient.put<ProfileData>('/profile/me', updateData);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
}

/**
 * Legacy alias for updateMyProfile
 */
export const updateStudentProfile = updateMyProfile;

/**
 * Get current student's regno
 * Only works for authenticated students
 */
export async function getStudentRegno(): Promise<{
  success: boolean;
  regno?: string;
  error?: string;
}> {
  try {
    // Get session to check user role
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, ironSessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if user is a student
    if (session.roles?.[0] !== 'STUDENT') {
      return {
        success: false,
        error: 'This endpoint is only available for students',
      };
    }

    // Fetch profile data
    const profileResponse = await secureApiClient.get<ProfileData>('/profile/me');

    if (profileResponse.error) {
      return {
        success: false,
        error: profileResponse.error,
      };
    }

    return {
      success: true,
      regno: profileResponse.data?.regno,
    };
  } catch (error) {
    console.error('Error fetching student regno:', error);
    return {
      success: false,
      error: 'Failed to fetch regno',
    };
  }
}