'use client'

import React, { useState } from 'react';
import {
  FaPhoneAlt, FaEnvelope, FaPlus, FaEdit,
  FaTrash, FaUserShield, FaTimes, FaAddressBook
} from 'react-icons/fa';

const EmergencyContactPage = () => {
  // Initial State with dummy data
  const [contacts, setContacts] = useState([
    {
      id: 1,
      title: 'Main Reception',
      contactOne: '+91 98765 43210',
      contactTwo: '022-2456789',
      email: 'help@hospital.com'
    },
    {
      id: 2,
      title: 'Ambulance Services',
      contactOne: '102',
      contactTwo: '+91 90000 12345',
      email: 'emergency@hospital.com'
    }
  ]);

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    contactOne: '',
    contactTwo: '',
    email: ''
  });

  // Open Modal for Add or Edit
  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditId(contact.id);
      setFormData({ ...contact });
    } else {
      setEditId(null);
      setFormData({ title: '', contactOne: '', contactTwo: '', email: '' });
    }
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this emergency contact?")) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setContacts(contacts.map(c => c.id === editId ? { ...formData, id: editId } : c));
    } else {
      setContacts([...contacts, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-gray-800">
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FaUserShield className="text-[#08b36a]" /> Emergency Contacts
          </h1>
          <p className="text-gray-500 font-medium">Manage critical help-line numbers and support emails</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
        >
          <FaPlus size={14} /> Add New Contact
        </button>
      </div>

      {/* --- DATA TABLE SECTION --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">S No.</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Contact Title</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Contact One</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Contact Two</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Email Address</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-gray-400">{index + 1}</td>
                  <td className="px-8 py-5 text-sm font-black text-gray-800 uppercase tracking-tight">
                    {item.title}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <FaPhoneAlt size={12} className="text-[#08b36a]" /> {item.contactOne}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <FaPhoneAlt size={12} /> {item.contactTwo || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope size={12} className="text-[#08b36a]" /> {item.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Contact"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Contact"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium">
                    No emergency contacts found. Click "Add New Contact" to create one.
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
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-[#08b36a] p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {editId ? 'Edit Contact' : 'Add Contact'}
                </h2>
                <p className="text-xs font-bold opacity-70 uppercase mt-1 tracking-widest">Emergency Directory</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/20 p-3 rounded-full hover:rotate-90 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Title / Dept Name</label>
                <div className="relative mt-1">
                  <FaAddressBook className="absolute left-4 top-4 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. ICU Department"
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-bold"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact One</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 ..."
                    className="w-full mt-1 px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                    value={formData.contactOne}
                    onChange={e => setFormData({ ...formData, contactOne: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Two</label>
                  <input
                    type="text"
                    placeholder="Optional number"
                    className="w-full mt-1 px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                    value={formData.contactTwo}
                    onChange={e => setFormData({ ...formData, contactTwo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative mt-1">
                  <FaEnvelope className="absolute left-4 top-4 text-gray-300" />
                  <input
                    required
                    type="email"
                    placeholder="support@hospital.com"
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#079d5d] transition-all active:scale-95 shadow-green-100 mt-4"
              >
                {editId ? 'Save Update' : 'Publish Contact'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactPage;