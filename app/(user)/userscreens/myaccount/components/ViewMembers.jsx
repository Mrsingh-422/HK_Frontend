"use client";
import React, { useState, useRef } from 'react';
import {
    FiUsers, FiPlus, FiTrash2, FiUser, FiX,
    FiCheck, FiPhone, FiEdit2, FiCamera, FiLoader, FiHash
} from 'react-icons/fi';
import { HiOutlineIdentification } from "react-icons/hi";

/**
 * @param {Array} members - The familyMember array from parent state
 * @param {Function} onUpdate - Callback to update parent (e.g., updateUserDataField('familyMember', newList))
 */
function ViewMembers({ members = [], onUpdate }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        memberName: "",
        relation: "Spouse",
        age: "",
        phone: "",
        gender: "Female",
        profilePic: "" 
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const fileInputRef = useRef(null);

    // --- HANDLERS ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const openModal = (member = null) => {
        if (member) {
            setEditingId(member.id || member.memberName); 
            setFormData(member);
        } else {
            setEditingId(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let updatedList;
            if (editingId) {
                updatedList = members.map(m => (m.id === editingId || m.memberName === editingId) ? formData : m);
            } else {
                updatedList = [...members, { ...formData, id: Date.now() }];
            }

            await onUpdate(updatedList);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save member:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteMember = (id, name) => {
        if (window.confirm(`Remove ${name} from family members?`)) {
            const updatedList = members.filter(m => (m.id !== id && m.memberName !== name));
            onUpdate(updatedList);
        }
    };

    return (
        <section className="mt-10">
            <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        Family Members 
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">
                            {members.length}
                        </span>
                    </h2>
                    <p className="text-gray-500 text-xs font-medium">Profiles for quick appointment booking</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 border border-[#08b36a] text-[#08b36a] px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-50 transition-all active:scale-95"
                >
                    <FiPlus /> Add Member
                </button>
            </div>

            {members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member, index) => (
                        <div key={member.id || index} className="bg-white border border-gray-300 rounded-[24px] p-5 transition-all group relative hover:border-[#08b36a]">
                            <div className="absolute top-4 right-4 flex gap-1 transition-opacity">
                                <button onClick={() => openModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg"><FiEdit2 size={14} /></button>
                                <button onClick={() => deleteMember(member.id, member.memberName)} className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg"><FiTrash2 size={14} /></button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-300 shrink-0">
                                    {member.profilePic ? (
                                        <img src={member.profilePic} alt={member.memberName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><FiUser size={24} /></div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900 text-base">{member.memberName}</h3>
                                    <span className="text-[10px] font-black uppercase text-[#08b36a] bg-green-50 px-2 py-0.5 border border-green-100 rounded">
                                        {member.relation}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-gray-50 border border-gray-200 p-2 rounded-xl text-left">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Age</p>
                                    <p className="text-xs font-bold text-gray-700">{member.age} Years</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 p-2 rounded-xl text-left">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Gender</p>
                                    <p className="text-xs font-bold text-gray-700">{member.gender}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 text-xs pt-3 border-t border-gray-200 text-left">
                                <FiPhone className="text-[#08b36a]" />
                                <span className="font-bold">{member.phone || "No phone added"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
                    <FiUsers size={40} className="text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No family members added yet</p>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-200 shadow-xl overflow-hidden">
                        <div className="bg-[#08b36a] p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingId ? "Edit Profile" : "Add Member"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:text-red-200 transition-colors"><FiX size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Profile Pic Upload */}
                            <div className="flex flex-col items-center mb-2">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <div className="w-20 h-20 rounded-3xl bg-white border border-gray-300 overflow-hidden flex items-center justify-center group-hover:border-[#08b36a] transition-all">
                                        {formData.profilePic ? (
                                            <img src={formData.profilePic} className="w-full h-full object-cover" />
                                        ) : (
                                            <FiCamera className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <FiEdit2 />
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Member Photo</p>
                            </div>

                            <InputField 
                                label="Full Name" 
                                icon={<FiUser/>} 
                                placeholder="e.g. Jane Doe"
                                value={formData.memberName} 
                                onChange={(val) => setFormData({...formData, memberName: val})} 
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Relation</label>
                                    <select 
                                        className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-[#08b36a] focus:ring-1 focus:ring-[#08b36a] transition-all"
                                        value={formData.relation}
                                        onChange={(e) => setFormData({...formData, relation: e.target.value})}
                                    >
                                        <option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Other</option>
                                    </select>
                                </div>
                                <InputField 
                                    label="Age" 
                                    icon={<FiHash/>} 
                                    type="number" 
                                    placeholder="e.g. 28"
                                    value={formData.age} 
                                    onChange={(val) => setFormData({...formData, age: val})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Gender</label>
                                    <div className="flex p-1 bg-gray-50 border border-gray-300 rounded-xl">
                                        {["Male", "Female"].map(g => (
                                            <button key={g} type="button" 
                                                onClick={() => setFormData({...formData, gender: g})}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.gender === g ? "bg-white border border-gray-200 text-[#08b36a]" : "text-gray-400"}`}>
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <InputField 
                                    label="Phone" 
                                    icon={<FiPhone/>} 
                                    placeholder="e.g. +91 98765 43210"
                                    value={formData.phone} 
                                    onChange={(val) => setFormData({...formData, phone: val})} 
                                />
                            </div>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full py-4 bg-[#08b36a] text-white font-bold rounded-2xl hover:bg-[#256f47] flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                {editingId ? "Update Member" : "Save Member"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

const InputField = ({ label, icon, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-1 text-left">
        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 px-1 tracking-wider">
            <span className="text-[#08b36a]">{icon}</span> {label}
        </label>
        <input
            required
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a] focus:ring-1 focus:ring-[#08b36a] transition-all placeholder:text-gray-400"
        />
    </div>
);

export default ViewMembers;