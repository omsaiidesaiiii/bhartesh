import { getToken } from "firebase/messaging";
import { messaging, isSupported } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and return the token
 */
export async function requestFcmToken(): Promise<string | null> {
    const supported = await isSupported();
    if (!supported || !messaging) {
        console.log("FCM is not supported in this browser.");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission denied.");
            return null;
        }

        if (!VAPID_KEY && process.env.NODE_ENV === 'development') {
            console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing. FCM might not work correctly in all browsers.");
        }

        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
        });

        console.log("FCM token generated successfully.");
        return token;
    } catch (error: any) {
        console.error("Error getting FCM token:", error);
        if (error?.message?.includes('API key not valid')) {
            console.error("CRITICAL: The Firebase API key provided in your environment variables is invalid. Please check your .env.local file.");
        }
        return null;
    }
}

/**
 * Send the FCM token to the server to be stored
 */
export async function sendTokenToServer(token: string, userId: string, accessToken: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001"}/fcm/upsert-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                token,
                userId,
                deviceId: navigator.userAgent, // Simplified device ID
                deviceType: "WEB",
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to send token to server");
        }

        console.log("FCM token successfully registered on server.");
        return true;
    } catch (error) {
        console.error("Error sending FCM token to server:", error);
        return false;
    }
}
