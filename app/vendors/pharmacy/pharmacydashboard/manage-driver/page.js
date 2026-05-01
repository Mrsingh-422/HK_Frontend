'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaMotorcycle, 
  FaPhoneAlt, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaMapMarkerAlt,
  FaTimes,
  FaCircle,
  FaTruckLoading,
  FaLock,
  FaUser,
  FaIdCard,
  FaCamera,
} from 'react-icons/fa'
// Ensure this path is correct
import { toast } from 'react-hot-toast';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function ManagePharmacyDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedId, setSelectedId] = useState(null);
  const [selectedAgentData, setSelectedAgentData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '', 
    password: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    vehicleNumber: '',
    vehicleType: 'Motorcycle',
    aadhaarNumber: '',
    status: 'Available',
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

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await PharmacyVendorAPI.getDrivers();
      // Adjust based on your API response structure (often res.data or res.drivers)
      const driverList = response?.drivers || response?.data || response || [];
      setDrivers(Array.isArray(driverList) ? driverList : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load delivery agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        setFormData(prev => ({ 
            ...prev, 
            phone: value,
            username: value 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
        setFormData(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedId(null);
    setSelectedAgentData(null);
    setFormData({
      name: '', phone: '', username: '', password: '',
      address: '', city: '', state: '', country: 'India',
      vehicleNumber: '', vehicleType: 'Motorcycle',
      aadhaarNumber: '', status: 'Available', profilePic: null,
      certificate: null, license: null, rcImage: null
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (agent) => {
    setModalMode('edit');
    setSelectedId(agent._id);
    setSelectedAgentData(agent);
    setFormData({
      name: agent.name || '',
      phone: agent.phone || '',
      username: agent.username || agent.phone || '',
      password: '', 
      address: agent.address || '',
      city: agent.city || '',
      state: agent.state || '',
      country: agent.country || 'India',
      vehicleNumber: agent.vehicleNumber || '',
      vehicleType: agent.vehicleType || 'Motorcycle',
      aadhaarNumber: agent.aadhaarNumber || '',
      status: agent.status || 'Available',
      profilePic: null,
      certificate: null,
      license: null,
      rcImage: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;
    const deleteToast = toast.loading("Deleting agent...");
    try {
      await PharmacyVendorAPI.deleteDriver(id);
      toast.success("Delivery agent removed successfully", { id: deleteToast });
      fetchDrivers();
    } catch (error) {
      toast.error("Delete failed", { id: deleteToast });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check if mobile number is already registered in the local state
    const isPhoneDuplicate = drivers.some(driver => 
      driver.phone === formData.phone && driver._id !== selectedId
    );

    if (isPhoneDuplicate) {
      toast.error("This mobile number is already registered. Please use a different number.", {
        duration: 5000,
        position: 'top-center',
        icon: '🚫'
      });
      return; 
    }

    // 2. Start Loading Alert
    const actionToast = toast.loading(modalMode === 'add' ? "Adding new driver..." : "Updating driver...");
    setLoading(true);

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (['profilePic', 'certificate', 'license', 'rcImage'].includes(key)) {
            if (value instanceof File) {
                data.append(key, value);
            }
        } else if (value !== null && value !== undefined) {
            if (key === 'password' && modalMode === 'edit' && value === '') return;
            data.append(key, value);
        }
      });

      data.append('vendorType', 'Pharmacy');

      let response;
      if (modalMode === 'add') {
        response = await PharmacyVendorAPI.addDriver(data);
      } else {
        response = await PharmacyVendorAPI.updateDriver(selectedId, data);
      }

      // 3. Success Confirmation
      toast.success(
        modalMode === 'add' ? "Driver added successfully!" : "Driver profile updated!", 
        { id: actionToast }
      );
      
      setIsModalOpen(false);
      fetchDrivers();

    } catch (error) {
      // 4. Detailed Error Alert
      const serverMessage = error.response?.data?.message || "";
      const isDuplicate = serverMessage.toLowerCase().includes("phone") || error.response?.status === 409;
      
      if (isDuplicate) {
        toast.error("Mobile number already exists in the database.", { id: actionToast });
      } else {
        toast.error(serverMessage || "Failed to save driver. Please check all fields.", { id: actionToast });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative p-4 md:p-8 bg-[#fcfdfe] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FaMotorcycle className="text-[#08B36A]" /> Delivery Fleet Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your pharmacy's medicine delivery and collection agents.</p>
        </div>

        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#08B36A] hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
        >
          <FaPlus /> Add New Driver
        </button>
      </div>

      {/* LIST TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5 font-black">Agent Details</th>
                <th className="px-8 py-5 font-black">Contact & Route</th>
                <th className="px-8 py-5 font-black">Vehicle Info</th>
                <th className="px-8 py-5 font-black">Live Status</th>
                <th className="px-8 py-5 font-black text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && drivers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium italic">Loading fleet data...</td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium italic">No drivers registered yet.</td></tr>
              ) : (
                drivers.map((agent) => (
                  <tr key={agent._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-slate-100 flex items-center justify-center">
                          <img 
                            src={getImageUrl(agent.profilePic)} 
                            alt={agent.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-base">{agent.name}</span>
                          <span className="text-xs text-[#08B36A] font-bold">Driver ID: @{agent.username || agent.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                          <FaPhoneAlt className="text-slate-300 text-[10px]" /> {agent.phone}
                        </div>
                        <div className="flex items-start gap-2 text-slate-400 text-xs">
                          <FaMapMarkerAlt className="mt-0.5" /> <span className="max-w-[180px] truncate">{agent.city}, {agent.state}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <span className="font-black text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md w-fit">
                          {agent.vehicleNumber || 'No Plate'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                           <FaTruckLoading size={10}/> {agent.vehicleType || 'Motorcycle'}
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        agent.status === 'Available' ? 'bg-green-50 text-green-600 border border-green-100' :
                        agent.status === 'Busy' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <FaCircle size={6} className={agent.status === 'Available' ? "animate-pulse" : ""} />
                        {agent.status}
                      </span>
                    </td>

                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEditClick(agent)} className="p-3 bg-white hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl shadow-sm border border-slate-100 transition-all">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(agent._id)} className="p-3 bg-white hover:bg-red-500 hover:text-white text-slate-400 rounded-xl shadow-sm border border-slate-100 transition-all">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#08B36A]">
                  <FaMotorcycle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {modalMode === 'add' ? 'Register Delivery Agent' : 'Edit Agent Profile'}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium italic">Pharmacy Fulfillment Team</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <FaTimes />
              </button>
            </div>

            <div className="p-10 overflow-y-auto">
              <form id="driverForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Profile Pic Section */}
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <div className="relative w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {formData.profilePic instanceof File ? (
                             <img src={URL.createObjectURL(formData.profilePic)} className="w-full h-full object-cover" alt="preview" />
                        ) : selectedAgentData?.profilePic ? (
                            <img 
                                src={getImageUrl(selectedAgentData.profilePic)} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                                alt="profile"
                            />
                        ) : (
                            <FaCamera className="text-slate-300" size={24} />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Profile Image (Required)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'profilePic')} accept="image/*" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#08B36A] file:text-white hover:file:bg-green-700 cursor-pointer" />
                    </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Required Documents</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">License</label>
                             <input type="file" onChange={(e) => handleFileChange(e, 'license')} className="text-[10px] w-full file:bg-slate-200 file:border-0 file:rounded-lg file:px-2 file:py-1 cursor-pointer" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Certificate</label>
                             <input type="file" onChange={(e) => handleFileChange(e, 'certificate')} className="text-[10px] w-full file:bg-slate-200 file:border-0 file:rounded-lg file:px-2 file:py-1 cursor-pointer" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">RC Image</label>
                             <input type="file" onChange={(e) => handleFileChange(e, 'rcImage')} className="text-[10px] w-full file:bg-slate-200 file:border-0 file:rounded-lg file:px-2 file:py-1 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (Unique ID) *</label>
                    <div className="relative">
                        <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input 
                            name="phone" 
                            type="tel" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            placeholder="9988776655"
                            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" 
                            required 
                        />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold ml-1 uppercase italic">This will also be used as the login username.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {modalMode === 'add' ? 'Login Password *' : 'Update Password (Optional)'}
                    </label>
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Min 6 characters" className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" required={modalMode === 'add'} />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar Number *</label>
                    <div className="relative">
                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input name="aadhaarNumber" type="text" value={formData.aadhaarNumber} onChange={handleInputChange} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">City *</label>
                        <input name="city" type="text" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">State *</label>
                        <input name="state" type="text" value={formData.state} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                        <input name="country" type="text" value={formData.country} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all" />
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address *</label>
                  <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all resize-none" required></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Plate No. *</label>
                    <input name="vehicleNumber" type="text" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="MH 12 AB 1234" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-black text-slate-700 uppercase transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#08B36A] outline-none font-bold text-slate-700 transition-all appearance-none">
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4 rounded-b-[2.5rem]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
                Cancel
              </button>
              <button 
                type="submit" 
                form="driverForm" 
                disabled={loading}
                className="px-10 py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : modalMode === 'add' ? 'Add Driver' : 'Save Changes'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}