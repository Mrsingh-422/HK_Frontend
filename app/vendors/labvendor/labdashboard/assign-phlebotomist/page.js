'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFileMedical, 
  FaCalendarAlt, FaTimes, FaRupeeSign, FaSyringe, FaUserNurse, FaCheckCircle, 
  FaPlus, FaTrash, FaLock, FaIdCard, FaCamera, FaCircle, FaTruckLoading, FaFileAlt
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function AssignPhlebotomistPage() {
  const [activeTab, setActiveTab] = useState('Assign Phlebotomist');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Real Data States
  const [phlebotomists, setPhlebotomists] = useState([]);
  
  // Keep your pending orders logic
  const [pendingOrders, setPendingOrders] = useState([
    { 
      id: 'ORD-501', patientName: 'Aarush', age: 38, fatherName: 'Praveen',
      phone: '7597272101', address: '64/65 A, deep Nagar , jaipur',
      date: '2025-05-16', price: '72270.0', service: 'Nursing Service', status: 'Pending'
    }
  ]);

  // Form State for Adding New Phlebotomist
  const [formData, setFormData] = useState({
    name: '', phone: '', username: '', password: '', 
    vehicleNumber: '', vehicleType: 'Bike', aadhaarNumber: '', address: ''
  });

  // Updated files state to include certificate
  const [files, setFiles] = useState({ 
    profilePic: null, 
    certificate: null, 
    license: null, 
    rcImage: null 
  });

  // Helper to handle backend image paths
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    const cleanPath = path.replace('public/', '');
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  useEffect(() => {
    loadPhlebotomists();
  }, []);

  const loadPhlebotomists = async () => {
    try {
      setLoading(true);
      const res = await LabVendorAPI.getDrivers();
      if (res.success) {
        setPhlebotomists(res.data || []);
      }
    } catch (error) {
      console.error("Failed to load phlebotomists", error);
      toast.error("Could not fetch drivers list");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
        let newStatus = currentStatus === "Available" ? "Offline" : "Available";
        await LabVendorAPI.toggleDriverStatus(id, newStatus);
        toast.success(`Status updated to ${newStatus}`);
        loadPhlebotomists();
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this phlebotomist permanently?")) return;
    try {
        await LabVendorAPI.deleteDriver(id);
        toast.success("Driver removed successfully");
        loadPhlebotomists();
        closeModal();
    } catch (error) {
        toast.error("Delete operation failed");
    }
  }

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Object.keys(files).forEach(key => { if(files[key]) data.append(key, files[key]) });

    try {
        setLoading(true);
        await LabVendorAPI.addDriver(data);
        toast.success("Phlebotomist Registered Successfully!");
        setIsAddModalOpen(false);
        setFiles({ profilePic: null, certificate: null, license: null, rcImage: null });
        loadPhlebotomists();
    } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
    } finally {
        setLoading(false);
    }
  };

  const assignedPhlebotomists = phlebotomists.filter(p => p.status === 'Busy');
  const unassignedPhlebotomists = phlebotomists.filter(p => p.status === 'Available' || p.status === 'Offline');

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
        <div className="flex justify-between items-center w-full max-w-6xl">
            <div>
                <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight flex items-center gap-3">
                    <FaUserNurse className="text-[#08B36A]" /> Assign Phlebotomist
                </h1>
                <p className="text-slate-500 text-sm mt-1">Manage sample collection fleet and dispatch agents.</p>
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#1e3a8a] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
            >
                <FaPlus/> Register Phlebotomist
            </button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['Assign Phlebotomist', 'Assigned Phlebotomist', 'Unassigned Phlebotomist'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 border ${
                activeTab === tab 
                  ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-xl shadow-green-100' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-[#08B36A]'
              }`}
            >
              {tab} 
              {tab === 'Unassigned Phlebotomist' && phlebotomists.length > 0 && ` (${unassignedPhlebotomists.length})`}
              {tab === 'Assigned Phlebotomist' && phlebotomists.length > 0 && ` (${assignedPhlebotomists.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-[0.15em]">
              {activeTab === 'Assign Phlebotomist' && (
                <tr>
                  <th className="px-8 py-5 font-black">Order Details</th>
                  <th className="px-8 py-5 font-black">Patient Contact</th>
                  <th className="px-8 py-5 font-black text-center">Action</th>
                </tr>
              )}
              {activeTab === 'Assigned Phlebotomist' && (
                <tr>
                  <th className="px-8 py-5 font-black">Phlebotomist</th>
                  <th className="px-8 py-5 font-black">Contact Info</th>
                  <th className="px-8 py-5 font-black text-center">Action</th>
                </tr>
              )}
              {activeTab === 'Unassigned Phlebotomist' && (
                <tr>
                  <th className="px-8 py-5 font-black">Phlebotomist</th>
                  <th className="px-8 py-5 font-black">Username</th>
                  <th className="px-8 py-5 font-black text-center">Status</th>
                  <th className="px-8 py-5 font-black text-center">Manage</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-gray-100">
              {activeTab === 'Assign Phlebotomist' && pendingOrders.map((order) => (
                <tr key={order.id} onClick={() => handleRowClick(order)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-black text-[#08B36A] text-lg">#{order.id}</span>
                    <p className="font-bold text-slate-800 mt-1">{order.patientName}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 font-bold text-slate-700"><FaPhoneAlt size={10}/> {order.phone}</span>
                        <span className="text-xs truncate max-w-[250px]"><FaMapMarkerAlt className="inline mr-1"/> {order.address}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Assign Agent</button>
                  </td>
                </tr>
              ))}

              {(activeTab === 'Assigned Phlebotomist' ? assignedPhlebotomists : activeTab === 'Unassigned Phlebotomist' ? unassignedPhlebotomists : []).map((agent) => (
                <tr key={agent._id} onClick={() => handleRowClick(agent)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                        <img 
                            src={getImageUrl(agent.profilePic)} 
                            alt={agent.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }} 
                        />
                      </div>
                      <div>
                        <span className="font-black text-slate-800 block">{agent.name}</span>
                        <span className="text-xs text-[#08B36A] font-bold">@{agent.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600">
                    <div className="flex flex-col gap-1">
                        <span>{agent.phone}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-widest"><FaTruckLoading size={10}/> {agent.vehicleNumber || 'No Vehicle'}</span>
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
                    <button 
                        onClick={(e) => {e.stopPropagation(); handleStatusChange(agent._id, agent.status)}} 
                        className="text-[#1e3a8a] text-[10px] font-black uppercase hover:underline tracking-widest"
                    >
                        Mark {agent.status === 'Available' ? 'Offline' : 'Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && <div className="p-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">Fetching fleet data...</div>}
          {!loading && phlebotomists.length === 0 && activeTab !== 'Assign Phlebotomist' && (
             <div className="p-20 text-center text-slate-400 italic">No phlebotomists registered.</div>
          )}
        </div>
      </div>

      {/* REGISTER NEW PHLEBOTOMIST MODAL (Styled after reference) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
            <form onSubmit={handleAddSubmit} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-[#1e3a8a] tracking-tight">Register New Phlebotomist</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sample collection team</p>
                    </div>
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all"><FaTimes/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Pic Section */}
                    <div className="md:col-span-2 flex items-center gap-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <div className="relative w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                            {files.profilePic ? (
                                <img src={URL.createObjectURL(files.profilePic)} className="w-full h-full object-cover" />
                            ) : <FaCamera className="text-slate-300" size={24} />}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agent Profile Photo</label>
                            <input type="file" required accept="image/*" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#08B36A] file:text-white cursor-pointer" onChange={e => handleFileChange(e, 'profilePic')} />
                        </div>
                    </div>

                    {/* Document Upload Grid */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate</label>
                            <input type="file" required className="text-[10px] w-full file:bg-white file:border file:border-slate-200 file:rounded-lg file:px-2 file:py-1 cursor-pointer" onChange={e => handleFileChange(e, 'certificate')} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License</label>
                            <input type="file" required className="text-[10px] w-full file:bg-white file:border file:border-slate-200 file:rounded-lg file:px-2 file:py-1 cursor-pointer" onChange={e => handleFileChange(e, 'license')} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RC Image</label>
                            <input type="file" required className="text-[10px] w-full file:bg-white file:border file:border-slate-200 file:rounded-lg file:px-2 file:py-1 cursor-pointer" onChange={e => handleFileChange(e, 'rcImage')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                            <input required className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                            <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                            <input required className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-[#08B36A] transition-all" onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                            <input required type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle No</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-700 uppercase" placeholder="UP32-AB-1234" onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar / ID Card</label>
                        <div className="relative">
                            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                            <input className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700" onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})} />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                        <textarea rows="2" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 resize-none" onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-10 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Creating Account...' : 'Confirm Registration'}
                </button>
            </form>
        </div>
      )}

      {/* INFO MODAL (Styled after reference) */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Agent Detailed Record</h2>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white text-slate-300 hover:text-red-500 rounded-full transition-colors"><FaTimes/></button>
            </div>
            
            <div className="p-10">
                {selectedItem._id ? (
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-50">
                                <img 
                                    src={getImageUrl(selectedItem.profilePic)} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }} 
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedItem.name}</h3>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    Agent ID: {selectedItem._id.slice(-6)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Username</p>
                                <p className="font-black text-[#08B36A]">@{selectedItem.username}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Direct Contact</p>
                                <p className="font-black text-slate-800">{selectedItem.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Vehicle Plate</p>
                                <p className="font-black text-slate-800 uppercase">{selectedItem.vehicleNumber || 'No Plate'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Live Status</p>
                                <p className="font-black text-orange-500 uppercase">{selectedItem.status}</p>
                            </div>
                        </div>

                        {/* Documents Section in View Modal */}
                        <div className="grid grid-cols-3 gap-4 pt-4">
                             {['certificate', 'license', 'rcImage'].map((doc) => (
                               <div key={doc} className="flex flex-col items-center gap-2">
                                  <p className="text-[9px] uppercase font-black text-slate-400">{doc}</p>
                                  <a 
                                    href={selectedItem.documents?.[doc] ? getImageUrl(selectedItem.documents[doc]) : '#'} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`w-full h-12 rounded-xl flex items-center justify-center border-2 border-dashed ${selectedItem.documents?.[doc] ? 'border-green-200 bg-green-50 text-green-600' : 'border-slate-100 text-slate-300'}`}
                                  >
                                    <FaFileAlt />
                                  </a>
                               </div>
                             ))}
                        </div>

                        <button 
                            onClick={() => handleDelete(selectedItem._id)} 
                            className="w-full mt-6 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest border-2 border-red-50 border-dashed py-5 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                        >
                            <FaTrash/> Terminate Employment
                        </button>
                    </div>
                ) : (
                    <div className="text-center italic text-slate-400 font-bold uppercase text-xs tracking-widest py-10">Fetching record details...</div>
                )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}