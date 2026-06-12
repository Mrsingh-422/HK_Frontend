import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, onSnapshot, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI'; 
import { toast } from 'react-hot-toast';

const servers = {
    iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
    ],
    iceCandidatePoolSize: 10,
};

export default function VideoCallModal({ callId, onClose, callerName, role = 'caller' }) {
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connState, setConnState] = useState('Initializing...'); 
    const [remoteStreamReceived, setRemoteStreamReceived] = useState(false);
    const [callTimer, setCallTimer] = useState(0);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pc = useRef(null);
    const isEnding = useRef(false);
    const localStreamRef = useRef(null);

    // Call duration timer effect
    useEffect(() => {
        if (!remoteStreamReceived) return;
        const interval = setInterval(() => {
            setCallTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [remoteStreamReceived]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let isMounted = true;
        let unsubscribes = [];

        const setupCall = async () => {
            try {
                console.log(`🚀 Starting Call as ${role}...`);
                pc.current = new RTCPeerConnection(servers);

                // 1. Get Media
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                
                localStreamRef.current = stream;
                setLocalStream(stream);
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // 2. Add Tracks BEFORE creating Offer/Answer
                stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

                // 3. Handle Remote Stream
                pc.current.ontrack = (event) => {
                    console.log("💎 REMOTE TRACK RECEIVED!");
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setRemoteStreamReceived(true);
                    }
                };

                // 4. Monitor Connection State
                pc.current.oniceconnectionstatechange = () => {
                    console.log("📡 Connection State:", pc.current.iceConnectionState);
                    if (isMounted) setConnState(pc.current.iceConnectionState);
                };

                // 5. Signaling Setup
                const callDoc = doc(db, 'calls', callId);
                const offerCandidates = collection(callDoc, 'offerCandidates');
                const answerCandidates = collection(callDoc, 'answerCandidates');

                pc.current.onicecandidate = (event) => {
                    if (event.candidate && isMounted) {
                        console.log("🧊 Sending ICE Candidate...");
                        const col = role === 'caller' ? offerCandidates : answerCandidates;
                        addDoc(col, event.candidate.toJSON());
                    }
                };

                if (role === 'caller') {
                    // --- CALLER FLOW ---
                    const offerDescription = await pc.current.createOffer();
                    await pc.current.setLocalDescription(offerDescription);
                    
                    await setDoc(callDoc, {
                        offer: { sdp: offerDescription.sdp, type: offerDescription.type },
                        callerName,
                        status: 'initiated'
                    });

                    unsubscribes.push(onSnapshot(callDoc, (snapshot) => {
                        const data = snapshot.data();
                        if (pc.current && !pc.current.currentRemoteDescription && data?.answer) {
                            console.log("✅ Answer Received!");
                            pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                        }
                        if (data?.status === 'completed') handleCloseUI();
                    }));

                    unsubscribes.push(onSnapshot(answerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added' && pc.current?.remoteDescription) {
                                pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                            }
                        });
                    }));

                } else {
                    // --- RECEIVER FLOW ---
                    console.log("📥 Fetching Offer...");
                    const callSnapshot = await getDoc(callDoc);
                    if (!callSnapshot.exists()) return onClose();

                    const callData = callSnapshot.data();
                    await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));

                    const answerDescription = await pc.current.createAnswer();
                    await pc.current.setLocalDescription(answerDescription);

                    await updateDoc(callDoc, {
                        answer: { sdp: answerDescription.sdp, type: answerDescription.type },
                        status: 'accepted'
                    });

                    unsubscribes.push(onSnapshot(callDoc, (snapshot) => {
                        if (snapshot.data()?.status === 'completed') handleCloseUI();
                    }));

                    unsubscribes.push(onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added' && pc.current?.remoteDescription) {
                                pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                            }
                        });
                    }));
                }
            } catch (err) {
                console.error("❌ WebRTC Error:", err);
                onClose();
            }
        };

        setupCall();
        return () => {
            isMounted = false;
            unsubscribes.forEach(u => u());
            if (pc.current) pc.current.close();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [callId, role]);

    const handleCloseUI = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        onClose();
    };

    const handleHangup = async () => {
        if (isEnding.current) return;
        isEnding.current = true;
        try {
            await updateDoc(doc(db, 'calls', callId), { status: 'completed' });
            await DoctorAPI.endVideoCall({ callId, totalDurationInSeconds: callTimer });
        } catch (err) {
            console.error("❌ Error ending call API:", err);
        } finally {
            handleCloseUI();
        }
    };

    const handleToggleMute = () => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const handleToggleVideo = () => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    return (
        <div className="fixed inset-0 h-[100dvh] w-screen bg-slate-950 z-[999] flex flex-col overflow-hidden font-sans select-none">
            
            {/* MAIN VIDEO VIEWPORT CANVAS */}
            <div className="relative flex-1 min-h-0 w-full bg-slate-950 overflow-hidden">
                
                {/* REMOTE STREAM (FULLSCREEN CANVAS) */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    webkit-playsinline="true"
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                />

                {/* SLATE SHADOW GRADIENT TO IMPROVE BUTTON CONTRAST */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

                {/* FLOATING STATUS PILL OVERLAY (TOP-LEFT) */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
                    <div className="flex items-center gap-2 bg-slate-900/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-white text-[11px] font-black tracking-widest uppercase">
                            {remoteStreamReceived ? `Live • ${formatTimer(callTimer)}` : 'Connecting'}
                        </p>
                    </div>
                    {callerName && (
                        <p className="text-white/80 text-xs font-semibold px-3 drop-shadow-md">
                            With: {callerName}
                        </p>
                    )}
                </div>

                {/* SLEEK FLOATING PIP BUBBLE (TOP-RIGHT) */}
                <div className="absolute top-6 right-6 w-28 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl z-20 bg-slate-900 hover:border-emerald-500/50 transition-colors duration-300">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
                    />
                    {/* CAMERA OFF STATE AVATAR PLACEHOLDER */}
                    {isVideoOff && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                                <span className="text-white text-xs font-black uppercase">
                                    {callerName ? callerName[0] : 'U'}
                                </span>
                            </div>
                            <p className="text-white/40 text-[8px] uppercase tracking-wider font-extrabold mt-2">Camera Off</p>
                        </div>
                    )}
                </div>

                {/* PREMIUM INCOMING / RECONNECTING LOADER OVERLAY */}
                {!remoteStreamReceived && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md z-30">
                        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping"></div>
                            <div className="absolute inset-4 rounded-full bg-emerald-500/5 animate-pulse"></div>
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                <FaVideo className="text-[#08B36A] w-7 h-7 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-white text-lg font-black tracking-tight mb-1">Secure Medical Stream</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-extrabold">
                            {connState === 'connected' ? 'Securing feed...' : `Network: ${connState}`}
                        </p>
                        <p className="text-[#08B36A] text-xs font-semibold mt-4 animate-pulse uppercase tracking-wider">
                            Waiting for {role === 'caller' ? 'Patient' : 'Doctor'} to start...
                        </p>
                    </div>
                )}
            </div>

            {/* MODERN FLOATING CONTROL ISLAND PANEL */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center gap-6 shadow-2xl z-40 transition-all hover:bg-slate-900/95">
                
                {/* MICROPHONE MUTE KEY */}
                <button 
                    onClick={handleToggleMute} 
                    disabled={!localStream}
                    title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    className={`p-4 rounded-full transition-all duration-300 disabled:opacity-30 ${
                        isMuted 
                        ? 'bg-red-500 text-white hover:bg-red-600 scale-105 shadow-lg shadow-red-500/20' 
                        : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95'
                    }`}
                >
                    {isMuted ? (
                        <FaMicrophoneSlash className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                        <FaMicrophone className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                </button>

                {/* END CALL DISCONNECT KEY */}
                <button 
                    onClick={handleHangup} 
                    title="End Consultation"
                    className="p-5 rounded-full bg-red-500 text-white shadow-2xl hover:scale-110 active:scale-90 hover:bg-red-600 transition-all shadow-red-500/30"
                >
                    <FaPhoneSlash className="w-6 h-6 md:w-7 md:h-7" />
                </button>

                {/* VIDEO HIDE/SHOW KEY */}
                <button 
                    onClick={handleToggleVideo} 
                    disabled={!localStream}
                    title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                    className={`p-4 rounded-full transition-all duration-300 disabled:opacity-30 ${
                        isVideoOff 
                        ? 'bg-red-500 text-white hover:bg-red-600 scale-105 shadow-lg shadow-red-500/20' 
                        : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95'
                    }`}
                >
                    {isVideoOff ? (
                        <FaVideoSlash className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                        <FaVideo className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                </button>
            </div>
        </div>
    );
}