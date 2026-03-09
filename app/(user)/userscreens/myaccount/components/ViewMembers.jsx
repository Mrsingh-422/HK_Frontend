"use client";
import React, { useState } from 'react';
import {
    FiUsers, FiPlus, FiTrash2, FiUser, FiX,
    FiCheck, FiPhone, FiMail, FiCalendar
} from 'react-icons/fi';
import { HiOutlineIdentification } from 'react-icons/hi';

function ViewMembers() {
    // --- 1. STATE ---
    const [members, setMembers] = useState([
        {
            id: 1,
            name: "Jane Doe",
            relation: "Spouse",
            age: "28",
            gender: "Female",
            phone: "+91 98765-43210",
            email: "jane.doe@example.com"
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        relation: "Spouse",
        age: "",
        gender: "Male",
        phone: "",
        email: ""
    });

    // --- 2. HANDLERS ---
    const handleAddMember = (e) => {
        e.preventDefault();
        const newMember = { ...formData, id: Date.now() };
        setMembers([...members, newMember]);
        setIsModalOpen(false);
        // Reset Form
        setFormData({ name: "", relation: "Spouse", age: "", gender: "Male", phone: "", email: "" });
    };

    const deleteMember = (id) => {
        if (window.confirm("Remove this family member?")) {
            setMembers(members.filter(m => m.id !== id));
        }
    };

    return (
        <div className="bg-gray-50/50 py-4 md:py-6 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Family Members
                            <span className="text-sm bg-[#08b36a]/10 text-[#08b36a] px-3 py-1 rounded-full border border-[#08b36a]/20">
                                {members.length} Total
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage profiles for quick bookings and records</p>
                    </div>

                    {/* Always show "Add" button if list is not empty */}
                    {members.length > 0 && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#08b36a] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#256f47] transition-all shadow-lg shadow-green-100 active:scale-95"
                        >
                            <FiPlus size={20} /> Add Member
                        </button>
                    )}
                </div>

                {/* --- MEMBERS DISPLAY --- */}
                {members.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member) => (
                            <div key={member.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative">
                                {/* Delete Button */}
                                <button
                                    onClick={() => deleteMember(member.id)}
                                    className="absolute top-5 right-5 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 "
                                >
                                    <FiTrash2 size={18} />
                                </button>

                                {/* Profile Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#08b36a] to-[#2ecc71] text-white rounded-2xl flex items-center justify-center shadow-inner">
                                        <FiUser size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
                                        <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-[#08b36a] bg-green-50 px-2 py-0.5 rounded-md">
                                            {member.relation}
                                        </span>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-3 rounded-2xl">
                                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Age</span>
                                        <span className="text-sm font-bold text-gray-700">{member.age} Years</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-2xl">
                                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Gender</span>
                                        <span className="text-sm font-bold text-gray-700">{member.gender}</span>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#08b36a]">
                                            <FiPhone size={14} />
                                        </div>
                                        <span className="text-xs font-medium">{member.phone || "No phone added"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#08b36a]">
                                            <FiMail size={14} />
                                        </div>
                                        <span className="text-xs font-medium truncate">{member.email || "No email added"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- EMPTY STATE --- */
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 py-20 px-6 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                            <FiUsers size={48} />
                        </div>
                        <h3 className="text-gray-900 font-black text-xl mb-2">Your family list is empty</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
                            Add family members to book appointments for them and keep their medical history in one place.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-3 bg-[#08b36a] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#256f47] transition-all shadow-xl shadow-green-100 active:scale-95"
                        >
                            <FiPlus size={20} /> Add Your First Member
                        </button>
                    </div>
                )}

                {/* --- ADD MEMBER MODAL (Responsive Bottom Sheet on Mobile) --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 z-10 bg-[#08b36a] p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">Add Family Member</h3>
                                    <p className="text-white/70 text-xs">Fill in the details below</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="p-6 md:p-8 space-y-6">
                                {/* Row 1: Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">Full Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required type="text"
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                            placeholder="John Smith"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Relation & Age */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relation</label>
                                        <select
                                            className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                            value={formData.relation}
                                            onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                        >
                                            <option>Spouse</option><option>Child</option><option>Parent</option>
                                            <option>Sibling</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Age</label>
                                        <input
                                            required type="number"
                                            className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                            placeholder="Years"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Phone & Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                        <input
                                            required type="tel"
                                            className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                            placeholder="+91 00000 00000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                        <input
                                            required type="email"
                                            className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                            placeholder="alex@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Gender Toggle */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                                    <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl">
                                        {["Male", "Female", "Other"].map(g => (
                                            <button
                                                key={g} type="button"
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${formData.gender === g ? "bg-white text-[#08b36a] shadow-sm" : "text-gray-400"}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-[#08b36a] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-green-100 hover:bg-[#256f47] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                    <FiCheck size={18} /> Save Member Information
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewMembers;