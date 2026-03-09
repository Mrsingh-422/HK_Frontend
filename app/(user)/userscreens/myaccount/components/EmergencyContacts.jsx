"use client";
import React, { useState } from "react";
import {
    FiPlus, FiPhone, FiUser, FiTrash2,
    FiX, FiCheck, FiAlertCircle, FiPhoneCall
} from "react-icons/fi";

function EmergencyContacts() {
    // --- 1. STATE ---
    const [contacts, setContacts] = useState([
        // Initial Example
        { id: 1, name: "Robert Fox", relation: "Brother", phone: "+91 99887-76655" }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        relation: "Spouse",
        phone: ""
    });

    // --- 2. HANDLERS ---
    const handleAddContact = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        const newContact = { ...formData, id: Date.now() };
        setContacts([...contacts, newContact]);
        setIsModalOpen(false);
        setFormData({ name: "", relation: "Spouse", phone: "" });
    };

    const deleteContact = (id) => {
        if (confirm("Remove this emergency contact?")) {
            setContacts(contacts.filter((c) => c.id !== id));
        }
    };

    return (
        <div className="bg-gray-50/30 py-4 md:py-6 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            Emergency Contacts <FiAlertCircle className="text-red-500 animate-pulse" />
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">People to contact in case of an emergency</p>
                    </div>
                    {contacts.length > 0 && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#08b36a] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-[#256f47] transition-all active:scale-95"
                        >
                            <FiPlus size={20} /> Add Contact
                        </button>
                    )}
                </div>

                {/* --- CONTACTS LIST --- */}
                {contacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {contacts.map((contact) => (
                            <div key={contact.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all relative group flex flex-col sm:flex-row items-start sm:items-center gap-5">

                                {/* Avatar Icon */}
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <FiUser size={32} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 truncate">{contact.name}</h3>
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
                                            {contact.relation}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 font-bold text-sm mb-3">{contact.phone}</p>

                                    {/* Quick Call Button */}
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="inline-flex items-center gap-2 text-[#08b36a] text-xs font-black uppercase tracking-wider hover:underline"
                                    >
                                        <FiPhoneCall /> Call Now
                                    </a>
                                </div>

                                {/* Delete Action */}
                                <button
                                    onClick={() => deleteContact(contact.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- EMPTY STATE --- */
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 py-16 px-6 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <FiPhone size={40} />
                        </div>
                        <h3 className="text-gray-900 font-black text-xl mb-2">No emergency contacts</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
                            Please add at least one person we can contact in case of an emergency.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#08b36a] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#256f47] transition-all shadow-xl shadow-green-100"
                        >
                            Add Emergency Contact
                        </button>
                    </div>
                )}

                {/* --- MODAL --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                            <div className="bg-red-500 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">Add Emergency Contact</h3>
                                    <p className="text-red-100 text-xs font-medium">Ensure this person is reachable</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddContact} className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter name"
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relationship</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                    >
                                        <option>Spouse</option>
                                        <option>Parent</option>
                                        <option>Sibling</option>
                                        <option>Relative</option>
                                        <option>Friend</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 00000 00000"
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={18} /> Save Contact
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmergencyContacts;