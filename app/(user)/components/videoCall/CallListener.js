'use client'
import React, { useEffect, useState, useRef } from 'react';
import UserAPI from '@/app/services/UserAPI';
import IncomingCallModal from './IncomingCallModal';
import VideoCallModal from './VideoCallModal';

export default function CallListener() {
    const [incomingCall, setIncomingCall] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const audioRef = useRef(null);

    const playRingtone = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/ringtone.mp3');
            audioRef.current.loop = true;
        }
        audioRef.current.play().catch(() => console.log("Audio blocked"));
    };

    const stopRingtone = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };


    useEffect(() => {
        // --- NEW: LISTEN FOR INSTANT FCM EVENT ---
        const handleFcmCall = (event) => {
            const callData = event.detail;
            console.log("Instant UI Trigger via FCM:", callData);
            if (!isCallActive) {
                // Map FCM data to the format your Modal expects
                setIncomingCall({
                    callId: callData.callId,
                    callerName: callData.callerName,
                    doctorProfileImage: "/default-doctor.png", // Fallback
                    speciality: "Doctor"
                });
                playRingtone();
            }
        };

        window.addEventListener("fcm-incoming-call", handleFcmCall);
        // ------------------------------------------

        const checkCall = async () => {
            if (isCallActive) return;
            try {
                const res = await UserAPI.getVideoCallNotification();
                if (res && res.success && res.hasActiveCall) {
                    if (!incomingCall) {
                        setIncomingCall(res.callData);
                        playRingtone();
                    }
                } else {
                    if (incomingCall) {
                        stopRingtone();
                        setIncomingCall(null);
                    }
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        };

        const interval = setInterval(checkCall, 5000);

        return () => {
            clearInterval(interval);
            window.removeEventListener("fcm-incoming-call", handleFcmCall);
            stopRingtone();
        };
    }, [incomingCall, isCallActive]);

    const handleAccept = async () => {
        stopRingtone(); // Stop the ringing sound

        try {
            // 1. (Optional but recommended) Tell backend the call is accepted
            // This stops the doctor's "Ringing..." state and starts their timer
            await UserAPI.respondToVideoCall({
                callId: incomingCall.callId,
                status: 'accepted'
            });

            // 2. Switch to Video UI
            setIsCallActive(true);

            console.log("✅ Call Accepted. Starting WebRTC handshake...");
        } catch (error) {
            console.error("Error accepting call:", error);
        }
    };

    const handleReject = async () => {
        stopRingtone();
        if (incomingCall) {
            await UserAPI.respondToVideoCall({
                callId: incomingCall.callId,
                status: 'rejected'
            });
        }
        setIncomingCall(null);
    };

    return (
        <>
            {incomingCall && !isCallActive && (
                <IncomingCallModal
                    callData={incomingCall}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            )}

            {isCallActive && incomingCall && (
                <VideoCallModal
                    callId={incomingCall.callId}
                    callerName={incomingCall.callerName}
                    role="receiver"
                    onClose={() => {
                        setIsCallActive(false);
                        setIncomingCall(null);
                    }}
                />
            )}
        </>
    );
}