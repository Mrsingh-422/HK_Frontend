"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
    FaUsers, FaPlus, FaTrashAlt, FaUser, FaTimes, FaCheck,
    FaPhone, FaEdit, FaCamera, FaSpinner, FaCalendarAlt,
    FaArrowsAltV, FaWeight, FaShieldAlt, FaIdCard
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

function ViewMembers() {
    // --- State Management ---
    const [members, setMembers] = useState([]);
    const [insurancesList, setInsurancesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null); // Stores the binary File object
    const [previewUrl, setPreviewUrl] = useState(""); // Stores the string for UI preview

    const initialFormState = {
        memberName: "",
        relation: "Spouse",
        dob: "",
        phone: "",
        gender: "Male",
        height: "",
        weight: "",
        hasInsurance: false,
        insuranceNo: "",
        insuranceId: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const fileInputRef = useRef(null);

    // --- API Integration ---
    const loadData = async () => {
        try {
            setLoading(true);
            const [memberRes, insuranceRes] = await Promise.all([
                UserAPI.getFamilyMembers(),
                UserAPI.getUserHealthInsuranses()
            ]);
            setMembers(memberRes.data || memberRes || []);
            setInsurancesList(insuranceRes.data || insuranceRes || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // This is the FILE object for the backend
            setPreviewUrl(URL.createObjectURL(file)); // This is a temporary string for the IMG tag
        }
    };

    const openModal = (member = null) => {
        if (member) {
            setEditingId(member._id);
            setFormData({
                memberName: member.memberName || "",
                relation: member.relation || "Spouse",
                dob: member.dob || "",
                phone: member.phone || "",
                gender: member.gender || "Male",
                height: member.height || "",
                weight: member.weight || "",
                hasInsurance: member.hasInsurance || false,
                insuranceNo: member.insuranceNo || "",
                insuranceId: member.insuranceId?._id || member.insuranceId || ""
            });
            setPreviewUrl(member.profilePic || ""); // Existing image path from server
            setSelectedFile(null); // No new file selected yet
        } else {
            setEditingId(null);
            setFormData(initialFormState);
            setPreviewUrl("");
            setSelectedFile(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Constructing FormData exactly as per Postman screenshot
            const data = new FormData();
            data.append('memberName', formData.memberName);
            data.append('relation', formData.relation);
            data.append('dob', formData.dob);
            data.append('phone', formData.phone);
            data.append('gender', formData.gender);
            data.append('height', formData.height);
            data.append('weight', formData.weight);
            data.append('insuranceNo', formData.insuranceNo);
            data.append('insuranceId', formData.insuranceId);
            data.append('hasInsurance', String(formData.hasInsurance)); // "true" or "false"

            // FIXED: Only append profilePic if a new file was actually picked
            // This prevents sending an empty object/string that causes "Cast to string failed"
            if (selectedFile instanceof File) {
                data.append('profilePic', selectedFile);
                console.log("Appending new file to FormData:", selectedFile);
            }

            if (editingId) {
                // Per your screenshot, itemId is sent in the body during editing
                data.append('itemId', editingId);
                await UserAPI.editFamilyMember(editingId, data);
                toast.success("Member updated successfully");
            } else {
                await UserAPI.addFamilyMember(data);
                toast.success("Member added successfully");
            }

            await loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Save error:", error);
            toast.error(error.response?.data?.message || "Error saving member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this family member?")) return;
        try {
            await UserAPI.removeFamilyMember(id);
            setMembers(prev => prev.filter(m => m._id !== id));
            toast.success("Member removed");
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <FaSpinner className="animate-spin text-[#08b36a]" size={40} />
                <p className="text-gray-500 font-medium">Loading family data...</p>
            </div>
        );
    }

    return (
        <section className="mt-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 text-left">
                    Family Members
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">{members.length}</span>
                </h2>
                <button onClick={() => openModal()} className="flex items-center gap-2 border border-[#08b36a] text-[#08b36a] px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors">
                    <FaPlus size={12} /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                    <div key={member._id} className="bg-white border border-gray-300 rounded-[24px] p-5 relative group hover:border-[#08b36a] transition-all hover:shadow-lg">
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button onClick={() => openModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit size={14} /></button>
                            <button onClick={() => handleDelete(member._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FaTrashAlt size={14} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-4 text-left">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {member.profilePic ? (
                                    <img
                                        src={member.profilePic.startsWith('blob') || member.profilePic.startsWith('http') ? member.profilePic : `${process.env.NEXT_PUBLIC_BACKEND_URL}${member.profilePic}`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><FaUser size={24} /></div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base line-clamp-1">{member.memberName}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-[#08b36a] bg-green-50 px-2 py-0.5 border border-green-100 rounded">{member.relation}</span>
                                    {member.hasInsurance && <FaShieldAlt className="text-blue-500" size={12} />}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl text-left">
                                <p className="text-[9px] text-gray-400 font-bold uppercase">DOB</p>
                                <p className="text-xs font-bold text-gray-700">{member.dob || "N/A"}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl text-left">
                                <p className="text-[9px] text-gray-400 font-bold uppercase">Gender</p>
                                <p className="text-xs font-bold text-gray-700">{member.gender}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 text-xs pt-3 border-t border-gray-200 text-left">
                            <FaPhone className="text-[#08b36a]" />
                            <span className="font-bold">{member.phone || "No phone added"}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[32px] border shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="bg-[#08b36a] p-6 text-white flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg text-left">{editingId ? "Edit Member" : "Add Member"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:text-red-100 transition-colors"><FaTimes size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex flex-col items-center mb-2">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <div className="w-20 h-20 rounded-3xl bg-white border border-gray-300 overflow-hidden flex items-center justify-center group-hover:border-[#08b36a] transition-all">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl.startsWith('blob') || previewUrl.startsWith('data:') || previewUrl.startsWith('http') ? previewUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${previewUrl}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaCamera className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                    <div className="absolute -bottom-1 -right-1 bg-[#08b36a] text-white p-1.5 rounded-lg border-2 border-white">
                                        <FaPlus size={10} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Member Photo</p>
                            </div>

                            <InputField label="Full Name" icon={<FaUser size={12} />} placeholder="Enter Name" value={formData.memberName} onChange={(val) => setFormData({ ...formData, memberName: val })} />

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Relation</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-[#08b36a]" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                                        <option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Girlfriend</option><option>Brother</option><option>Other</option>
                                    </select>
                                </div>
                                <InputField label="DOB" icon={<FaCalendarAlt size={12} />} placeholder="DD-MM-YYYY" value={formData.dob} onChange={(val) => setFormData({ ...formData, dob: val })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <InputField label="Height" icon={<FaArrowsAltV size={12} />} placeholder="5'10" value={formData.height} onChange={(val) => setFormData({ ...formData, height: val })} />
                                <InputField label="Weight" icon={<FaWeight size={12} />} placeholder="70 kg" value={formData.weight} onChange={(val) => setFormData({ ...formData, weight: val })} />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-left">
                                <input
                                    type="checkbox"
                                    id="hasInsuranceCheckbox"
                                    checked={formData.hasInsurance}
                                    onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                                    className="w-5 h-5 accent-[#08b36a] cursor-pointer"
                                />
                                <label htmlFor="hasInsuranceCheckbox" className="text-sm font-bold text-blue-700 flex items-center gap-2 cursor-pointer">
                                    <FaShieldAlt /> This member has insurance
                                </label>
                            </div>

                            {formData.hasInsurance && (
                                <div className="space-y-4 p-4 border-2 border-dashed border-blue-100 rounded-2xl bg-gray-50/50">
                                    <InputField label="Insurance Number" icon={<FaIdCard size={12} />} placeholder="Insurance No." value={formData.insuranceNo} onChange={(val) => setFormData({ ...formData, insuranceNo: val })} />

                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Insurance Provider</label>
                                        <select
                                            required={formData.hasInsurance}
                                            className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-[#08b36a]"
                                            value={formData.insuranceId}
                                            onChange={(e) => setFormData({ ...formData, insuranceId: e.target.value })}
                                        >
                                            <option value="">Select Provider</option>
                                            {insurancesList.map(ins => (
                                                <option key={ins._id} value={ins._id}>{ins.insuranceName} ({ins.provider})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Gender</label>
                                    <div className="flex p-1 bg-gray-100 border border-gray-300 rounded-xl">
                                        {["Male", "Female"].map(g => (
                                            <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.gender === g ? "bg-white text-[#08b36a] shadow-sm" : "text-gray-400"}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <InputField label="Phone" icon={<FaPhone size={12} />} placeholder="Phone" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} />
                            </div>

                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#08b36a] text-white font-bold rounded-2xl hover:bg-[#256f47] flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2">
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheck size={14} />}
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
            className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a] transition-all"
        />
    </div>
);

export default ViewMembers;