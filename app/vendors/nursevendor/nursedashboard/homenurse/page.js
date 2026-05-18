'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaCheck, FaTimes, FaMapMarkerAlt, FaCalendarAlt, 
    FaClock, FaUserCircle, FaPhoneAlt, FaImage, FaSearchPlus,
    FaEye, FaClipboardList, FaUserAlt, FaMoneyBillWave, FaTimesCircle,
    FaRegCheckCircle, FaExclamationTriangle, FaSyncAlt, FaIdCard, FaGlobe, FaSpinner,
    FaStethoscope, FaBoxOpen
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import NurseAPI from '@/app/services/NurseAPI';
 // Ensure this path matches your file structure

export default function NurseOrdersPage() {
    const [activeTab, setActiveTab] = useState('Daily Nursing'); 
    const [fetching, setFetching] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Stats State
    const [stats, setStats] = useState({
        pendingRequests: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0
    });

    // Bookings Data State
    const [allBookings, setAllBookings] = useState([]);
    
    // Modals State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectReason, setRejectReason] = useState('Not available at this time');

    const tabs = ['Daily Nursing', 'Package Nursing', 'Prescription Nursing'];

    // Base URL for Images
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // --- FETCH DATA ---
    const loadData = async () => {
        try {
            setFetching(true);
            const [statsRes, bookingsRes] = await Promise.all([
                NurseAPI.getDashboardStats(),
                NurseAPI.getBookings('Pending') 
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (bookingsRes.success) setAllBookings(bookingsRes.data);
        } catch (error) {
            console.error("Error loading nurse dashboard:", error);
            toast.error("Failed to fetch latest orders");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- FILTER DATA BY TAB ---
    const currentData = allBookings.filter(item => {
        const duration = item.serviceDetails?.duration;
        const hasPrescription = !!item.prescriptionImage;

        if (activeTab === 'Prescription Nursing') {
            return hasPrescription;
        }
        if (activeTab === 'Package Nursing') {
            return !hasPrescription && duration === 'For Multiple Days';
        }
        if (activeTab === 'Daily Nursing') {
            return !hasPrescription && (duration === 'One day One Time' || duration === 'Acc. To Per/Hours');
        }
        return false;
    });

    // --- HANDLERS ---
    const handleAction = async (actionType) => {
        if (!selectedOrder) return;
        setActionLoading(true);
        try {
            const payload = {
                bookingId: selectedOrder._id,
                action: actionType,
                reason: actionType === 'Reject' ? rejectReason : ""
            };
            
            const res = await NurseAPI.handleBookingAction(payload);
            if (res.success) {
                toast.success(`Booking ${actionType}ed successfully`);
                closeAllModals();
                loadData(); 
            }
        } catch (error) {
            toast.error("Failed to process request");
        } finally {
            setActionLoading(false);
        }
    };

    const openDetails = (order) => { setSelectedOrder(order); setIsDetailsModalOpen(true); };
    const openAccept = (order) => { setSelectedOrder(order); setIsAcceptModalOpen(true); };
    const openReject = (order) => { setSelectedOrder(order); setIsRejectModalOpen(true); };
    
    const closeAllModals = () => {
        setIsDetailsModalOpen(false);
        setIsAcceptModalOpen(false);
        setIsRejectModalOpen(false);
        setSelectedOrder(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4" />
            <p className="text-gray-500 font-medium font-sans">Loading Requests...</p>
        </div>
    );

    return (
        <div className="p-4 bg-[#F9FAFB] min-h-screen relative font-sans">
            
             {/* --- STATS SECTION --- */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 w-full max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-800 font-bold text-lg">Daily Summary</p>
                    <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#FFF1F1] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] border border-red-50">
                        <p className="text-gray-500 font-semibold text-xs uppercase text-center tracking-wider">Requests</p>
                        <p className="text-[#FF4D4D] text-3xl font-black text-center mt-2">{stats.pendingRequests}</p>
                    </div>

                    <div className="bg-[#FFF8F1] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] border border-orange-50">
                        <p className="text-gray-500 font-semibold text-xs uppercase text-center tracking-wider">Accepted</p>
                        <p className="text-[#FF9933] text-3xl font-black text-center mt-2">{stats.activeJobs}</p>
                    </div>

                    <div className="bg-[#F1FFF8] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] border border-green-50">
                        <p className="text-gray-500 font-semibold text-xs uppercase text-center tracking-wider">Completed</p>
                        <p className="text-[#08B36A] text-3xl font-black text-center mt-2">{stats.completedJobs}</p>
                    </div>

                    <div className="bg-[#08B36A] p-5 rounded-3xl flex flex-col justify-center min-h-[130px] shadow-lg shadow-green-100 border border-green-600">
                        <p className="text-white/80 font-semibold text-xs uppercase text-center tracking-wider">Earnings</p>
                        <p className="text-white text-3xl font-black text-center mt-2">₹{stats.totalEarnings?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Nursing Service Requests</h1>
            </div>

            {/* --- TABS --- */}
            <div className="flex space-x-2 mb-6 bg-white p-1.5 rounded-2xl w-fit border border-gray-100 shadow-sm mx-auto">
                {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#08B36A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    > {tab} </button>
                ))}
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10 min-h-[500px] flex items-center justify-center max-w-6xl mx-auto">
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
                                                    <img src={`${IMAGE_BASE_URL}/${item.prescriptionImage}`} alt="Prescription" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">
                                                {item.patients?.[0]?.name || item.address?.name}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-mono">ID: {item.bookingId}</div>
                                            <div className="text-[12px] text-gray-500">
                                                {item.serviceDetails?.title} • {item.patients?.[0]?.relation || 'Self'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800 text-center">
                                            ₹{item.priceBreakdown?.totalPrice || item.totalPrice}
                                        </td>
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
                        <h2 className="text-xl font-bold text-[#1e293b] mb-2">No {activeTab} Requests</h2>
                        <p className="text-gray-400 text-sm mb-8 px-4">New service requests will appear here. Make sure your availability is ON.</p>
                        <div className="w-full space-y-4 px-6">
                            <button onClick={loadData} className="w-full flex items-center justify-center gap-2 border-2 border-[#08B36A] text-[#08B36A] font-bold py-3 rounded-2xl hover:bg-green-50"><FaSyncAlt className={`text-sm ${fetching ? 'animate-spin' : ''}`} /> Refresh</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- 1. ACCEPT MODAL --- */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-[#E6F7F0] text-[#08B36A] rounded-full flex items-center justify-center mx-auto mb-6">
                            {actionLoading ? <FaSpinner className="animate-spin" size={40} /> : <FaRegCheckCircle size={40} />}
                        </div>
                        <h2 className="text-2xl font-bold text-[#1e293b] mb-4">Accept Booking?</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">You are about to accept this nursing request. Please confirm that you are available for this service.</p>
                        <button 
                            disabled={actionLoading}
                            onClick={() => handleAction('Accept')} 
                            className="w-full bg-[#08B36A] hover:bg-[#069a5a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                        >
                            {actionLoading ? "Processing..." : "Confirm Booking"}
                        </button>
                        {!actionLoading && <button onClick={closeAllModals} className="mt-4 text-gray-400 font-bold text-sm">Cancel</button>}
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
                            <button 
                                disabled={actionLoading}
                                onClick={() => handleAction('Reject')} 
                                className="flex-1 bg-[#FF0000] text-white font-bold py-3 rounded-2xl disabled:opacity-50"
                            >
                                {actionLoading ? "..." : "Reject Order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 3. DETAILS MODAL (SHOWING FULL INFO) --- */}
            {isDetailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#08B36A] p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">{selectedOrder.serviceDetails?.title || 'Request Details'}</h2>
                                <p className="text-xs text-green-50 mt-1 uppercase tracking-widest">Order ID: {selectedOrder.bookingId}</p>
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
                                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Patient Profile</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="font-bold text-gray-800">{selectedOrder.patients?.[0]?.name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Relation:</span> <span className="font-bold text-gray-800">{selectedOrder.patients?.[0]?.relation}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Height / Lang:</span> <span className="font-bold text-gray-800">{selectedOrder.healthDetails?.height} cm / {selectedOrder.healthDetails?.language}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Phone:</span> <span className="font-bold text-blue-600">{selectedOrder.address?.phone || 'N/A'}</span></div>
                                    </div>
                                </div>

                                {/* Appointment Schedule Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FaCalendarAlt className="text-[#08B36A]" />
                                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Service Schedule</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-400">Type:</span> <span className="font-bold text-red-500 uppercase">{selectedOrder.serviceDetails?.type}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Starts:</span> <span className="font-bold text-gray-800">{formatDate(selectedOrder.schedule?.startDate)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Ends:</span> <span className="font-bold text-gray-800">{formatDate(selectedOrder.schedule?.endDate)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Total Price:</span> <span className="font-bold text-[#08B36A] text-lg">₹{selectedOrder.priceBreakdown?.totalPrice || selectedOrder.totalPrice}</span></div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FaMapMarkerAlt className="text-[#08B36A]" />
                                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Service Location</h3>
                                    </div>
                                    <p className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                                        {selectedOrder.address?.houseNo}, {selectedOrder.address?.city} ({selectedOrder.address?.addressType})
                                    </p>
                                </div>

                                {/* Consumables Section */}
                                {selectedOrder.selectedConsumables?.length > 0 && (
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <FaBoxOpen className="text-[#08B36A]" />
                                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Consumables Needed</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedOrder.selectedConsumables.map((c, i) => (
                                                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl text-xs border border-gray-100 font-bold">
                                                    <span>{c.itemName}</span>
                                                    <span className="text-[#08B36A]">₹{c.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Prescription Image Section */}
                                {selectedOrder.prescriptionImage && (
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <FaImage className="text-[#08B36A]" />
                                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Prescription Photo</h3>
                                        </div>
                                        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-2 overflow-hidden">
                                            <img 
                                                src={`${IMAGE_BASE_URL}/${selectedOrder.prescriptionImage}`} 
                                                alt="Prescription" 
                                                className="w-full h-auto rounded-xl object-contain max-h-80 bg-gray-50" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Special Instructions */}
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FaStethoscope className="text-[#08B36A]" />
                                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Instructions</h3>
                                    </div>
                                    <div className="p-4 bg-blue-50/50 text-blue-800 rounded-2xl text-xs italic border border-blue-100">
                                        "{selectedOrder.healthDetails?.specialInstructions || 'No instructions provided.'}"
                                    </div>
                                </div>

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