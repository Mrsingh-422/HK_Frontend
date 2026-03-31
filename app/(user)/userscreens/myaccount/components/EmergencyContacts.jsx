"use client";
import React, { useState } from "react";
import { FiPlus, FiPhone, FiUser, FiTrash2, FiX, FiCheck, FiAlertCircle, FiPhoneCall, FiEdit2, FiLoader, FiHeart } from "react-icons/fi";

function EmergencyContacts({ contacts = [], onUpdate, onDelete }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = { contactName: "", relation: "Spouse", phone: "" };
    const [formData, setFormData] = useState(initialFormState);

    const openModal = (contact = null) => {
        if (contact) {
            setFormData(contact);
            setEditingId(contact._id || contact.id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Sends either the MongoDB _id or null (for new) along with data
            await onUpdate(editingId, formData);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save contact:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-10">
            <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">Emergency Contacts <FiAlertCircle className="text-red-500 animate-pulse" /></h2>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 border border-[#08b36a] text-[#08b36a] px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-50">
                    <FiPlus /> Add Contact
                </button>
            </div>

            {contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((contact) => (
                        <div key={contact._id || contact.id} className="bg-white border border-gray-300 rounded-[24px] p-5 transition-all group relative flex items-center gap-4 hover:border-red-200">
                            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0"><FiHeart size={24} /></div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-bold text-gray-900 truncate">{contact.contactName}</h3>
                                    <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">{contact.relation}</span>
                                </div>
                                <p className="text-gray-600 text-xs font-bold mb-2">{contact.phone}</p>
                                <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-[#08b36a] text-[10px] font-bold uppercase hover:underline"><FiPhoneCall size={12} /> Call Primary</a>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => openModal(contact)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={14} /></button>
                                <button onClick={() => onDelete(contact._id || contact.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
                    <FiPhone size={30} className="text-gray-300 mb-4" />
                    <p className="text-gray-400 text-sm font-medium">No emergency contacts listed yet</p>
                </div>
            )}

            {/* MODAL (Keep your existing Modal JSX here, same as before) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-200 shadow-xl overflow-hidden">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingId ? "Edit Contact" : "New Contact"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:text-red-400 transition-colors"><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <InputField label="Full Name" icon={<FiUser />} placeholder="e.g. Robert Fox" value={formData.contactName} onChange={(val) => setFormData({ ...formData, contactName: val })} />
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Relationship</label>
                                <select className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-[#08b36a]" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                                    <option>Spouse</option><option>Parent</option><option>Sibling</option><option>Relative</option><option>Friend</option><option>Other</option>
                                </select>
                            </div>
                            <InputField label="Phone Number" icon={<FiPhone />} type="tel" placeholder="e.g. +91 99887 76655" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} />
                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#08b36a] text-white font-bold rounded-2xl hover:bg-[#256f47] flex items-center justify-center gap-2 transition-all">
                                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                {editingId ? "Update Contact" : "Save Emergency Contact"}
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
        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 px-1 tracking-wider"><span className="text-[#08b36a]">{icon}</span> {label}</label>
        <input required type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3.5 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a]" />
    </div>
);

export default EmergencyContacts;