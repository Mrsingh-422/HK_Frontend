"use client";
import React, { useState, useRef } from 'react';
import { FiUsers, FiPlus, FiTrash2, FiUser, FiX, FiCheck, FiPhone, FiEdit2, FiCamera, FiLoader, FiHash } from 'react-icons/fi';
import { HiOutlineIdentification } from "react-icons/hi";

function ViewMembers({ members = [], onUpdate, onDelete }) {
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, profilePic: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const openModal = (member = null) => {
        if (member) {
            // Priority: use MongoDB _id, fallback to local id
            setEditingId(member._id || member.id);
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
            // Pass the specific ID and the single object to the parent
            await onUpdate(editingId, formData);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save member:", error);
        } finally {
            setIsSubmitting(false);
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
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 border border-[#08b36a] text-[#08b36a] px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-50">
                    <FiPlus /> Add Member
                </button>
            </div>

            {members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div key={member._id || member.id} className="bg-white border border-gray-300 rounded-[24px] p-5 group relative hover:border-[#08b36a]">
                            <div className="absolute top-4 right-4 flex gap-1">
                                <button onClick={() => openModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={14} /></button>
                                {/* Call onDelete using MongoDB _id or local id */}
                                <button onClick={() => onDelete(member._id || member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-300 shrink-0">
                                    {member.profilePic ? <img src={member.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiUser size={24} /></div>}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900 text-base">{member.memberName}</h3>
                                    <span className="text-[10px] font-black uppercase text-[#08b36a] bg-green-50 px-2 py-0.5 border border-green-100 rounded">{member.relation}</span>
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

            {/* MODAL (Keep your existing Modal JSX here, same as before) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-200 shadow-xl overflow-hidden">
                        <div className="bg-[#08b36a] p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingId ? "Edit Profile" : "Add Member"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:text-red-200 transition-colors"><FiX size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="flex flex-col items-center mb-2">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <div className="w-20 h-20 rounded-3xl bg-white border border-gray-300 overflow-hidden flex items-center justify-center group-hover:border-[#08b36a] transition-all">
                                        {formData.profilePic ? <img src={formData.profilePic} className="w-full h-full object-cover" /> : <FiCamera className="text-gray-400" size={24} />}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Member Photo</p>
                            </div>

                            <InputField label="Full Name" icon={<FiUser />} placeholder="e.g. Jane Doe" value={formData.memberName} onChange={(val) => setFormData({ ...formData, memberName: val })} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Relation</label>
                                    <select className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-[#08b36a]" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                                        <option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Other</option>
                                    </select>
                                </div>
                                <InputField label="Age" icon={<FiHash />} type="number" placeholder="e.g. 28" value={formData.age} onChange={(val) => setFormData({ ...formData, age: val })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Gender</label>
                                    <div className="flex p-1 bg-gray-50 border border-gray-300 rounded-xl">
                                        {["Male", "Female"].map(g => (
                                            <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.gender === g ? "bg-white text-[#08b36a]" : "text-gray-400"}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <InputField label="Phone" icon={<FiPhone />} placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} />
                            </div>

                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#08b36a] text-white font-bold rounded-2xl hover:bg-[#256f47] flex items-center justify-center gap-2 transition-all">
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
        <input required type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a]" />
    </div>
);

export default ViewMembers;