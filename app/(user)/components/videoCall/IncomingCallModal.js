import React from 'react';
import { FaPhone, FaPhoneSlash, FaUserMd } from 'react-icons/fa';

export default function IncomingCallModal({ callData, onAccept, onReject }) {
    return (
        <div className="fixed inset-0 bg-slate-900/95 z-[999] flex items-center justify-center backdrop-blur-xl p-4">
            <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-sm text-center shadow-2xl">
                <div className="relative w-28 h-28 mx-auto mb-8">
                    <div className="w-full h-full bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        {callData?.doctorProfileImage ? (
                            <img 
                                src={callData.doctorProfileImage} 
                                alt="Doctor" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FaUserMd className="text-green-500" size={40} />
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900">{callData?.callerName}</h2>
                <p className="text-[#08B36A] font-black uppercase text-[11px] tracking-widest">
                    {callData?.speciality || "Incoming Video Call"}
                </p>

                <div className="flex justify-center gap-8 mt-12">
                    <button 
                        onClick={onReject}
                        className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                        <FaPhoneSlash size={28} />
                    </button>

                    <button 
                        onClick={onAccept} // THIS TRIGGERS handleAccept in CallListener
                        className="w-20 h-20 bg-[#08B36A] text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all shadow-2xl animate-pulse"
                    >
                        <FaPhone size={28} className="rotate-[15deg]" />
                    </button>
                </div>
            </div>
        </div>
    );
}