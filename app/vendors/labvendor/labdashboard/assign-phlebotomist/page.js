'use client'
import React, { useState } from 'react'
import { 
  FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFileMedical, 
  FaCalendarAlt, FaTimes, FaRupeeSign, FaSyringe, FaUserNurse, FaCheckCircle
} from 'react-icons/fa'

export default function AssignPhlebotomistPage() {
  const[activeTab, setActiveTab] = useState('Assign Phlebotomist');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // DUMMY DATA (Based on your images)
  // ==========================================

  // 1. Orders needing a Phlebotomist
  const pendingOrders =[
    { 
      id: 'ORD-501', patientName: 'Aarush', age: 38, fatherName: 'Praveen',
      phone: '7597272101', address: '64/65 A, deep Nagar , jaipur , Rajasthan , India , 302015',
      date: '2025-05-16', price: '72270.0', service: 'Nursing Service', status: 'Pending'
    },
    { 
      id: 'ORD-502', patientName: 'Neha Sharma', age: 29, fatherName: 'R.K Sharma',
      phone: '9876543210', address: 'Sector 17, Chandigarh, India, 160017',
      date: '2025-05-18', price: '1200.0', service: 'Complete Blood Count (CBC)', status: 'Pending'
    }
  ];

  // 2. Currently Assigned Phlebotomists
  const assignedPhlebotomists =[
    {
      id: 'PHL-001', phlebotomistName: 'Anuj', phone: '7457895475', image: 'https://i.pravatar.cc/150?img=12',
      assignedOrder: 'ORD-490', patientName: 'Rahul Verma', location: 'Phase 8, Mohali'
    }
  ];

  // 3. Free / Unassigned Phlebotomists
  const unassignedPhlebotomists =[
    { id: 'PHL-002', name: 'Nitish', username: 'Niti114647', phone: '7547558755', image: 'https://i.pravatar.cc/150?img=11' },
    { id: 'PHL-003', name: 'Anuj', username: 'Anik053021', phone: '8741254875', image: 'https://i.pravatar.cc/150?img=12' },
    { id: 'PHL-004', name: 'Aarush', username: 'Aaru110138', phone: '7597272101', image: 'https://i.pravatar.cc/150?img=13' },
  ];

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full relative">
      
      {/* ========================================= */}
      {/* HEADER & TABS SECTION                     */}
      {/* ========================================= */}
      <div className="flex flex-col items-center mb-8 gap-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Assign Phlebotomist</h1>
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3">
          {['Assign Phlebotomist', 'Assigned Phlebotomist', 'Unassigned Phlebotomist'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                activeTab === tab 
                  ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-md shadow-green-200' 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#08B36A] hover:text-[#08B36A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* TABLE SECTION (DYNAMIC BASED ON TAB)      */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* --- HEADERS --- */}
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
              {activeTab === 'Assign Phlebotomist' && (
                <tr>
                  <th className="px-6 py-4 font-semibold">Order Details</th>
                  <th className="px-6 py-4 font-semibold">Patient Contact</th>
                  <th className="px-6 py-4 font-semibold">Service Info</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              )}
              {activeTab === 'Assigned Phlebotomist' && (
                <tr>
                  <th className="px-6 py-4 font-semibold">Phlebotomist</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Current Assignment</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              )}
              {activeTab === 'Unassigned Phlebotomist' && (
                <tr>
                  <th className="px-6 py-4 font-semibold">Phlebotomist</th>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Phone Number</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              )}
            </thead>

            {/* --- BODY --- */}
            <tbody className="divide-y divide-gray-100">
              
              {/* 1. ASSIGN PHLEBOTOMIST (Pending Orders) */}
              {activeTab === 'Assign Phlebotomist' && pendingOrders.map((order) => (
                <tr key={order.id} onClick={() => handleRowClick(order)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#08B36A]">{order.id}</span>
                    <p className="font-semibold text-gray-800 mt-1">{order.patientName} (Age: {order.age})</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><FaPhoneAlt className="text-gray-400 text-xs"/> {order.phone}</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={order.address}>{order.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><FaSyringe className="text-[#08B36A]"/> {order.service}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><FaCalendarAlt/> {order.date}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRowClick(order); }}
                      className="px-4 py-2 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      Process
                    </button>
                  </td>
                </tr>
              ))}

              {/* 2. ASSIGNED PHLEBOTOMIST */}
              {activeTab === 'Assigned Phlebotomist' && assignedPhlebotomists.map((agent) => (
                <tr key={agent.id} onClick={() => handleRowClick(agent)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={agent.image} alt="agent" className="w-10 h-10 rounded-full border border-gray-200" />
                      <span className="font-bold text-gray-800 block">{agent.phlebotomistName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaPhoneAlt className="text-[#08B36A] text-xs"/> {agent.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">Order: <span className="text-[#08B36A]">{agent.assignedOrder}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{agent.patientName} • {agent.location}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRowClick(agent); }}
                      className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Unassign Phlebotomist
                    </button>
                  </td>
                </tr>
              ))}

              {/* 3. UNASSIGNED PHLEBOTOMIST */}
              {activeTab === 'Unassigned Phlebotomist' && unassignedPhlebotomists.map((agent) => (
                <tr key={agent.id} onClick={() => handleRowClick(agent)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-full overflow-hidden border border-gray-200">
                        {/* If no image, fallback to black circle like in image 3 */}
                        <img src={agent.image} alt={agent.name} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                      </div>
                      <span className="font-bold text-gray-800 block">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {agent.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-800">{agent.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-bold">
                      Available
                    </span>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
          
          {/* Empty States */}
          {activeTab === 'Assign Phlebotomist' && pendingOrders.length === 0 && <div className="p-8 text-center text-gray-500">No pending orders found.</div>}
          {activeTab === 'Assigned Phlebotomist' && assignedPhlebotomists.length === 0 && <div className="p-8 text-center text-gray-500">No assigned phlebotomists found.</div>}
        </div>
      </div>

      {/* ========================================= */}
      {/* 🌟 UNIFIED INFO MODAL 🌟                  */}
      {/* ========================================= */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>

          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-black text-[#1e3a8a] flex items-center gap-2">
                {activeTab === 'Assign Phlebotomist' && <><FaFileMedical className="text-[#08B36A]"/> Order Details</>}
                {activeTab === 'Assigned Phlebotomist' && <><FaUserNurse className="text-[#08B36A]"/> Assignment Info</>}
                {activeTab === 'Unassigned Phlebotomist' && <><FaUserNurse className="text-[#08B36A]"/> Phlebotomist Profile</>}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              
              {/* --- CONTENT FOR 'ASSIGN PHLEBOTOMIST' TAB --- */}
              {activeTab === 'Assign Phlebotomist' && (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                     <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                        <FaUser size={30} />
                     </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-2.5 border border-gray-100">
                    <p><strong className="text-gray-900">Name:</strong> {selectedItem.patientName}</p>
                    <p><strong className="text-gray-900">Address:</strong> {selectedItem.address}</p>
                    <p><strong className="text-gray-900">Age:</strong> {selectedItem.age}</p>
                    <p><strong className="text-gray-900">Father Name:</strong> {selectedItem.fatherName}</p>
                    <p><strong className="text-gray-900">Phone No.:</strong> <span className="text-[#08B36A] font-bold">{selectedItem.phone}</span></p>
                    <p><strong className="text-gray-900">Date:</strong> {selectedItem.date}</p>
                    <p><strong className="text-gray-900">Price:</strong> ₹{selectedItem.price}</p>
                    <p className="pt-2 border-t border-gray-200 text-[#08B36A] font-bold underline decoration-2 underline-offset-4">{selectedItem.service}</p>
                  </div>

                  {/* Action Area in Modal */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Phlebotomist to Assign:</label>
                    <select className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-[#08B36A] mb-4">
                       <option value="">-- Choose available agent --</option>
                       {unassignedPhlebotomists.map(agent => (
                         <option key={agent.id} value={agent.id}>{agent.name} ({agent.phone})</option>
                       ))}
                    </select>
                    <button onClick={() => { alert('Assigned Successfully!'); closeModal(); }} className="w-full py-3 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all">
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              )}

              {/* --- CONTENT FOR 'ASSIGNED PHLEBOTOMIST' TAB --- */}
              {activeTab === 'Assigned Phlebotomist' && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center mb-2">
                     <img src={selectedItem.image} alt="agent" className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedItem.phlebotomistName}</h3>
                  <p className="text-lg font-bold text-[#08B36A]">{selectedItem.phone}</p>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left mt-6">
                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><FaCheckCircle/> Current Assignment</h4>
                    <p className="text-sm text-gray-700"><strong>Order ID:</strong> {selectedItem.assignedOrder}</p>
                    <p className="text-sm text-gray-700"><strong>Patient:</strong> {selectedItem.patientName}</p>
                    <p className="text-sm text-gray-700"><strong>Location:</strong> {selectedItem.location}</p>
                  </div>

                  <button onClick={() => { alert('Unassigned Successfully!'); closeModal(); }} className="w-full mt-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md transition-all">
                    Unassign Phlebotomist
                  </button>
                </div>
              )}

              {/* --- CONTENT FOR 'UNASSIGNED PHLEBOTOMIST' TAB --- */}
              {activeTab === 'Unassigned Phlebotomist' && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center mb-2">
                     <div className="w-24 h-24 bg-black rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedItem.name}</h3>
                  <p className="text-sm font-medium text-gray-500">@{selectedItem.username}</p>
                  <p className="text-lg font-bold text-[#08B36A] mt-2">{selectedItem.phone}</p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-green-50 text-green-600 border border-green-200 rounded-full text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Ready for Assignment
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}