'use client'

import React, { useState, useEffect } from 'react';
import {
  FaPhoneAlt, FaEnvelope, FaPlus, FaEdit,
  FaTrash, FaUserShield, FaTimes, FaAddressBook
} from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import AdminAPI from '@/app/services/AdminAPI';

const EmergencyContactPage = () => {
  // States
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    contactOne: '',
    contactTwo: '',
    email: ''
  });

  // --- 1. Fetch Contacts on Mount ---
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.adminGetEmergencyContacts();
      // Assuming response structure is { success: true, data: [...] }
      setContacts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open Modal for Add or Edit
  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditId(contact._id); // MongoDB ID
      setFormData({
        title: contact.title,
        contactOne: contact.contactOne,
        contactTwo: contact.contactTwo,
        email: contact.email
      });
    } else {
      setEditId(null);
      setFormData({ title: '', contactOne: '', contactTwo: '', email: '' });
    }
    setIsModalOpen(true);
  };

  // --- 2. Handle Delete ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this emergency contact?")) {
      try {
        await AdminAPI.adminDeleteEmergencyContact(id);
        alert("Deleted successfully");
        fetchContacts(); // Refresh list
      } catch (err) {
        alert("Failed to delete contact");
      }
    }
  };

  // --- 3. Handle Form Submit (Add/Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // UPDATE
        await AdminAPI.adminUpdateEmergencyContact(editId, formData);
        alert("Contact updated successfully");
      } else {
        // CREATE
        await AdminAPI.adminCreateEmergencyContact(formData);
        alert("Contact added successfully");
      }
      setIsModalOpen(false);
      fetchContacts(); // Refresh list
    } catch (err) {
      alert("Failed to save contact. Please check your inputs.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-gray-800">
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
            <FaUserShield className="text-[#08b36a]" /> Emergency Contacts
          </h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Directory Management System</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#08b36a] hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-green-100 active:scale-95"
        >
          <FaPlus size={14} className="mr-2 inline" /> New Entry
        </button>
      </div>

      {/* --- DATA TABLE SECTION --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6 border-b border-gray-100">S No.</th>
                <th className="px-8 py-6 border-b border-gray-100">Contact Title</th>
                <th className="px-8 py-6 border-b border-gray-100">Primary Contact</th>
                <th className="px-8 py-6 border-b border-gray-100">Secondary Contact</th>
                <th className="px-8 py-6 border-b border-gray-100">Email Address</th>
                <th className="px-8 py-6 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AiOutlineLoading3Quarters className="animate-spin text-[#08b36a]" size={32} />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Syncing Database...</span>
                    </div>
                  </td>
                </tr>
              ) : contacts.map((item, index) => (
                <tr key={item._id} className="hover:bg-green-50/20 transition-colors group">
                  <td className="px-8 py-5 text-xs font-bold text-gray-300">{index + 1}</td>
                  <td className="px-8 py-5 text-sm font-black text-gray-800 uppercase tracking-tight">
                    {item.title}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 font-bold">
                      <FaPhoneAlt size={10} className="text-[#08b36a]" /> {item.contactOne}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-400 font-medium italic">
                      {item.contactTwo || '---'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-semibold lowercase">
                      <FaEnvelope size={10} className="text-[#08b36a]" /> {item.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && contacts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-black text-xs uppercase tracking-widest italic opacity-50">
                    Directory is currently empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM SECTION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                  {editId ? 'Modify Entry' : 'New Contact'}
                </h2>
                <p className="text-[10px] font-black text-[#08b36a] uppercase mt-1 tracking-[0.3em]">Validation Required</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all z-10"
              >
                <FaTimes />
              </button>
              {/* Decorative Circle */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#08b36a] rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Display Title</label>
                <div className="relative mt-1">
                  <FaAddressBook className="absolute left-5 top-5 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ambulance Services"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none focus:ring-2 focus:ring-[#08b36a] rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Primary Phone</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 ..."
                    className="w-full mt-1 px-6 py-4 bg-gray-50 border-none focus:ring-2 focus:ring-[#08b36a] rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner"
                    value={formData.contactOne}
                    onChange={e => setFormData({ ...formData, contactOne: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Secondary Phone</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full mt-1 px-6 py-4 bg-gray-50 border-none focus:ring-2 focus:ring-[#08b36a] rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner"
                    value={formData.contactTwo}
                    onChange={e => setFormData({ ...formData, contactTwo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Email Address</label>
                <div className="relative mt-1">
                  <FaEnvelope className="absolute left-5 top-5 text-gray-300" />
                  <input
                    required
                    type="email"
                    placeholder="help@hospital.com"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none focus:ring-2 focus:ring-[#08b36a] rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#08b36a] text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-black transition-all active:scale-95 shadow-green-100 mt-4"
              >
                {editId ? 'Commit Changes' : 'Launch Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactPage;