import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { ironSessionOptions } from '@/lib/sessionLib';
import { loginWithCredentials, loginWithFirebase } from '@/lib/auth-api';

interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  accessToken?: string;
  username?: string;
  name?: string;
  email?: string;
  roles?: string[];
  profileImageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, firebaseToken } = await request.json();

    if (action === 'login') {
      let result;

      if (email && password) {
        // Credential login
        result = await loginWithCredentials(email, password);
      } else if (firebaseToken) {
        // Firebase login
        result = await loginWithFirebase(firebaseToken);
      } else {
        return NextResponse.json({ error: 'Invalid login data' }, { status: 400 });
      }

      if (result.success && result.data) {
        // Create response first
        const response = NextResponse.json({
          success: true,
          user: result.data.user,
          token: result.data.access_token,
          redirectUrl: (() => {
            const roleRedirects = {
              ADMIN: '/admin-dashboard',
              STAFF: '/staff/dashboard',
              STUDENT: '/student/dashboard'
            };
            return roleRedirects[result.data.user.role as keyof typeof roleRedirects] || '/admin-dashboard';
          })()
        });

        // Get session with the response object
        const session = await getIronSession<SessionData>(request, response, ironSessionOptions);

        // Store user data in session
        session.isLoggedIn = true;
        session.userId = result.data.user.id;
        session.accessToken = result.data.access_token;
        session.username = result.data.user.username;
        session.name = result.data.user.name;
        session.email = result.data.user.email;
        session.roles = [result.data.user.role];
        session.profileImageUrl = result.data.user.profileImageUrl;

        // Save session (this will set cookies on the response)
        await session.save();

        return response;
      } else {
        return NextResponse.json({
          success: false,
          error: result.error || 'Login failed'
        }, { status: 401 });
      }
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      const session = await getIronSession<SessionData>(request, response, ironSessionOptions);
      await session.destroy();
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // First check if there's a session
    const tempResponse = NextResponse.next();
    const tempSession = await getIronSession<SessionData>(request, tempResponse, ironSessionOptions);

    const data = tempSession.isLoggedIn ? {
      authenticated: true,
      user: {
        id: tempSession.userId,
        username: tempSession.username,
        name: tempSession.name,
        email: tempSession.email,
        role: tempSession.roles?.[0] || 'STUDENT', // Singular role for compatibility
        roles: tempSession.roles,
        profileImageUrl: tempSession.profileImageUrl,
        token: tempSession.accessToken, // Pass token to client side
      }
    } : {
      authenticated: false
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}