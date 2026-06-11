import { useEffect } from "react";
import { messaging, getToken, onMessage } from "@/lib/firebase";
import UserAPI from "@/app/services/UserAPI";
import { toast } from "react-hot-toast";

export const useNotification = (userId) => {
    useEffect(() => {
        if (typeof window === "undefined" || !userId || !messaging) return;

        const requestPermissionAndGetToken = async () => {
            try {
                const permission = await Notification.requestPermission();

                if (permission === "granted") {
                    const token = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });

                    // Log Token for debugging
                    console.log("--- FCM TOKEN DEBUG ---");
                    console.log("VAPID Key used:", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
                    console.log("Token:", token);
                    console.log("-----------------------");

                    if (token) {
                        await UserAPI.updateFCMtoken({ fcmToken: token });
                        console.log("✅ FCM Token successfully saved to Database");
                    }
                }
            } catch (error) {
                console.error("❌ Error retrieving FCM token:", error);
            }
        };

        requestPermissionAndGetToken();

        // 4. Handle foreground messages
        // ... inside your onMessage listener in useNotification.js
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("🔔 NEW NOTIFICATION RECEIVED", payload);

            if (payload.data?.type === "VIDEO_CALL_INCOMING") {
                // 1. Create a custom event with the call data
                const callEvent = new CustomEvent("fcm-incoming-call", {
                    detail: payload.data
                });

                // 2. Dispatch it globally
                window.dispatchEvent(callEvent);

                // 3. Optional: Show a small toast as well
                toast.success(`Incoming call from ${payload.data.callerName}`);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);
};