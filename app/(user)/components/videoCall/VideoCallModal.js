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
    const [connState, setConnState] = useState('Initializing...'); // Track connection state
    const [remoteStreamReceived, setRemoteStreamReceived] = useState(false);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pc = useRef(null);
    const isEnding = useRef(false);

    useEffect(() => {
        let isMounted = true;
        let unsubscribes = [];

        const setupCall = async () => {
            try {
                console.log(`🚀 Starting Call as ${role}...`);
                pc.current = new RTCPeerConnection(servers);

                // 1. Get Media
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isMounted) return stream.getTracks().forEach(t => t.stop());
                
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
        };
    }, [callId, role]);

    const handleCloseUI = () => {
        localStream?.getTracks().forEach(t => t.stop());
        onClose();
    };

    const handleHangup = async () => {
        if (isEnding.current) return;
        isEnding.current = true;
        try {
            await updateDoc(doc(db, 'calls', callId), { status: 'completed' });
            await DoctorAPI.endVideoCall({ callId, totalDurationInSeconds: 0 });
        } finally {
            handleCloseUI();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[999] flex flex-col overflow-hidden font-sans">
            <div className="relative flex-1 flex items-center justify-center bg-gray-900">
                {/* REMOTE VIDEO */}
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />

                {/* LOCAL VIDEO */}
                <div className="absolute top-6 right-6 w-32 md:w-56 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-black">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <FaVideoSlash className="text-white/40" size={30} />
                        </div>
                    )}
                </div>

                {/* CONNECTION STATUS BADGE */}
                {!remoteStreamReceived && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-black uppercase tracking-[0.4em] text-xs">
                                {connState === 'connected' ? 'Starting Stream...' : `Status: ${connState}`}
                            </p>
                            <p className="text-white/40 text-[10px] mt-2 uppercase">Waiting for {role === 'caller' ? 'Patient' : 'Doctor'}...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTROLS */}
            <div className="h-32 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center gap-8">
                <button onClick={() => {
                    const t = localStream.getAudioTracks()[0];
                    t.enabled = !t.enabled;
                    setIsMuted(!t.enabled);
                }} className={`p-5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/10 text-white'}`}>
                    {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                </button>

                <button onClick={handleHangup} className="p-6 rounded-full bg-red-500 text-white shadow-2xl hover:scale-110 transition-all">
                    <FaPhoneSlash size={30} />
                </button>

                <button onClick={() => {
                    const t = localStream.getVideoTracks()[0];
                    t.enabled = !t.enabled;
                    setIsVideoOff(!t.enabled);
                }} className={`p-5 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-white/10 text-white'}`}>
                    {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
                </button>
            </div>
        </div>
    );
}