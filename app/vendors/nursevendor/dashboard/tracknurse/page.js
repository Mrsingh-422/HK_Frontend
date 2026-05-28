'use client'
import React, { useState } from 'react'
import { 
    FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaTimes, 
    FaUserCircle, FaCheckCircle, FaUserNurse 
} from 'react-icons/fa'

export default function TrackNursePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState(null);

    const trackingData = [
        { id: 1, orderId: '264920241213043714', name: 'Nurse Maria', phone: '8741527479' },
        { id: 2, orderId: '264920241213043715', name: 'Nurse Nitish', phone: '7597272101' },
        { id: 3, orderId: '264920241213043716', name: 'Nurse Sarah', phone: '6858585858' },
    ];

    const openTracker = (nurse) => {
        setSelectedNurse(nurse);
        setIsModalOpen(true);
    };

    return (
        <div className=" bg-[#F9FAFB] min-h-screen font-sans">
            {/* --- TOP BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-800">
                    Track <span className="text-[#08B36A]">Nurses</span>
                </h1>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Order ID..." 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#08B36A] shadow-sm text-sm"
                        />
                    </div>
                    <button className="bg-green-50 text-[#08B36A] font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider border border-green-100 whitespace-nowrap">
                        Assigned Orders List
                    </button>
                </div>
            </div>

            {/* --- TRACKING TABLE --- */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/30">
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Serial no.</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Order ID</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Nurse Name</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Phone Number</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {trackingData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6 text-gray-600 font-medium">{item.id}</td>
                                <td className="px-8 py-6 text-gray-500 text-sm font-mono">{item.orderId}</td>
                                <td className="px-8 py-6 font-bold text-[#1e5a91]">{item.name}</td>
                                <td className="px-8 py-6 font-bold text-[#08B36A]">{item.phone}</td>
                                <td className="px-8 py-6">
                                    <button 
                                        onClick={() => openTracker(item)}
                                        className="flex items-center gap-2 bg-[#08B36A] hover:bg-[#069a5a] text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-green-100"
                                    >
                                        <FaMapMarkerAlt size={12} /> Track
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- LIVE TRACKING MODAL --- */}
            {isModalOpen && selectedNurse && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-xl text-[#08B36A]">
                                    <FaUserNurse size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">Live Service Status</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {/* Nurse Profile Card */}
                        <div className="px-8 pb-6">
                            <div className="bg-[#FAFBFC] rounded-3xl p-5 border border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-300 border border-gray-100 shadow-sm">
                                        <FaUserCircle size={40} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg leading-tight">{selectedNurse.name}</p>
                                        <p className="text-[#08B36A] text-xs font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online • In Transit
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-green-50 text-[#08B36A] font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest border border-green-100">
                                    Call
                                </button>
                            </div>
                        </div>

                        {/* Timeline Logic */}
                        <div className="px-10 pb-10 space-y-0">
                            <TimelineItem 
                                title="Preparation Finished" 
                                desc="Nurse has prepared the medical kit and is starting." 
                                time="10:30 AM" 
                                isCompleted={true} 
                            />
                            <TimelineItem 
                                title="In Transit" 
                                desc="Nurse is on the way to your location." 
                                time="10:45 AM" 
                                isCompleted={true} 
                            />
                            <TimelineItem 
                                title="Near Your Location" 
                                desc="Nurse is within 2km of your address." 
                                time="11:05 AM" 
                                isCompleted={true} 
                                showBadge={true}
                            />
                            <TimelineItem 
                                title="Service Delivered" 
                                desc="Final clinical procedure and documentation." 
                                time="PENDING" 
                                isLast={true} 
                            />
                        </div>

                        {/* Footer Button */}
                        <div className="px-8 pb-8">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Timeline Helper Component
function TimelineItem({ title, desc, time, isCompleted = false, isLast = false, showBadge = false }) {
    return (
        <div className="flex gap-6 relative">
            {/* The Line */}
            {!isLast && (
                <div className={`absolute left-[13px] top-[26px] bottom-0 w-[2px] ${isCompleted ? 'bg-[#08B36A]' : 'bg-gray-100'}`}></div>
            )}
            
            {/* The Circle */}
            <div className="z-10 bg-white py-1">
                {isCompleted ? (
                    <FaCheckCircle className="text-[#08B36A]" size={26} />
                ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-100 ml-0.5"></div>
                )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1 flex justify-between">
                <div className="space-y-1">
                    <p className={`font-bold text-sm ${isCompleted ? 'text-gray-800' : 'text-gray-300'}`}>{title}</p>
                    <p className={`text-[11px] leading-relaxed max-w-[200px] ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>{desc}</p>
                    {showBadge && (
                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-[#08B36A] px-2 py-0.5 rounded-full border border-green-100 mt-2">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest">Live Now</span>
                        </div>
                    )}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase pt-1">{time}</div>
            </div>
        </div>
    );
}