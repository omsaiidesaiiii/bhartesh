import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { ironSessionOptions } from '@/lib/sessionLib';

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
    const session = await getIronSession<SessionData>(request, new NextResponse(), ironSessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Forward the request to the backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        message,
        chatHistory: chatHistory || [],
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.message || 'AI service error' },
        { status: backendResponse.status }
      );
    }

    const aiResponse = await backendResponse.json();
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}