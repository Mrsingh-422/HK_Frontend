"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserAlt, FaPlus, FaCheckCircle, FaSpinner, FaShieldAlt } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const FamilyMemberModal = ({ isOpen, onClose, onConfirm }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (isOpen) fetchMembers();
    }, [isOpen]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await UserAPI.getFamilyMembers();
            if (res.success) setMembers(res.data);
        } catch (error) {
            console.error("Error fetching family:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in duration-300 ease-out">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Patient</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Choose who this booking is for</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all duration-200"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-2 max-h-[450px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <FaSpinner className="animate-spin text-emerald-500 text-4xl" />
                            <p className="text-slate-400 font-medium text-sm">Loading profiles...</p>
                        </div>
                    ) : (
                        <div className="space-y-3 px-2 pb-4">
                            {members.map((member) => (
                                <div
                                    key={member._id}
                                    onClick={() => setSelectedId(member._id)}
                                    className={`group relative p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${selectedId === member._id
                                        ? "border-emerald-500 bg-emerald-50/50 shadow-md translate-y-[-2px]"
                                        : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Avatar Logic */}
                                        <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center transition-colors duration-200 ${selectedId === member._id
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                            }`}>
                                            {member.profilePic ? (
                                                <img src={member.profilePic} alt={member.memberName} className="w-full h-full object-cover" />
                                            ) : (
                                                <FaUserAlt size={18} />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold transition-colors ${selectedId === member._id ? "text-emerald-900" : "text-slate-800"}`}>
                                                    {member.memberName}
                                                </p>
                                                {member.hasInsurance && (
                                                    <FaShieldAlt className="text-blue-500 text-xs" title="Insured" />
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${selectedId === member._id ? "bg-emerald-200 text-emerald-700" : "bg-slate-200 text-slate-500"
                                                    }`}>
                                                    {member.relation}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {member.gender}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`transition-all duration-300 transform ${selectedId === member._id ? "scale-110 opacity-100" : "scale-50 opacity-0"}`}>
                                        <FaCheckCircle className="text-emerald-500 text-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-white border-t border-slate-50">
                    <button
                        disabled={!selectedId}
                        onClick={() => onConfirm(members.find(m => m._id === selectedId))}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100 text-white py-5 rounded-[1.5rem] font-bold text-lg transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] disabled:shadow-none"
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { 
                    width: 5px; 
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #e2e8f0; 
                    border-radius: 20px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default FamilyMemberModal;