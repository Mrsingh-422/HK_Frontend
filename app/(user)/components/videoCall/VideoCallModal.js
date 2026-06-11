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
    const localStreamRef = useRef(null); // Ref to access stream in cleanup reliably

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

                // 3. Add tracks to Peer Connection
                stream.getTracks().forEach((track) => {
                    if (pc.current && pc.current.signalingState !== 'closed') {
                        pc.current.addTrack(track, stream);
                    }
                });

                // 4. Setup Remote Stream
                const remote = new MediaStream();
                pc.current.ontrack = (event) => {
                    console.log("Remote track received");
                    event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;

                    // Functional update to avoid stale closures
                    setCallStartedAt(prev => prev || Date.now());
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
                    // DOCTOR LOGIC (Offer)
                    const offerDescription = await pc.current.createOffer();
                    await pc.current.setLocalDescription(offerDescription);
                    
                    await setDoc(callDoc, {
                        offer: { sdp: offerDescription.sdp, type: offerDescription.type },
                        callerName,
                        status: 'initiated',
                        createdAt: Date.now()
                    });

                    // Listen for Patient's Answer
                    unsubscribes.push(onSnapshot(callDoc, (snapshot) => {
                        const data = snapshot.data();
                        if (pc.current && !pc.current.currentRemoteDescription && data?.answer) {
                            pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                        }
                        if (data?.status === 'completed') handleCloseUI();
                    }));

                    // Listen for Patient's ICE Candidates
                    unsubscribes.push(onSnapshot(answerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added' && pc.current?.remoteDescription) {
                                pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(e => console.error(e));
                            }
                        });
                    }));

                } else {
                    // PATIENT LOGIC (Answer)
                    const callSnapshot = await getDoc(callDoc);
                    if (!callSnapshot.exists()) {
                        toast.error("Call session not found");
                        return onClose();
                    }

                    const callData = callSnapshot.data();
                    await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));

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
                                pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(e => console.error(e));
                            }
                        });
                    }));
                }
            } catch (err) {
                console.error("WebRTC Setup Error:", err);
                toast.error("Camera/Microphone access denied or error occurred");
                onClose();
            }
        };

        setupCall();

        return () => {
            isMounted = false;
            unsubscribes.forEach(unsub => unsub());
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (pc.current) {
                pc.current.close();
            }
        };
    }, [callId, role]);

    const handleCloseUI = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        onClose();
    };

    const handleHangupClick = async () => {
        if (isEnding.current) return;
        isEnding.current = true;

        try {
            const endTime = Date.now();
            const duration = callStartedAt ? Math.floor((endTime - callStartedAt) / 1000) : 0;

            // 1. Notify Backend
            await DoctorAPI.endVideoCall({
                callId: callId,
                totalDurationInSeconds: duration
            });

            // 2. Notify Firestore (so other side closes)
            const callDoc = doc(db, 'calls', callId);
            await updateDoc(callDoc, { status: 'completed' });

            toast.success("Call ended");
        } catch (error) {
            console.error("Error ending call:", error);
        } finally {
            handleCloseUI();
        }
    };

    const toggleMic = () => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[999] flex flex-col overflow-hidden">
            <div className="relative flex-1 flex items-center justify-center bg-gray-900">
                {/* Remote Video */}
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />

                {/* Local Video (Floating) */}
                <div className="absolute top-6 right-6 w-32 md:w-56 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-black">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <FaVideoSlash className="text-white/40" size={30} />
                        </div>
                    )}
                </div>

                {/* Info Overlay */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
                        {role === 'caller' ? 'Calling Patient...' : `In Call with ${callerName}`}
                    </p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="h-32 bg-slate-900/50 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-6 px-4">
                <button 
                    onClick={toggleMic} 
                    className={`p-5 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                </button>

                <button 
                    onClick={handleHangupClick} 
                    className="p-6 rounded-full bg-red-500 text-white hover:scale-110 transition-all shadow-xl shadow-red-500/20"
                >
                    <FaPhoneSlash size={28} />
                </button>

                <button 
                    onClick={toggleVideo} 
                    className={`p-5 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
                </button>
            </div>
        </div>
    );
}