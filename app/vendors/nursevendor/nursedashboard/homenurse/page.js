'use client'
import React, { useState } from 'react'
import { 
    FaCheck, FaTimes, FaMapMarkerAlt, FaCalendarAlt, 
    FaClock, FaUserCircle, FaPhoneAlt, FaImage, FaSearchPlus,
    FaEye, FaClipboardList, FaUserAlt, FaMoneyBillWave, FaTimesCircle,
    FaRegCheckCircle, FaExclamationTriangle, FaSyncAlt, FaIdCard, FaGlobe
} from 'react-icons/fa'

export default function NurseOrdersPage() {
    const [activeTab, setActiveTab] = useState('Prescription Nursing'); 
    
    // Modals State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectReason, setRejectReason] = useState('Not available at this time');

    const tabs = ['Daily Nursing', 'Package Nursing', 'Prescription Nursing'];

    // Data
    const dailyData = [
        { id: '215820260305021513', name: 'Aarush', address: 'Chandigarh, Punjab', gender: 'Male', age: '33', phone: '9876543210', date: '2026-03-05', time: '19:00', price: '10.0', type: 'Skin care nurse', language: 'English' }
    ];

    const prescriptionData = [
        { id: '295120250303034624', name: 'Yash User', address: 'Chandigarh, Punjab', gender: 'Male', age: '7', language: 'English', phone: '9999999999', date: '2025-03-03', time: '16:00', price: '100.0', type: 'Prescription Nursing', image: 'https://via.placeholder.com/300x400?text=Prescription+Image' },
        { id: '718720250303041350', name: 'Yash User', address: 'Ropar, Punjab', gender: 'Male', age: '7', language: 'English', phone: '9999999999', date: '2025-03-03', time: '17:00', price: '100.0', type: 'Prescription Nursing', image: 'https://via.placeholder.com/300x400?text=Prescription+Image' }
    ];

    const packageData = []; 

    // --- CALCULATIONS ---
    const allOrders = [...dailyData, ...prescriptionData, ...packageData];
    const totalRequestsCount = allOrders.length;
    const acceptedCount = 3; 
    const completedCount = 10; 
    const totalEarnings = allOrders.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const currentData = activeTab === 'Daily Nursing' ? dailyData : activeTab === 'Prescription Nursing' ? prescriptionData : packageData;

    // Functions
    const openDetails = (order) => { setSelectedOrder(order); setIsDetailsModalOpen(true); };
    const openAccept = (order) => { setSelectedOrder(order); setIsAcceptModalOpen(true); };
    const openReject = (order) => { setSelectedOrder(order); setIsRejectModalOpen(true); };
    
    const closeAllModals = () => {
        setIsDetailsModalOpen(false);
        setIsAcceptModalOpen(false);
        setIsRejectModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="p-4 bg-[#F9FAFB] min-h-screen relative font-sans">
            
            
             {/* --- STATS SECTION (Updated to 4 in a line) --- */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 w-full max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-800 font-bold text-lg">Daily Summary</p>
                    <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-xs font-bold tracking-wide">12 JUNE</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Requests */}
                    <div className="bg-[#FFF1F1] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] border border-red-50">
                        <p className="text-gray-500 font-semibold text-xs uppercase text-center tracking-wider">Requests</p>
                        <p className="text-[#FF4D4D] text-3xl font-black text-center mt-2">{totalRequestsCount}</p>
                    </div>

                    {/* Card 2: Accepted */}
                    <div className="bg-[#FFF8F1] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] border border-orange-50">
                        <p className="text-gray-500 font-semibold text-xs uppercase text-center tracking-wider">Accepted</p>
                        <p className="text-[#FF9933] text-3xl font-black text-center mt-2">{acceptedCount}</p>
                    </div>

                    {/* Card 3: Completed */}
                    <div className="bg-[#F1FFF8] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] border border-green-50">
                        <p className="text-gray-500 font-semibold text-xs uppercase text-center tracking-wider">Completed</p>
                        <p className="text-[#08B36A] text-3xl font-black text-center mt-2">{completedCount}</p>
                    </div>

                    {/* Card 4: Earnings */}
                    <div className="bg-[#08B36A] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] shadow-lg shadow-green-100 border border-green-600">
                        <p className="text-white/80 font-semibold text-xs uppercase text-center tracking-wider">Earnings</p>
                        <p className="text-white text-3xl font-black text-center mt-2">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Nursing Service Requests</h1>
            </div>

            {/* --- TABS --- */}
            <div className="flex space-x-2 mb-6 bg-white p-1.5 rounded-2xl w-fit border border-gray-100 shadow-sm">
                {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#08B36A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    > {tab} </button>
                ))}
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10 min-h-[500px] flex items-center justify-center">
                {currentData.length > 0 ? (
                    <div className="overflow-x-auto w-full self-start">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {activeTab === 'Prescription Nursing' && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Prescription</th>}
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Patient Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentData.map((item, index) => (
                                    <tr key={index} onClick={() => openDetails(item)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                        {activeTab === 'Prescription Nursing' && (
                                            <td className="px-6 py-4">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={item.image} alt="Prescription" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">{item.name}</div>
                                            <div className="text-[11px] text-gray-400 font-mono">ID: {item.id}</div>
                                            <div className="text-[12px] text-gray-500">{item.gender} • Age: {item.age}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800 text-center">₹{item.price}</td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openDetails(item)} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"><FaEye /> VIEW</button>
                                                <button onClick={() => openAccept(item)} className="bg-[#08B36A] text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"><FaCheck /> ACCEPT</button>
                                                <button onClick={() => openReject(item)} className="bg-red-500 text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"><FaTimes /> REJECT</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
                        <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-50 shadow-sm">
                            <img src="https://img.freepik.com/free-photo/female-doctor-holding-box-with-medical-supplies_23-2148827766.jpg" alt="No Requests" className="w-full h-full object-cover"/>
                        </div>
                        <h2 className="text-xl font-bold text-[#1e293b] mb-2">No Nursing Requests Yet</h2>
                        <p className="text-gray-400 text-sm mb-8 px-4">New service requests will appear here. Make sure your availability is ON.</p>
                        <div className="w-full space-y-4 px-6">
                            <button className="w-full flex items-center justify-center gap-2 border-2 border-[#08B36A] text-[#08B36A] font-bold py-3 rounded-2xl hover:bg-green-50"><FaSyncAlt className="text-sm" /> Refresh</button>
                            <button className="w-full bg-[#08B36A] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-100">Turn ON Availability</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- 1. ACCEPT MODAL --- */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-[#E6F7F0] text-[#08B36A] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaRegCheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1e293b] mb-4">Accept Booking?</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">You are about to accept this nursing request. Please confirm that you are available for this service.</p>
                        <button onClick={closeAllModals} className="w-full bg-[#08B36A] hover:bg-[#069a5a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all">Confirm Booking</button>
                    </div>
                </div>
            )}

            {/* --- 2. REJECT MODAL --- */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-[#FFF1F1] text-[#FF4D4D] rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaExclamationTriangle size={30} />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1e293b] text-center mb-2">Reject Booking</h2>
                        <p className="text-gray-400 text-center text-sm mb-6">Please select a reason for rejecting this request</p>
                        <div className="space-y-4 mb-6">
                            {['Not available at this time', 'Location too far', 'Schedule conflict', 'Patient requirement not suitable'].map((reason) => (
                                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="reject" checked={rejectReason === reason} onChange={() => setRejectReason(reason)} className="hidden" />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${rejectReason === reason ? 'border-red-500' : 'border-gray-300'}`}>
                                        {rejectReason === reason && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                                    </div>
                                    <span className={`text-sm font-medium ${rejectReason === reason ? 'text-red-500' : 'text-gray-600'}`}>{reason}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-gray-400 text-xs font-bold mb-2">Additional Comments (Optional)</p>
                        <textarea placeholder="Type reason here..." className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 text-sm outline-none h-24 mb-8 resize-none"></textarea>
                        <div className="flex gap-4">
                            <button onClick={closeAllModals} className="flex-1 border border-[#08B36A] text-[#08B36A] font-bold py-3 rounded-2xl">Cancel</button>
                            <button onClick={closeAllModals} className="flex-1 bg-[#FF0000] text-white font-bold py-3 rounded-2xl">Reject Order</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 3. DETAILS MODAL (ALL DATA ADDED) --- */}
            {isDetailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#08B36A] p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Request Details</h2>
                                <p className="text-xs text-green-50 mt-1">Order ID: {selectedOrder.id}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-white hover:text-red-200 transition-colors">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Patient Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FaUserAlt className="text-[#08B36A]" />
                                        <h3 className="font-bold text-gray-800">Patient Profile</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="font-bold text-gray-800">{selectedOrder.name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Gender / Age:</span> <span className="font-bold text-gray-800">{selectedOrder.gender} / {selectedOrder.age} Years</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Language:</span> <span className="font-bold text-gray-800">{selectedOrder.language}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Phone:</span> <span className="font-bold text-blue-600">{selectedOrder.phone}</span></div>
                                    </div>
                                </div>

                                {/* Appointment Schedule Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FaCalendarAlt className="text-[#08B36A]" />
                                        <h3 className="font-bold text-gray-800">Service Details</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-400">Service:</span> <span className="font-bold text-red-500">{selectedOrder.type}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Date:</span> <span className="font-bold text-gray-800">{selectedOrder.date}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Time:</span> <span className="font-bold text-gray-800">{selectedOrder.time}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Total Price:</span> <span className="font-bold text-[#08B36A] text-lg">₹{selectedOrder.price}</span></div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FaMapMarkerAlt className="text-[#08B36A]" />
                                        <h3 className="font-bold text-gray-800">Location Address</h3>
                                    </div>
                                    <p className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                                        {selectedOrder.address}
                                    </p>
                                </div>

                                {/* Prescription Image Section (If Available) */}
                                {selectedOrder.image && (
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <FaImage className="text-[#08B36A]" />
                                            <h3 className="font-bold text-gray-800">Prescription / Attachment</h3>
                                        </div>
                                        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-2">
                                            <img src={selectedOrder.image} alt="Prescription" className="w-full h-auto rounded-xl object-contain max-h-64 bg-gray-50" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t">
                            <button onClick={closeAllModals} className="px-8 py-3 rounded-2xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors uppercase text-xs tracking-wider">Close</button>
                            <button onClick={() => openAccept(selectedOrder)} className="px-8 py-3 rounded-2xl bg-[#08B36A] text-white font-bold hover:bg-[#069a5a] transition-all shadow-lg shadow-green-100 uppercase text-xs tracking-wider">Accept Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}