'use client'
import React, { useState } from 'react'
import { 
  FaMotorcycle, 
  FaPhoneAlt, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaMapMarkerAlt,
  FaTimes,
  FaCircle,
  FaUserNurse
} from 'react-icons/fa'

export default function ManagePhlebotomist() {
  
  const[isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Dummy Data for Phlebotomists
  const phlebotomists =[
    { 
      id: 1, 
      name: 'Nitish Kumar', 
      username: 'Niti114647', 
      password: 'password123',
      phone: '+91 98765 43210',
      address: 'Sector 62, Mohali',
      vehicleNo: 'PB65 AB 1234', 
      status: 'Online',
      image: 'https://i.pravatar.cc/150?img=11' 
    },
    { 
      id: 2, 
      name: 'Anuj Sharma', 
      username: 'Anik053021', 
      password: 'password123',
      phone: '+91 87654 32109',
      address: 'Phase 8, Chandigarh',
      vehicleNo: 'HP37 XX 5555', 
      status: 'Offline',
      image: 'https://i.pravatar.cc/150?img=12'
    },
    { 
      id: 3, 
      name: 'Aarush Singh', 
      username: 'Aaru110138', 
      password: 'password123',
      phone: '+91 76543 21098',
      address: 'Zirakpur, Punjab',
      vehicleNo: 'RJ23 CP 0001', 
      status: 'Online',
      image: 'https://i.pravatar.cc/150?img=13'
    },
  ];

  // Open Modal for Adding New Agent
  const handleAddClick = () => {
    setModalMode('add');
    setSelectedAgent(null);
    setIsModalOpen(true);
  };

  // Open Modal for Editing Existing Agent
  const handleEditClick = (agent) => {
    setModalMode('edit');
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${modalMode === 'add' ? 'Adding' : 'Updating'} Phlebotomist...`);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full relative">
      
      {/* ========================================= */}
      {/* HEADER SECTION WITH ADD BUTTON            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Phlebotomists</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or remove your sample collection agents.</p>
        </div>

        {/* Add Button */}
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-semibold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
        >
          <FaPlus />
          Add Phlebotomist
        </button>
      </div>

      {/* ========================================= */}
      {/* TABLE SECTION                             */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Phlebotomist</th>
                <th className="px-6 py-4 font-semibold">Contact & Address</th>
                <th className="px-6 py-4 font-semibold">Vehicle Info</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {phlebotomists.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors duration-200">
                  
                  {/* Name & Image */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">{agent.name}</span>
                        <span className="text-xs text-gray-500 font-medium">@{agent.username}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact & Address */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 max-w-[200px]">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhoneAlt className="text-[#08B36A] text-xs flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">{agent.phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                        <FaMapMarkerAlt className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                        <span className="truncate" title={agent.address}>{agent.address}</span>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 p-2 rounded-lg text-[#08B36A]">
                        <FaMotorcycle size={16} />
                      </div>
                      <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 shadow-sm text-xs tracking-wider">
                        {agent.vehicleNo}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      agent.status === 'Online' 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      <FaCircle size={8} className={agent.status === 'Online' ? 'text-green-500' : 'text-gray-400'} />
                      {agent.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => handleEditClick(agent)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-blue-100"
                        title="Edit Phlebotomist"
                      >
                        <FaEdit size={14} /> Edit
                      </button>
                      {/* DELETE BUTTON */}
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-red-100"
                        title="Delete Phlebotomist"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🌟 ADD / EDIT MODAL 🌟                    */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)} 
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full text-[#08B36A]">
                  <FaUserNurse size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">
                    {modalMode === 'add' ? 'Add Phlebotomist' : 'Edit Phlebotomist'}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {modalMode === 'add' ? 'Register a new collection agent' : `Updating details for ${selectedAgent?.name}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2.5 bg-white border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shadow-sm"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto">
              <form id="phlebotomistForm" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      defaultValue={selectedAgent?.name || ''}
                      placeholder="e.g. Rahul Kumar" 
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-medium"
                      required 
                    />
                  </div>
                  
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      defaultValue={selectedAgent?.username || ''}
                      placeholder="e.g. rahul123" 
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-medium"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      defaultValue={selectedAgent?.phone || ''}
                      placeholder="+91 9876543210" 
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-medium"
                      required 
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      {modalMode === 'add' ? 'Password ' : 'New Password '}
                      {modalMode === 'add' && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="password" 
                      placeholder={modalMode === 'add' ? "Enter password" : "Leave blank to keep current"} 
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-medium"
                      required={modalMode === 'add'} 
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Complete Address</label>
                  <textarea 
                    rows="2"
                    defaultValue={selectedAgent?.address || ''}
                    placeholder="Enter full address" 
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-medium resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Vehicle Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMotorcycle className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        defaultValue={selectedAgent?.vehicleNo || ''}
                        placeholder="e.g. PB65 AB 1234" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-bold uppercase"
                        required 
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Status</label>
                    <select 
                      defaultValue={selectedAgent?.status || 'Offline'}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#08B36A] text-gray-800 transition-all font-medium"
                    >
                      <option value="Online">Online / Active</option>
                      <option value="Offline">Offline / Inactive</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-[2rem]">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="phlebotomistForm"
                className="px-6 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md shadow-green-200 hover:bg-green-600 transition-all hover:-translate-y-0.5"
              >
                {modalMode === 'add' ? 'Save Phlebotomist' : 'Update Changes'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}