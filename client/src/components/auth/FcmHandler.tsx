"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { requestFcmToken, sendTokenToServer } from "@/lib/fcm";

export function FcmHandler() {
    const { user, token, isAuthenticated } = useAuth();
    const registrationAttempted = useRef(false);

    useEffect(() => {
        // Only attempt registration if authenticated and not already attempted in this session
        if (isAuthenticated && user && token && !registrationAttempted.current) {
            const registerFCM = async () => {
                registrationAttempted.current = true;

                console.log("Attempting to register FCM for user:", user.id);
                const fcmToken = await requestFcmToken();

                if (fcmToken) {
                    await sendTokenToServer(fcmToken, user.id, token);
                }
            };

            // Small delay to ensure everything is loaded
            const timer = setTimeout(registerFCM, 2000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user, token]);

    return null; // This is a logic-only component
}
