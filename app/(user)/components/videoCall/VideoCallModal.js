import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, onSnapshot, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI'; 
import { toast } from 'react-hot-toast';

const servers = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
    iceCandidatePoolSize: 10,
};

export default function VideoCallModal({ callId, onClose, callerName, role = 'caller' }) {
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStartedAt, setCallStartedAt] = useState(null); 

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pc = useRef(null);
    const isEnding = useRef(false); 
    const localStreamRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        let unsubscribes = [];

        const setupCall = async () => {
            try {
                // 1. Initialize Peer Connection
                pc.current = new RTCPeerConnection(servers);

                // 2. Get Media Stream
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                
                setLocalStream(stream);
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // 3. Add tracks to Peer Connection BEFORE creating offer/answer
                stream.getTracks().forEach((track) => {
                    pc.current.addTrack(track, stream);
                });

                // 4. Setup Remote Stream Handling
                pc.current.ontrack = (event) => {
                    console.log("📡 Remote track received:", event.streams[0]);
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setCallStartedAt(prev => prev || Date.now());
                    }
                };

                // Debug connection state
                pc.current.oniceconnectionstatechange = () => {
                    console.log("Connection State:", pc.current.iceConnectionState);
                    if (pc.current.iceConnectionState === 'disconnected') {
                        handleCloseUI();
                    }
                };

                // 5. Firestore Signaling Refs
                const callDoc = doc(db, 'calls', callId);
                const offerCandidates = collection(callDoc, 'offerCandidates');
                const answerCandidates = collection(callDoc, 'answerCandidates');

                // 6. Handle ICE Candidates
                pc.current.onicecandidate = (event) => {
                    if (event.candidate && isMounted) {
                        const candidateCol = role === 'caller' ? offerCandidates : answerCandidates;
                        addDoc(candidateCol, event.candidate.toJSON());
                    }
                };

                if (role === 'caller') {
                    // --- DOCTOR LOGIC ---
                    const offerDescription = await pc.current.createOffer();
                    await pc.current.setLocalDescription(offerDescription);
                    
                    await setDoc(callDoc, {
                        offer: { sdp: offerDescription.sdp, type: offerDescription.type },
                        callerName,
                        status: 'initiated',
                        createdAt: Date.now()
                    });

                    // Listen for Answer
                    unsubscribes.push(onSnapshot(callDoc, (snapshot) => {
                        const data = snapshot.data();
                        if (pc.current && !pc.current.currentRemoteDescription && data?.answer) {
                            const answerDesc = new RTCSessionDescription(data.answer);
                            pc.current.setRemoteDescription(answerDesc);
                        }
                        if (data?.status === 'completed') handleCloseUI();
                    }));

                    // Listen for Patient's ICE Candidates
                    unsubscribes.push(onSnapshot(answerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added' && pc.current?.remoteDescription) {
                                pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                            }
                        });
                    }));

                } else {
                    // --- PATIENT LOGIC ---
                    const callSnapshot = await getDoc(callDoc);
                    if (!callSnapshot.exists()) return onClose();

                    const callData = callSnapshot.data();
                    
                    // Set Remote Offer
                    await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));

                    // Create Answer
                    const answerDescription = await pc.current.createAnswer();
                    await pc.current.setLocalDescription(answerDescription);

                    await updateDoc(callDoc, {
                        answer: { sdp: answerDescription.sdp, type: answerDescription.type },
                        status: 'accepted'
                    });

                    // Listen for Doctor ending call
                    unsubscribes.push(onSnapshot(callDoc, (snapshot) => {
                        const data = snapshot.data();
                        if (data?.status === 'completed') handleCloseUI();
                    }));

                    // Listen for Doctor's ICE Candidates
                    unsubscribes.push(onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added' && pc.current?.remoteDescription) {
                                pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                            }
                        });
                    }));
                }
            } catch (err) {
                console.error("WebRTC Error:", err);
                onClose();
            }
        };

        setupCall();

        return () => {
            isMounted = false;
            unsubscribes.forEach(unsub => unsub());
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
            if (pc.current) pc.current.close();
        };
    }, [callId, role]);

    const handleCloseUI = () => {
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        onClose();
    };

    const handleHangupClick = async () => {
        if (isEnding.current) return;
        isEnding.current = true;
        try {
            const duration = callStartedAt ? Math.floor((Date.now() - callStartedAt) / 1000) : 0;
            await DoctorAPI.endVideoCall({ callId, totalDurationInSeconds: duration });
            await updateDoc(doc(db, 'calls', callId), { status: 'completed' });
        } catch (error) {
            console.error(error);
        } finally {
            handleCloseUI();
        }
    };

    const toggleMic = () => {
        const track = localStream?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        }
    };

    const toggleVideo = () => {
        const track = localStream?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideoOff(!track.enabled);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[999] flex flex-col overflow-hidden">
            <div className="relative flex-1 flex items-center justify-center bg-slate-900">
                {/* REMOTE VIDEO (The other person) */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-contain" 
                />

                {/* LOCAL VIDEO (Self) */}
                <div className="absolute top-6 right-6 w-32 md:w-56 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-black">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <FaVideoSlash className="text-white/40" size={30} />
                        </div>
                    )}
                </div>

                <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
                        {role === 'caller' ? 'Calling...' : `Live: ${callerName}`}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="h-32 bg-slate-900 flex items-center justify-center gap-6">
                <button onClick={toggleMic} className={`p-5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/10 text-white'}`}>
                    {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                </button>
                <button onClick={handleHangupClick} className="p-6 rounded-full bg-red-500 text-white shadow-xl">
                    <FaPhoneSlash size={28} />
                </button>
                <button onClick={toggleVideo} className={`p-5 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-white/10 text-white'}`}>
                    {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
                </button>
            </div>
        </div>
    );
}