'use client'
import React, { useState } from 'react'
import { 
    FaUserNurse, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaIdCard, 
    FaUserCircle, 
    FaPhoneAlt,
    FaClipboardList,
    FaImage,
    FaEye,
    FaCheck,
    FaTimes,
    FaTimesCircle,
    FaInfoCircle,
    FaUserPlus, // Added for Assign button
    FaSearch    // Added for Modal search
} from 'react-icons/fa'

export default function AssignNurseTable() {
    const [activeTab, setActiveTab] = useState('Assign Nurses');
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // New States for Assigning
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const tabs = ['Assign Nurses', 'Assigned Nurses', 'Unassigned Nurses'];

    // --- DATA ---
    const appointments = [
        { id: '112820250217111059', name: 'Yash User', address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Punjab', gender: 'Male', age: '7 year', date: '2025-02-17', price: '10', type: 'Appointment' },
        { id: '965220260305123730', name: 'Aarush', address: 'Airport Road, Ropar Division, Punjab', gender: 'Male', age: '1991', date: '0000-00-00', price: '10.0', type: 'Appointment' },
        { id: '661220250128023454', name: 'Yash User', address: 'Chandigarh, Ropar Division, Punjab', gender: 'Male', age: '7', date: '2025-01-28', price: '100.0', type: 'Appointment' },
    ];

    const availableNurses = [
        { id: 'demo062942', name: 'demo', phone: '7412578742', status: 'Available', type: 'Nurse', exp: '2 Years' },
        { id: 'nurse9921', name: 'Amandeep', phone: '9876543210', status: 'Available', type: 'Nurse', exp: '5 Years' },
    ];

    // Modal Handlers
    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="bg-white min-h-screen relative ">
            {/* --- HEADER --- */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase tracking-tight">Nursing Service Requests</h1>
                
                <div className="flex flex-wrap gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2 rounded-full text-sm font-semibold border transition-all ${
                                activeTab === tab
                                    ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-sm'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    
                    {/* --- TAB 1: ASSIGN NURSES --- */}
                    {activeTab === 'Assign Nurses' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Prescription</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Price</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {appointments.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        onClick={() => handleRowClick(item)}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-6">
                                            <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                                                <div className="text-[10px] text-center leading-tight"><FaImage className="mx-auto mb-1" />Prescrip</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">{item.name}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">ID: {item.id}</div>
                                            <div className="text-[12px] text-gray-500 mt-1">{item.gender} • Age: {item.age}</div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-gray-800 text-center italic">₹{item.price}</td>
                                        <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleRowClick(item)} className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all"><FaEye size={12} /> VIEW</button>
                                                
                                                {/* REMOVED ACCEPT/REJECT - ADDED ASSIGN */}
                                                <button 
                                                    onClick={() => { setSelectedAppointment(item); setIsAssignModalOpen(true); }}
                                                    className="bg-[#08B36A] hover:bg-[#069a5a] text-white px-5 py-2 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-green-100"
                                                >
                                                    <FaUserPlus size={12} /> ASSIGN
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* --- TAB 3: UNASSIGNED NURSES --- */}
                    {activeTab === 'Unassigned Nurses' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nurse Profile</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Contact Info</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {availableNurses.map((nurse) => (
                                    <tr 
                                        key={nurse.id} 
                                        onClick={() => handleRowClick(nurse)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FaUserCircle size={35} className="text-gray-200 group-hover:text-[#08B36A] transition-colors" />
                                                <div>
                                                    <div className="font-bold text-gray-800">{nurse.name}</div>
                                                    <div className="text-[11px] text-gray-400 font-mono">{nurse.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm font-bold text-gray-800 tracking-wider flex items-center justify-center gap-2">
                                                <FaPhoneAlt size={10} className="text-blue-500" /> {nurse.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button className="border border-[#08B36A] text-[#08B36A] px-6 py-1.5 rounded-full text-xs font-bold hover:bg-[#08B36A] hover:text-white transition-all shadow-sm">
                                                Assign Task
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* --- TAB 2: ASSIGNED NURSES --- */}
                    {activeTab === 'Assigned Nurses' && (
                        <div className="py-24 text-center">
                            <FaClipboardList className="mx-auto text-gray-200 mb-4" size={50} />
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">No Data Found</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ASSIGN NURSE LIST MODAL --- */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Select Nurse</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patient: {selectedAppointment?.name}</p>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
                            {availableNurses.map((nurse) => (
                                <div key={nurse.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-green-50/50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <FaUserCircle size={40} className="text-gray-200 group-hover:text-[#08B36A]" />
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm leading-tight">{nurse.name}</p>
                                            <p className="text-[10px] text-gray-400">{nurse.exp || '2 Years'} Experience</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { alert(`Assigned ${nurse.name} to ${selectedAppointment.name}`); setIsAssignModalOpen(false); }}
                                        className="bg-white border border-[#08B36A] text-[#08B36A] hover:bg-[#08B36A] hover:text-white px-4 py-1.5 rounded-full text-[10px] font-black transition-all"
                                    >
                                        SELECT
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 text-center">
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DETAILS MODAL (UNCHANGED) --- */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="bg-[#08B36A] p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">{selectedItem.type === 'Nurse' ? 'Nurse Profile' : 'Request Details'}</h2>
                                <p className="text-green-50 text-xs mt-1 font-mono tracking-wider">ID: {selectedItem.id}</p>
                            </div>
                            <button onClick={closeModal} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 text-gray-800 font-bold">
                                        <FaIdCard className="text-[#08B36A]" /> Basic Information
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-semibold">{selectedItem.name}</span></div>
                                        {selectedItem.gender && <div className="flex justify-between"><span className="text-gray-500">Gender / Age:</span> <span className="font-semibold">{selectedItem.gender} / {selectedItem.age}</span></div>}
                                        {selectedItem.phone && <div className="flex justify-between"><span className="text-gray-500">Contact:</span> <span className="font-bold text-blue-600">{selectedItem.phone}</span></div>}
                                    </div>
                                </div>

                                {/* Status/Price Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 text-gray-800 font-bold">
                                        <FaInfoCircle className="text-[#08B36A]" /> Details
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {selectedItem.date && <div className="flex justify-between"><span className="text-gray-500">Service Date:</span> <span className="font-semibold">{selectedItem.date}</span></div>}
                                        {selectedItem.price && <div className="flex justify-between"><span className="text-gray-500">Price:</span> <span className="font-bold text-[#08B36A]">₹{selectedItem.price}</span></div>}
                                        {selectedItem.status && <div className="flex justify-between"><span className="text-gray-500">Current Status:</span> <span className="text-green-600 font-bold uppercase text-[10px] bg-green-50 px-2 py-0.5 rounded border border-green-100">{selectedItem.status}</span></div>}
                                    </div>
                                </div>

                                {/* Address Section */}
                                {selectedItem.address && (
                                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-2">
                                            <FaMapMarkerAlt className="text-red-400" /> Service Address
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedItem.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-300 transition-colors uppercase">
                                Close
                            </button>
                            <button className="px-6 py-2.5 rounded-xl bg-[#08B36A] text-white font-bold text-sm shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-wide">
                                {selectedItem.type === 'Nurse' ? 'View Full Profile' : 'Confirm Action'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}