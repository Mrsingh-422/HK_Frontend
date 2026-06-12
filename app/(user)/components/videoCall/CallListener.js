'use client'
import React, { useEffect, useState, useRef } from 'react';
import UserAPI from '@/app/services/UserAPI';
import IncomingCallModal from './IncomingCallModal';
import VideoCallModal from './VideoCallModal';
import { useAuth } from '@/app/context/AuthContext';

export default function CallListener() {
    const { user } = useAuth();
    const [incomingCall, setIncomingCall] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const audioRef = useRef(null);

    const playRingtone = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/ringtone.mp3');
            audioRef.current.loop = true;
        }

        // play() returns a promise
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented
                console.warn("🔊 Ringtone blocked by browser. User must interact with the page first.");

                // Optional: Show a small toast to the user
                toast("In-app audio is muted. Click anywhere to enable sound.", { icon: '🔇' });

                // We can try to play again as soon as the user clicks anywhere on the body
                const unlockAudio = () => {
                    audioRef.current.play();
                    window.removeEventListener('click', unlockAudio);
                };
                window.addEventListener('click', unlockAudio);
            });
        }
    };

    const stopRingtone = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    useEffect(() => {
        if (!user) return;

        // 1. Listen for Instant FCM Event
        const handleFcmCall = (event) => {
            const callData = event.detail;
            if (!isCallActive && !incomingCall) {
                setIncomingCall({
                    callId: callData.callId,
                    callerName: callData.callerName,
                    doctorProfileImage: callData.doctorProfileImage || "https://static.vecteezy.com/system/resources/thumbnails/026/375/249/small/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg",
                    speciality: callData.speciality || "Doctor"
                });
                playRingtone();
            }
        };

        window.addEventListener("fcm-incoming-call", handleFcmCall);

        // 2. Polling Backup
        const checkCall = async () => {
            if (isCallActive) return; // Don't poll if already in a call
            try {
                const res = await UserAPI.getVideoCallNotification();
                if (res && res.success && res.hasActiveCall) {
                    if (!incomingCall) {
                        setIncomingCall(res.callData);
                        playRingtone();
                    }
                } else {
                    // If API says no call, but we are showing ringing, stop it
                    if (incomingCall && !isCallActive) {
                        stopRingtone();
                        setIncomingCall(null);
                    }
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        };

        const interval = setInterval(checkCall, 15000);

        return () => {
            clearInterval(interval);
            window.removeEventListener("fcm-incoming-call", handleFcmCall);
            stopRingtone();
        };
    }, [user, incomingCall, isCallActive]);

    const handleAccept = async () => {
        stopRingtone();
        try {
            // Tell backend we accepted (Optional but recommended)
            await UserAPI.respondToVideoCall({
                callId: incomingCall.callId,
                status: 'accepted'
            });

            // TRIGGER THE VIDEO SCREEN
            setIsCallActive(true);
        } catch (error) {
            console.error("Accept Error:", error);
            setIsCallActive(true); // Still try to open video even if API fails
        }
    };

    const handleReject = async () => {
        stopRingtone();
        try {
            if (incomingCall) {
                await UserAPI.respondToVideoCall({
                    callId: incomingCall.callId,
                    status: 'rejected'
                });
            }
        } finally {
            setIncomingCall(null);
            setIsCallActive(false);
        }
    };

    return (
        <>
            {/* RINGING PHASE */}
            {incomingCall && !isCallActive && (
                <IncomingCallModal
                    callData={incomingCall}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            )}

            {/* VIDEO CALL PHASE */}
            {incomingCall && isCallActive && (
                <VideoCallModal
                    callId={incomingCall.callId}
                    callerName={incomingCall.callerName}
                    role="receiver" // Crucial for Patient side
                    onClose={() => {
                        setIsCallActive(false);
                        setIncomingCall(null);
                    }}
                />
            )}
        </>
    );
}