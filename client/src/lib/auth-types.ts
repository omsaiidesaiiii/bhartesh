/**
 * User response type from auth endpoints
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: "ADMIN" | "STAFF" | "STUDENT";
  isActive: boolean;
  profileImageUrl?: string;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  token: string;
  access_token: string;
  user: AuthUser;
}

/**
 * Action result wrapper
 */
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
