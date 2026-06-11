import React from 'react';
import { FaPhone, FaPhoneSlash, FaUserMd } from 'react-icons/fa';

export default function IncomingCallModal({ callData, onAccept, onReject }) {
    return (
        <div className="fixed inset-0 bg-slate-900/95 z-[999] flex items-center justify-center backdrop-blur-xl p-4">
            {/* Custom CSS for the ripple effect */}
            <style jsx>{`
                @keyframes ripple {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(2.4); opacity: 0; }
                }
                .ripple {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: #08B36A;
                    border-radius: 50%;
                    animation: ripple 2s infinite;
                    z-index: -1;
                }
            `}</style>

            <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
                <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                    {/* Ripple Effect behind image */}
                    <div className="ripple"></div>
                    <div className="ripple" style={{ animationDelay: '0.5s' }}></div>
                    
                    <div className="w-full h-full bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        {callData?.doctorProfileImage ? (
                            <img 
                                src={callData.doctorProfileImage} 
                                alt="Doctor" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ""; e.target.style.display='none'; }}
                            />
                        ) : (
                            <FaUserMd className="text-green-500" size={40} />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {callData?.callerName || "Doctor"}
                    </h2>
                    <p className="text-[#08B36A] font-black uppercase text-[11px] tracking-[0.2em]">
                        {callData?.speciality || "Medical Consultant"}
                    </p>
                    <div className="pt-2">
                        <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Incoming Video Call...
                        </span>
                    </div>
                </div>

                <div className="flex justify-center gap-8 mt-12">
                    {/* Reject Button */}
                    <button 
                        onClick={onReject}
                        aria-label="Decline Call"
                        className="group relative w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center transition-all hover:bg-red-500 hover:text-white active:scale-90 shadow-xl shadow-red-100"
                    >
                        <FaPhoneSlash size={28} />
                        <span className="absolute -bottom-8 text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Decline</span>
                    </button>

                    {/* Accept Button */}
                    <button 
                        onClick={onAccept}
                        aria-label="Accept Call"
                        className="group relative w-20 h-20 bg-[#08B36A] text-white rounded-full flex items-center justify-center transition-all hover:bg-green-600 active:scale-90 shadow-2xl shadow-green-200"
                    >
                        <FaPhone size={28} className="rotate-[15deg] animate-[wiggle_1s_ease-in-out_infinite]" />
                        <span className="absolute -bottom-8 text-[10px] font-black text-[#08B36A] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Accept</span>
                    </button>
                </div>
            </div>
        </div>
    );
}