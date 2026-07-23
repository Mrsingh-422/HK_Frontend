'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaUser, FaPhoneAlt, FaMapMarkerAlt, FaTimes, 
  FaPlus, FaTrash, FaLock, FaIdCard, FaCamera, FaCircle, FaTruckLoading, FaFileAlt, 
  FaUserNurse, FaCheckCircle, FaSpinner
} from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function AssignPhlebotomistPage() {
  const [activeTab, setActiveTab] = useState('Assign Phlebotomist');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // REAL DATA STATES
  const [phlebotomists, setPhlebotomists] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]); 
  const [availableForAssign, setAvailableForAssign] = useState([]);
  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null); 

  // Form State matching Schema
  const [formData, setFormData] = useState({
    name: '', phone: '', username: '', password: '', 
    vehicleNumber: '', vehicleType: 'Bike', aadhaarNumber: '', address: '',
    status: 'Available'
  });
  
  const [files, setFiles] = useState({ 
    profilePic: null,
    certificate: null,
    license: null,
    rcImage: null
  });

  // HELPER: Convert Address Object or String to displayable text
  const renderAddress = (order) => {
    if (order.collectionType === 'Visit Lab') return 'Walk-in (Visit Lab)';
    const address = order.address;
    if (!address) return 'Address not provided';
    if (typeof address === 'string') return address;
    
    const { houseNo, sector, landmark, city, state, pincode } = address;
    return [houseNo, sector, landmark, city, state, pincode]
      .filter(part => part && String(part).trim() !== '')
      .join(', ');
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace('public/', '');
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002').replace(/\/$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const getDriverActiveOrder = (driverId) => {
    if (!driverId) return null;
    return assignedOrders.find(order => {
      const pId = order.phlebotomistId?._id || order.phlebotomistId;
      return pId === driverId;
    });
  };

  useEffect(() => {
    loadPhlebotomists();
    loadPendingOrders();
  }, []);

  const loadPhlebotomists = async () => {
    try {
      setLoading(true);
      const res = await LabVendorAPI.getDrivers();
      const list = res.data?.drivers || res.data?.docs || res.data || res || [];
      setPhlebotomists(list);
    } catch (error) {
      console.error("Failed to load phlebotomists", error);
      toast.error("Could not fetch staff list");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    try {
        const resPending = await LabVendorAPI.getOrders('Confirmed');
        const pendingList = resPending.data || resPending || [];
        setPendingOrders(pendingList);
    } catch (error) {
        console.error("Error loading pending orders", error);
    }

    try {
        const resAssigned = await LabVendorAPI.getOrders('Phlebotomist Assigned');
        const assignedList = resAssigned.data || resAssigned || [];
        setAssignedOrders(assignedList);
    } catch (error) {
        console.error("Error loading assigned orders", error);
    }
  };

  const fetchStaffForAssignment = async () => {
    try {
        const res = await LabVendorAPI.getAvailablePhlebotomists();
        const rawList = res.data || res || [];
        const listArray = Array.isArray(rawList) ? rawList : (Array.isArray(rawList.data) ? rawList.data : []);
        
        // Filter out Busy phlebotomists, only showing Available staff
        const available = listArray.filter(staff => staff.status?.toLowerCase() === 'available');
        setAvailableForAssign(available);
    } catch (error) {
        console.warn("Falling back to filtered driver list", error);
        try {
            const res = await LabVendorAPI.getDrivers();
            const all = res.data?.drivers || res.data?.docs || res.data || res || [];
            setAvailableForAssign(all.filter(d => d.status?.toLowerCase() === 'available'));
        } catch (fallbackError) {
            toast.error("Error fetching available staff");
        }
    }
  };

  const handleOpenAssignPopup = (e, order) => {
    if (e) e.stopPropagation();
    setTargetOrder(order);
    setSelectedStaffId(null); 
    fetchStaffForAssignment();
    setIsAssignPopupOpen(true);
  };

  const handleFinalAssignment = async () => {
    if (!selectedStaffId) return toast.error("Please select a phlebotomist first");
    
    setAssignLoading(true);
    try {
        await LabVendorAPI.assignStaff(targetOrder._id, selectedStaffId);
        toast.success("Phlebotomist assigned successfully!");
        setIsAssignPopupOpen(false);
        setIsModalOpen(false);
        await loadPendingOrders(); 
        await loadPhlebotomists();       
    } catch (error) {
        console.error("Assignment Error:", error);
        toast.error(error.response?.data?.message || "Operation failed");
    } finally {
        setAssignLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
        let newStatus = currentStatus === "Available" ? "Offline" : "Available";
        await LabVendorAPI.toggleDriverStatus(id, newStatus);
        toast.success(`Staff is now ${newStatus}`);
        loadPhlebotomists();
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this staff from your team?")) return;
    try {
        await LabVendorAPI.deleteDriver(id);
        toast.success("Staff removed successfully");
        loadPhlebotomists();
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

    try {
        await LabVendorAPI.addDriver(data);
        toast.success("Phlebotomist Registered!");
        setIsAddModalOpen(false);
        setFormData({ name: '', phone: '', username: '', password: '', vehicleNumber: '', vehicleType: 'Bike', aadhaarNumber: '', address: '', status: 'Available' });
        setFiles({ profilePic: null, certificate: null, license: null, rcImage: null });
        loadPhlebotomists();
    } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
    } finally {
        setLoading(false);
    }
  };

  const assignedList = phlebotomists.filter(d => d.status === 'Busy');
  const unassignedList = phlebotomists.filter(d => d.status === 'Available' || d.status === 'Offline');

  const handleRowClick = async (item) => {
    setSelectedItem(null);
    setIsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await LabVendorAPI.getDriverDetails(item._id);
      const details = res.data || res;
      setSelectedItem(details);
    } catch (error) {
      console.error("Failed to load driver details", error);
      toast.error("Could not load detailed record");
      setIsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full relative p-4 md:p-8 bg-[#fcfdfe] min-h-screen text-slate-800">
      <Toaster position="top-right" />
      
      {/* HEADER & TABS SECTION */}
      <div className="flex flex-col items-center mb-10 gap-8">
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <FaUserNurse className="text-[#08B36A]" /> Sample Collection Fleet
                </h1>
                <p className="text-slate-500 text-sm mt-1">Manage your phlebotomists and dispatch agents.</p>
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#1e3a8a] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100"
            >
                <FaPlus/> Register New Phlebotomist
            </button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['Assign Phlebotomist', 'Assigned Phlebotomist', 'Unassigned Phlebotomist'].map((tab) => (
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
              {tab === 'Unassigned Phlebotomist' && phlebotomists.length > 0 && ` (${unassignedList.length})`}
              {tab === 'Assigned Phlebotomist' && phlebotomists.length > 0 && ` (${assignedList.length})`}
              {tab === 'Assign Phlebotomist' && pendingOrders.length > 0 && ` (${pendingOrders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[0.15em]">
              {activeTab === 'Assign Phlebotomist' && (
                <tr>
                  <th className="px-8 py-5 font-black">Booking ID</th>
                  <th className="px-8 py-5 font-black">Patient Contact</th>
                  <th className="px-8 py-5 font-black text-center">Action</th>
                </tr>
              )}
              {activeTab === 'Assigned Phlebotomist' && (
                <tr>
                  <th className="px-8 py-5 font-black">Staff Details</th>
                  <th className="px-8 py-5 font-black">Assigned Booking</th>
                  <th className="px-8 py-5 font-black">Vehicle Info</th>
                  <th className="px-8 py-5 font-black text-center">Status</th>
                </tr>
              )}
              {activeTab === 'Unassigned Phlebotomist' && (
                <tr>
                  <th className="px-8 py-5 font-black">Staff Details</th>
                  <th className="px-8 py-5 font-black">Vehicle Info</th>
                  <th className="px-8 py-5 font-black text-center">Live Status</th>
                  <th className="px-8 py-5 font-black text-center">Manage</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-50">
              {activeTab === 'Assign Phlebotomist' && pendingOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-black text-[#08B36A] text-lg">#{order.bookingId || order._id?.slice(-6)}</span>
                    <p className="font-bold text-slate-800 mt-1">{order.userId?.name || order.patients?.[0]?.name || 'Patient'}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 font-bold text-slate-700"><FaPhoneAlt size={10}/> {order.userId?.phone || 'N/A'}</span>
                        <span className="text-xs truncate max-w-[250px]"><FaMapMarkerAlt className="inline mr-1"/> {renderAddress(order)}</span>
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

              {/* Assigned Phlebotomists Tab */}
              {activeTab === 'Assigned Phlebotomist' && assignedList.map((agent) => {
                const activeOrder = getDriverActiveOrder(agent._id);
                return (
                  <tr key={agent._id} onClick={() => handleRowClick(agent)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                          <img src={getImageUrl(agent.profilePic)} alt={agent.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} />
                        </div>
                        <div>
                          <span className="font-black text-slate-800 block">{agent.name}</span>
                          <span className="text-xs text-[#08B36A] font-bold">@{agent.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {activeOrder ? (
                        <div>
                          <span className="font-black text-[#08B36A] text-sm">#{activeOrder.bookingId}</span>
                          <p className="text-xs text-slate-600 font-bold mt-0.5">{activeOrder.userId?.name || activeOrder.patients?.[0]?.name || 'Patient'}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No assigned booking found</span>
                      )}
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-600">
                      <div className="flex flex-col gap-1">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded w-fit text-slate-700">{agent.vehicleNumber || 'No Plate'}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><FaTruckLoading size={10}/> {agent.vehicleType || 'Bike'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-orange-50 text-orange-600 border-orange-100">
                        <FaCircle size={6} />
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Unassigned Phlebotomists Tab */}
              {activeTab === 'Unassigned Phlebotomist' && unassignedList.map((agent) => (
                <tr key={agent._id} onClick={() => handleRowClick(agent)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                        <img src={getImageUrl(agent.profilePic)} alt={agent.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} />
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
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><FaTruckLoading size={10}/> {agent.vehicleType || 'Bike'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        agent.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 
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
          
          {loading && <div className="p-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">Updating data...</div>}
          {!loading && activeTab === 'Assign Phlebotomist' && pendingOrders.length === 0 && (
             <div className="p-20 text-center text-slate-400 italic">No pending collections to assign.</div>
          )}
        </div>
      </div>

      {/* POPUP: ASSIGN SELECTION */}
      {isAssignPopupOpen && targetOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignPopupOpen(false)}></div>
              <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                              <FaUserNurse className="text-[#08B36A]"/> Dispatch Staff
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Booking #{targetOrder.bookingId || targetOrder._id?.slice(-6)}</p>
                      </div>
                      <button onClick={() => setIsAssignPopupOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"><FaTimes/></button>
                  </div>

                  <div className="p-8 overflow-y-auto space-y-3 custom-scrollbar flex-grow">
                      {availableForAssign.length > 0 ? availableForAssign.map((staff) => (
                          <div 
                            key={staff._id}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedStaffId === staff._id ? 'border-[#08B36A] bg-green-50 shadow-md' : 'border-slate-100 bg-white hover:border-green-200'}`}
                            onClick={() => setSelectedStaffId(staff._id)}
                          >
                              <div className="w-14 h-14 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-slate-100 shrink-0">
                                  <img src={getImageUrl(staff.profilePic)} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
                              </div>
                              <div className="flex-grow">
                                  <p className="font-black text-slate-800 text-sm">{staff.name}</p>
                                  <div className="flex gap-2 mt-1">
                                      <span className="text-[9px] font-black text-[#08B36A] uppercase px-2 py-0.5 bg-white rounded border border-green-100">{staff.vehicleNumber || 'No Plate'}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase px-2 py-0.5 bg-white rounded border border-slate-100">{staff.vehicleType}</span>
                                  </div>
                              </div>
                              {selectedStaffId === staff._id && <FaCheckCircle className="text-[#08B36A] animate-in zoom-in" size={24}/>}
                          </div>
                      )) : (
                        <div className="py-10 text-center flex flex-col items-center gap-3">
                            <FaCircle className="text-slate-100" size={40}/>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No available phlebotomists found</p>
                        </div>
                      )}
                  </div>

                  <div className="p-8 bg-slate-50 border-t flex gap-3">
                      <button onClick={() => setIsAssignPopupOpen(false)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black rounded-2xl text-[10px] uppercase">Cancel</button>
                      <button 
                        onClick={handleFinalAssignment} 
                        disabled={!selectedStaffId || assignLoading}
                        className={`flex-[2] py-4 text-white font-black rounded-2xl text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${!selectedStaffId ? 'bg-slate-300' : 'bg-slate-900 shadow-xl shadow-slate-200 hover:bg-black'}`}
                      >
                          {assignLoading ? <FaSpinner className="animate-spin" /> : 'Confirm & Assign Staff'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* REGISTER NEW STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1e3a8a]">
                  <FaUserNurse size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Register Phlebotomist</h2>
                  <p className="text-sm text-slate-400 font-medium italic">Laboratory Collection Team</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <FaTimes />
              </button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form id="driverForm" onSubmit={handleAddSubmit} className="space-y-8">
                
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <div className="relative w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {files.profilePic ? (
                             <img src={URL.createObjectURL(files.profilePic)} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <FaCamera className="text-slate-300" size={24} />
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Staff Profile Photo</label>
                        <input type="file" required accept="image/*" onChange={e => setFiles({...files, profilePic: e.target.files[0]})} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#08B36A] file:text-white cursor-pointer" />
                    </div>
                </div>

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
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Full Name *</label>
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
                    <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-[#1e3a8a] transition-all" />
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
                {loading ? 'Registering...' : 'Register Phlebotomist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[350px] flex flex-col justify-center">
            
            {detailsLoading ? (
              <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                <FaSpinner className="animate-spin text-slate-400" size={36} />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Retrieving files...</p>
              </div>
            ) : (
              <>
                <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Record</h2>
                    <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white text-slate-300 hover:text-red-500 rounded-full transition-colors"><FaTimes/></button>
                </div>
                
                <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-50 shrink-0">
                                <img src={getImageUrl(selectedItem.profilePic)} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedItem.name}</h3>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Record ID: {selectedItem._id?.slice(-6)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Username</p><p className="font-black text-[#08B36A]">@{selectedItem.username || 'N/A'}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Direct Contact</p><p className="font-black text-slate-800">{selectedItem.phone}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Vehicle Plate</p><p className="font-black text-slate-800 uppercase">{selectedItem.vehicleNumber || 'No Plate'}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Vehicle Type</p><p className="font-black text-slate-800 uppercase">{selectedItem.vehicleType || 'N/A'}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Aadhaar Card No</p><p className="font-black text-slate-800">{selectedItem.aadhaarNumber || 'N/A'}</p></div>
                            <div><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Current Status</p><p className="font-black text-orange-500 uppercase">{selectedItem.status || 'Active'}</p></div>
                        </div>

                        {selectedItem.documents && (
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                                {['certificate', 'license', 'rcImage'].map((doc) => (
                                <div key={doc} className="flex flex-col items-center gap-2">
                                    <p className="text-[9px] uppercase font-black text-slate-400">{doc}</p>
                                    <a 
                                        href={selectedItem.documents[doc] ? getImageUrl(selectedItem.documents[doc]) : '#'} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className={`w-full h-12 rounded-xl flex items-center justify-center border-2 border-dashed ${selectedItem.documents[doc] ? 'border-green-200 bg-green-50 text-green-600' : 'border-slate-100 text-slate-300'}`}
                                    >
                                        <FaFileAlt />
                                    </a>
                                </div>
                                ))}
                            </div>
                        )}

                        <button onClick={() => handleDelete(selectedItem._id)} className="w-full mt-6 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest border-2 border-red-50 border-dashed py-5 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"><FaTrash/> Terminate Employment</button>
                    </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}