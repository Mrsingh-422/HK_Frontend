"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserAlt, FaPlus, FaCheckCircle, FaSpinner, FaShieldAlt, FaSquare, FaCheckSquare } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const FamilyMemberModal = ({ isOpen, onClose, onConfirm, initialSelected = [] }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            setSelectedIds(initialSelected.map(m => m._id));
        }
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

    const toggleMember = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in duration-300 ease-out">
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Patients</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Select one or more people</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 rounded-full transition-all"><FaTimes size={18} /></button>
                </div>

                <div className="px-6 py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4"><FaSpinner className="animate-spin text-emerald-500 text-4xl" /></div>
                    ) : (
                        <div className="space-y-3 px-2 pb-4">
                            {members.map((member) => (
                                <div
                                    key={member._id}
                                    onClick={() => toggleMember(member._id)}
                                    className={`group relative p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${selectedIds.includes(member._id) ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-slate-100 hover:border-emerald-200"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedIds.includes(member._id) ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                            {member.profilePic ? <img src={member.profilePic} className="w-full h-full object-cover rounded-2xl" /> : <FaUserAlt size={18} />}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${selectedIds.includes(member._id) ? "text-emerald-900" : "text-slate-800"}`}>{member.memberName}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-500 uppercase">{member.relation}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedIds.includes(member._id) ? <FaCheckCircle className="text-emerald-500 text-2xl" /> : <div className="w-6 h-6 border-2 border-slate-200 rounded-full" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-white border-t border-slate-50">
                    <button
                        disabled={selectedIds.length === 0}
                        onClick={() => onConfirm(members.filter(m => selectedIds.includes(m._id)))}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-lg"
                    >
                        Confirm {selectedIds.length} Patient(s)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FamilyMemberModal;