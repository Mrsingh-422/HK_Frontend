'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaMotorcycle, FaPhoneAlt, FaMapMarkerAlt, FaTimes, 
  FaPlus, FaTrash, FaUser, FaLock, FaIdCard, FaCamera, FaCircle, FaTruckLoading, FaFileAlt, FaCheckCircle, FaSpinner, FaTruck
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function ManagePharmacyDrivers() {
  const [activeTab, setActiveTab] = useState('Assign Delivery');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // REAL DATA STATES
  const [drivers, setDrivers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [availableDriversForAssign, setAvailableDriversForAssign] = useState([]);
  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null); 

  // Form State matching Pharmacy Schema
  const [formData, setFormData] = useState({
    name: '', phone: '', username: '', password: '', 
    vehicleNumber: '', vehicleType: 'Motorcycle', aadhaarNumber: '', address: '',
    status: 'Available'
  });
  
  const [files, setFiles] = useState({ 
    profilePic: null,
    certificate: null,
    license: null,
    rcImage: null
  });

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace('public/', '');
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  useEffect(() => {
    loadDrivers();
    loadPendingOrders();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const res = await PharmacyVendorAPI.getDrivers();
      if (res.success) {
        setDrivers(res.data || []);
      }
    } catch (error) {
      console.error("Failed to load drivers", error);
      toast.error("Could not fetch delivery agents");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    try {
        const res = await PharmacyVendorAPI.listPharmacyOrders();
        if (res.success) {
            const pending = res.data.filter(o => o.status === 'Placed' || o.status === 'Under Review');
            setPendingOrders(pending);
        }
    } catch (error) {
        console.error("Error loading orders", error);
    }
  };

  const fetchDriversForAssignment = async () => {
    try {
        const res = await PharmacyVendorAPI.listAvailableDrivers();
        if (res.success) {
            setAvailableDriversForAssign(res.data || []);
        }
    } catch (error) {
        toast.error("Error fetching available drivers");
    }
  };

  const handleOpenAssignPopup = (e, order) => {
    e.stopPropagation();
    setTargetOrder(order);
    setSelectedDriverId(null); 
    fetchDriversForAssignment();
    setIsAssignPopupOpen(true);
  };

  const handleFinalAssignment = async () => {
    if (!selectedDriverId) return toast.error("Please select a driver first");
    
    setAssignLoading(true);
    try {
        const res = await PharmacyVendorAPI.assignManualDriver(targetOrder._id, selectedDriverId);
        
        if (res.success) {
            toast.success("Driver assigned successfully!");
            setIsAssignPopupOpen(false);
            loadPendingOrders(); 
            loadDrivers();       
        } else {
            toast.error(res.message || "Manual assignment failed");
        }
    } catch (error) {
        console.error("Assignment Error:", error);
        toast.error(error.response?.data?.message || "Could not complete assignment");
    } finally {
        setAssignLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
        let newStatus = currentStatus === "Available" ? "Offline" : "Available";
        await PharmacyVendorAPI.updateDriverStatus(id, newStatus);
        toast.success(`Agent is now ${newStatus}`);
        loadDrivers();
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this driver from your fleet?")) return;
    try {
        await PharmacyVendorAPI.deleteDriver(id);
        toast.success("Driver removed successfully");
        loadDrivers();
        closeModal();
    } catch (error) {
        toast.error("Delete operation failed");
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.profilePic) data.append('profilePic', files.profilePic);
    if (files.certificate) data.append('certificate', files.certificate);
    if (files.license) data.append('license', files.license);
    if (files.rcImage) data.append('rcImage', files.rcImage);
    data.append('vendorType', 'Pharmacy');

    try {
        await PharmacyVendorAPI.addDriver(data);
        toast.success("Delivery Agent Registered!");
        setIsAddModalOpen(false);
        setFormData({ name: '', phone: '', username: '', password: '', vehicleNumber: '', vehicleType: 'Motorcycle', aadhaarNumber: '', address: '', status: 'Available' });
        setFiles({ profilePic: null, certificate: null, license: null, rcImage: null });
        loadDrivers();
    } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
    } finally {
        setLoading(false);
    }
  };

  const assignedDrivers = drivers.filter(d => d.status === 'Busy');
  const unassignedDrivers = drivers.filter(d => d.status === 'Available' || d.status === 'Offline');

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full relative p-4 md:p-8 bg-[#fcfdfe] min-h-screen">
      
      {/* HEADER & TABS SECTION */}
      <div className="flex flex-col items-center mb-10 gap-8">
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <FaMotorcycle className="text-[#08B36A]" /> Pharmacy Fleet
                </h1>
                <p className="text-slate-500 text-sm mt-1">Manage your medicine delivery and collection agents.</p>
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#08B36A] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
                <FaPlus/> Register New Driver
            </button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['Assign Delivery', 'Assigned Drivers', 'Unassigned Drivers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 border ${
                activeTab === tab 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-[#08B36A]'
              }`}
            >
              {tab} 
              {tab === 'Unassigned Drivers' && drivers.length > 0 && ` (${unassignedDrivers.length})`}
              {tab === 'Assigned Drivers' && drivers.length > 0 && ` (${assignedDrivers.length})`}
              {tab === 'Assign Delivery' && pendingOrders.length > 0 && ` (${pendingOrders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[0.15em]">
              {activeTab === 'Assign Delivery' && (
                <tr>
                  <th className="px-8 py-5 font-black">Order ID</th>
                  <th className="px-8 py-5 font-black">Delivery Address</th>
                  <th className="px-8 py-5 font-black text-center">Action</th>
                </tr>
              )}
              {activeTab === 'Assigned Drivers' && (
                <tr>
                  <th className="px-8 py-5 font-black">Driver Details</th>
                  <th className="px-8 py-5 font-black">Vehicle Info</th>
                  <th className="px-8 py-5 font-black text-center">Status</th>
                </tr>
              )}
              {activeTab === 'Unassigned Drivers' && (
                <tr>
                  <th className="px-8 py-5 font-black">Driver Details</th>
                  <th className="px-8 py-5 font-black">Vehicle Info</th>
                  <th className="px-8 py-5 font-black text-center">Live Status</th>
                  <th className="px-8 py-5 font-black text-center">Manage</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-50">
              {activeTab === 'Assign Delivery' && pendingOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-black text-[#08B36A] text-lg">#{order.orderId}</span>
                    <p className="font-bold text-slate-800 mt-1">{order.userId?.name || 'Customer'}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 font-bold text-slate-700"><FaPhoneAlt size={10}/> {order.userId?.phone}</span>
                        <span className="text-xs truncate max-w-[250px]"><FaMapMarkerAlt className="inline mr-1"/> {order.address?.houseNo}, {order.address?.city}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                        onClick={(e) => handleOpenAssignPopup(e, order)}
                        className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Assign Agent
                    </button>
                  </td>
                </tr>
              ))}

              {(activeTab === 'Assigned Drivers' ? assignedDrivers : activeTab === 'Unassigned Drivers' ? unassignedDrivers : []).map((agent) => (
                <tr key={agent._id} onClick={() => handleRowClick(agent)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                        <img src={getImageUrl(agent.profilePic)} alt={agent.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }} />
                      </div>
                      <div>
                        <span className="font-black text-slate-800 block">{agent.name}</span>
                        <span className="text-xs text-[#08B36A] font-bold">@{agent.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded w-fit text-slate-700">{agent.vehicleNumber || 'No Plate'}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><FaTruckLoading size={10}/> {agent.vehicleType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        agent.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 
                        agent.status === 'Busy' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      <FaCircle size={6} className={agent.status === 'Available' ? 'animate-pulse' : ''}/>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={(e) => {e.stopPropagation(); handleStatusChange(agent._id, agent.status)}} className="text-slate-900 text-[10px] font-black uppercase hover:underline tracking-widest">Mark {agent.status === 'Available' ? 'Offline' : 'Available'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && <div className="p-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">Updating fleet data...</div>}
          {!loading && activeTab === 'Assign Delivery' && pendingOrders.length === 0 && (
             <div className="p-20 text-center text-slate-400 italic">No pending orders to assign.</div>
          )}
        </div>
      </div>

      {/* POPUP: ASSIGN AGENT SELECTION */}
      {isAssignPopupOpen && targetOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignPopupOpen(false)}></div>
              <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><FaTruck className="text-[#08B36A]"/> Assign Agent</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order #{targetOrder.orderId}</p>
                      </div>
                      <button onClick={() => setIsAssignPopupOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"><FaTimes/></button>
                  </div>

                  <div className="p-8 overflow-y-auto space-y-3 custom-scrollbar flex-grow">
                      {availableDriversForAssign.length > 0 ? availableDriversForAssign.map((driver) => (
                          <div 
                            key={driver._id}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedDriverId === driver._id ? 'border-[#08B36A] bg-green-50 shadow-md' : 'border-slate-100 bg-white hover:border-green-200'}`}
                            onClick={() => setSelectedDriverId(driver._id)}
                          >
                              <div className="w-14 h-14 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-slate-100 shrink-0">
                                  <img src={getImageUrl(driver.profilePic)} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                              </div>
                              <div className="flex-grow">
                                  <p className="font-black text-slate-800 text-sm">{driver.name}</p>
                                  <div className="flex gap-2 mt-1">
                                      <span className="text-[9px] font-black text-[#08B36A] uppercase px-2 py-0.5 bg-white rounded border border-green-100">{driver.vehicleNumber}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase px-2 py-0.5 bg-white rounded border border-slate-100">{driver.vehicleType}</span>
                                  </div>
                              </div>
                              {selectedDriverId === driver._id && <FaCheckCircle className="text-[#08B36A] animate-in zoom-in" size={24}/>}
                          </div>
                      )) : (
                        <div className="py-10 text-center flex flex-col items-center gap-3">
                            <FaCircle className="text-slate-100" size={40}/>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No available drivers found</p>
                        </div>
                      )}
                  </div>

                  <div className="p-8 bg-slate-50 border-t flex gap-3">
                      <button onClick={() => setIsAssignPopupOpen(false)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black rounded-2xl text-[10px] uppercase">Cancel</button>
                      <button 
                        onClick={handleFinalAssignment} 
                        disabled={!selectedDriverId || assignLoading}
                        className={`flex-[2] py-4 text-white font-black rounded-2xl text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${!selectedDriverId ? 'bg-slate-300' : 'bg-slate-900 shadow-xl shadow-slate-200 hover:bg-black'}`}
                      >
                          {assignLoading ? <FaSpinner className="animate-spin" /> : 'Confirm & Assign Agent'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* REGISTER NEW DRIVER MODAL - UPGRADED UI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#08B36A]">
                  <FaMotorcycle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Register Delivery Agent</h2>
                  <p className="text-sm text-slate-400 font-medium italic">Pharmacy Fulfillment Team</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <FaTimes />
              </button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form id="driverForm" onSubmit={handleAddSubmit} className="space-y-8">
                
                {/* Profile Pic Section */}
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <div className="relative w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {files.profilePic ? (
                             <img src={URL.createObjectURL(files.profilePic)} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <FaCamera className="text-slate-300" size={24} />
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Driver Profile Photo</label>
                        <input type="file" required accept="image/*" onChange={e => setFiles({...files, profilePic: e.target.files[0]})} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#08B36A] file:text-white cursor-pointer" />
                    </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Required Documents</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">License</label>
                             <input type="file" required accept="image/*" onChange={e => setFiles({...files, license: e.target.files[0]})} className="text-[10px] w-full file:bg-white file:border file:border-slate-200 file:rounded-lg file:px-2 file:py-1 cursor-pointer" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Certificate</label>
                             <input type="file" required accept="image/*" onChange={e => setFiles({...files, certificate: e.target.files[0]})} className="text-[10px] w-full file:bg-white file:border file:border-slate-200 file:rounded-lg file:px-2 file:py-1 cursor-pointer" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">RC Image</label>
                             <input type="file" required accept="image/*" onChange={e => setFiles({...files, rcImage: e.target.files[0]})} className="text-[10px] w-full file:bg-white file:border file:border-slate-200 file:rounded-lg file:px-2 file:py-1 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Name *</label>
                    <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                    <div className="relative">
                        <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Username *</label>
                    <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-[#08B36A] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">App Password *</label>
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Plate No *</label>
                    <input required placeholder="UP32-AB-1234" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-black text-slate-700 uppercase transition-all" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar / ID Card *</label>
                    <div className="relative">
                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input required value={formData.aadhaarNumber} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address *</label>
                  <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all resize-none" required></textarea>
                </div>

              </form>
            </div>

            <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4 rounded-b-[2.5rem]">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
                Cancel
              </button>
              <button 
                type="submit" 
                form="driverForm" 
                disabled={loading}
                className="px-10 py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Delivery Agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL - ERROR FIXED */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Record</h2>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white text-slate-300 hover:text-red-500 rounded-full transition-colors"><FaTimes/></button>
            </div>
            
            <div className="p-10">
                {selectedItem._id ? (
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
                                <img src={getImageUrl(selectedItem.profilePic)} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedItem.name}</h3>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Agent ID: {selectedItem._id.slice(-6)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Username</p><p className="font-black text-[#08B36A]">@{selectedItem.username}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Direct Contact</p><p className="font-black text-slate-800">{selectedItem.phone}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Vehicle Plate</p><p className="font-black text-slate-800 uppercase">{selectedItem.vehicleNumber || 'No Plate'}</p></div>
                            {/* FIXED LINE BELOW: Changed selectedOrder to selectedItem */}
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Live Status</p><p className="font-black text-orange-500 uppercase">{selectedItem.status}</p></div>
                        </div>

                        <button onClick={() => handleDelete(selectedItem._id)} className="w-full mt-6 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest border-2 border-red-50 border-dashed py-5 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"><FaTrash/> Terminate Employment</button>
                    </div>
                ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}