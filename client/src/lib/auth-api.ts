import type { AuthUser, AuthResponse, ActionResult } from "./auth-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001";

/**
 * Login with credentials (Admin/Staff)
 * @param email - User email
 * @param password - User password
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<ActionResult<AuthResponse>> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Invalid credentials",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
}

/**
 * Login with Firebase ID token (Students)
 * @param idToken - Firebase ID token from Google Sign-In
 */
export async function loginWithFirebase(
  idToken: string
): Promise<ActionResult<AuthResponse>> {
  try {
    const response = await fetch(`${API_URL}/auth/firebase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Authentication failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Firebase login error:", error);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
}

/**
 * Refresh access token
 * @param token - Current JWT token
 */
export async function refreshToken(
  token: string
): Promise<ActionResult<AuthResponse>> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Token refresh failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: "Failed to refresh token",
    };
  }
}

/**
 * Validate token and get user info
 * @param token - JWT token to validate
 */
export async function validateToken(
  token: string
): Promise<ActionResult<{ valid: boolean; user?: AuthUser }>> {
  try {
    const response = await fetch(`${API_URL}/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: "Token validation failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return {
      success: false,
      error: "Failed to validate token",
    };
  }
}

/**
 * Get current user profile (requires auth)
 * @param token - JWT access token
 */
export async function getCurrentUser(
  token: string
): Promise<ActionResult<AuthUser>> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to get user profile",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: "Failed to get user profile",
    };
  }
}

/**
 * Create staff member (Admin only)
 * @param token - Admin JWT token
 * @param staffData - Staff creation data
 */
export async function createStaff(
  token: string,
  staffData: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
  }
): Promise<ActionResult<AuthUser>> {
  try {
    const response = await fetch(`${API_URL}/auth/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to create staff",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Create staff error:", error);
    return {
      success: false,
      error: "Failed to create staff member",
    };
  }
}

// Re-export types for convenience
export type { AuthUser, AuthResponse, ActionResult } from "./auth-types";
