"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageWards = () => {
  const [wards, setWards] = useState([]);
  const [wardTypes, setWardTypes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Date State for Bed Occupancy
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // ---------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------
  const [selectedWard, setSelectedWard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showBedsModal, setShowBedsModal] = useState(false);
  
  const [addFormData, setAddFormData] = useState({ name: '', type: '', totalBeds: '', pricePerDay: '' });
  const [editFormData, setEditFormData] = useState({ name: '', type: '', isActive: true });
  const [capacityData, setCapacityData] = useState({ action: 'add', bedCount: '', pricePerDay: '' });
  const [bedsList, setBedsList] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, bed: null, newStatus: '' });
  const [priceModal, setPriceModal] = useState({ isOpen: false, bed: null, newPrice: '' }); 
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------------
  // Logic & APIs
  // ---------------------------------------------------------
  
  // Load enums once on mount
  useEffect(() => { 
    fetchEnums(); 
  }, []);

  // Fetch and calculate dynamic ward counts whenever the selected date changes
  useEffect(() => {
    fetchWards();
  }, [selectedDate]);

  // Stabilized dependency array to prevent React order errors
  useEffect(() => {
    const wardId = selectedWard?._id;
    if (showBedsModal && wardId) {
      fetchBedsByDate(wardId);
    }
  }, [selectedDate, showBedsModal, selectedWard?._id]);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getWardsList();
      if (response?.success) {
        const rawWards = response.data || [];
        
        // Fetch the date-specific bed configurations for each ward in parallel
        const wardsWithDynamicCounts = await Promise.all(
          rawWards.map(async (ward) => {
            try {
              const occupancyResponse = await HospitalAPI.getDailyOccupancy(ward._id, selectedDate);
              if (occupancyResponse?.success) {
                const beds = occupancyResponse.data || [];
                const availableCount = beds.filter(b => b.status === 'Available').length;
                const occupiedCount = beds.filter(b => b.status === 'Occupied').length;
                const maintenanceCount = beds.filter(b => b.status === 'Maintenance').length;
                const totalCount = beds.length;
                
                return {
                  ...ward,
                  availableBeds: availableCount,
                  occupiedBeds: occupiedCount,
                  maintenanceBeds: maintenanceCount,
                  totalBeds: totalCount
                };
              }
            } catch (err) {
              console.error(`Error loading dynamic occupancy for ward ${ward._id}:`, err);
            }
            return ward;
          })
        );
        
        setWards(wardsWithDynamicCounts);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchEnums = async () => {
    try {
      const response = await HospitalAPI.getEnums();
      if (response?.success && response.data?.wardTypes) {
        setWardTypes(response.data.wardTypes);
      }
    } catch (error) { console.error("Error fetching enums:", error); }
  };

  const fetchBedsByDate = async (wardId) => {
    setLoadingBeds(true);
    try {
      const response = await HospitalAPI.getDailyOccupancy(wardId, selectedDate);
      if (response?.success) setBedsList(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoadingBeds(false); }
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = { ...addFormData, totalBeds: Number(addFormData.totalBeds), pricePerDay: Number(addFormData.pricePerDay) };
      const response = await HospitalAPI.createWard(payload);
      if (response?.success) {
        setShowAddModal(false);
        setAddFormData({ name: '', type: '', totalBeds: '', pricePerDay: '' });
        fetchWards();
      }
    } catch (error) { console.error(error); } 
    finally { setIsProcessing(false); }
  };

  const handleUpdateWardInfo = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.updateWard(selectedWard._id, editFormData);
      if (response?.success) {
        setShowEditModal(false);
        fetchWards();
      }
    } catch (error) { console.error(error); } 
    finally { setIsProcessing(false); }
  };

  const handleDeleteWard = async (wardId) => {
    if (!confirm('Are you sure you want to delete this ward?')) return;
    try {
      const response = await HospitalAPI.deleteWard(wardId);
      if (response?.success) fetchWards();
    } catch (error) { console.error(error); }
  };

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = { wardId: selectedWard._id, ...capacityData, bedCount: Number(capacityData.bedCount), pricePerDay: Number(capacityData.pricePerDay) };
      const response = await HospitalAPI.updateWardCapacity(payload);
      if (response?.success) {
        setShowCapacityModal(false);
        fetchWards(); 
      }
    } catch (error) { console.error(error); } 
    finally { setIsProcessing(false); }
  };

  const handleDeleteSpecificBed = async (bedId) => {
    if (!confirm('Are you sure you want to delete this specific bed?')) return;
    try {
      const response = await HospitalAPI.deleteBed(bedId);
      if (response?.success) {
        setBedsList(prev => prev.filter(b => b._id !== bedId));
        fetchWards(); 
      }
    } catch (error) { console.error(error); }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.updateBedStatus({ bedId: statusModal.bed._id, status: statusModal.newStatus });
      if (response?.success) {
        setBedsList(prev => prev.map(b => b._id === statusModal.bed._id ? { ...b, status: statusModal.newStatus } : b));
        setStatusModal({ isOpen: false, bed: null, newStatus: '' });
        fetchWards(); 
      }
    } finally { setIsProcessing(false); }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = { 
        bedId: priceModal.bed._id, 
        pricePerDay: Number(priceModal.newPrice) 
      };
      const response = await HospitalAPI.updateBedPrice(payload);
      
      if (response?.success) {
        setBedsList(prev => prev.map(b => b._id === priceModal.bed._id ? { ...b, pricePerDay: Number(priceModal.newPrice) } : b));
        setPriceModal({ isOpen: false, bed: null, newPrice: '' });
        fetchWards();
      } else {
        console.error("Failed to update bed price:", response);
      }
    } catch (error) { 
      console.error("Error updating bed price:", error); 
    }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto font-sans min-h-screen bg-emerald-50/20">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-200">🏥</div>
             Ward Infrastructure
          </h2>
          <p className="text-[10px] text-emerald-600 mt-1 font-black uppercase tracking-widest ml-1">Real-time Facility Monitoring & Control</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
          {/* Date Switcher */}
          <div className="flex items-center gap-3 bg-emerald-50 p-2 rounded-xl border border-emerald-100 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
             <span className="text-[10px] font-black text-emerald-700 uppercase ml-3 tracking-widest">View Date:</span>
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-black text-emerald-900 outline-none shadow-sm cursor-pointer hover:bg-emerald-100 transition-all"
             />
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-6 py-3 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-95 group"
          >
            <span className="text-lg group-hover:rotate-90 transition-transform">+</span> 
            <span>Initialize Ward</span>
          </button>
        </div>
      </div>

      {/* ---------------- WARD CARDS ---------------- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
           <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
           <p className="text-xs text-emerald-800 font-black tracking-widest uppercase animate-pulse">Syncing Data...</p>
        </div>
      ) : wards.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-dashed border-emerald-200 max-w-lg mx-auto">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">🛏️</div>
           <p className="text-gray-800 text-xl font-black tracking-tight">System Empty</p>
           <p className="text-gray-500 mt-2 text-sm font-medium">Click "Initialize Ward" to set up your hospital.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wards.map((ward) => (
            <div key={ward._id} className="bg-white border border-emerald-50 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 p-5 flex flex-col group relative overflow-hidden">
              
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="w-16 h-16 bg-emerald-600 rounded-full -mr-8 -mt-8"></div>
              </div>

              <div className="flex justify-between items-center mb-4">
                 <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-100">{ward.type}</span>
                 <div className="flex gap-1">
                   <button onClick={() => { setSelectedWard(ward); setEditFormData({name: ward.name, type: ward.type, isActive: ward.isActive}); setShowEditModal(true); }} className="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 p-2 rounded-lg transition-all"><EditIcon className="w-3.5 h-3.5" /></button>
                   <button onClick={() => handleDeleteWard(ward._id)} className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 p-2 rounded-lg transition-all"><TrashIcon className="w-3.5 h-3.5" /></button>
                 </div>
              </div>

              <h3 className="text-lg font-black text-gray-800 tracking-tight mb-4 truncate group-hover:text-emerald-700 transition-colors">{ward.name}</h3>
              
              {/* Dynamic 2x2 Metric Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                 <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-50 text-center">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Available</p>
                    <p className="text-lg font-black text-emerald-700">{ward.availableBeds || 0}</p>
                 </div>
                 <div className="bg-rose-50/50 rounded-xl p-2.5 border border-rose-50 text-center">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Occupied</p>
                    <p className="text-lg font-black text-rose-700">{ward.occupiedBeds || 0}</p>
                 </div>
                 <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-55 text-center">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Maintenance</p>
                    <p className="text-lg font-black text-amber-700">{ward.maintenanceBeds || 0}</p>
                 </div>
                 <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Beds</p>
                    <p className="text-lg font-black text-slate-700">{ward.totalBeds || 0}</p>
                 </div>
              </div>

              <div className="flex gap-2 pt-2">
                 <button onClick={() => { setSelectedWard(ward); setShowBedsModal(true); }} className="flex-grow bg-gray-900 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl transition-all flex justify-center items-center gap-2 text-[10px] uppercase tracking-widest shadow-md active:scale-95">
                    🛏️ Map View
                 </button>
                 <button onClick={() => { setSelectedWard(ward); setCapacityData({action:'add', bedCount:'', pricePerDay:''}); setShowCapacityModal(true); }} className="w-12 bg-white border border-emerald-100 hover:border-emerald-600 hover:text-emerald-600 text-gray-400 flex items-center justify-center rounded-xl transition-all shadow-sm">
                    ⚙️
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- MODAL 4: BED GRID (THE "MAP") ---------------- */}
      {showBedsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-emerald-100">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-emerald-50 flex flex-col md:flex-row justify-between items-center bg-white sticky top-0 z-10 gap-4">
               <div className="flex-grow">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <span className="text-emerald-600">{selectedWard?.name}</span> Charting
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                     <Legend label="Available" color="bg-emerald-500" />
                     <Legend label="Occupied" color="bg-rose-500" />
                     <Legend label="Maintenance" color="bg-amber-500" />
                  </div>
               </div>

               {/* DATE PICKER WIDGET */}
               <div className="flex items-center gap-3 bg-emerald-50 p-2 rounded-xl border border-emerald-100 shadow-inner">
                  <span className="text-[10px] font-black text-emerald-700 uppercase ml-3 tracking-widest">Date:</span>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-black text-emerald-900 outline-none shadow-sm cursor-pointer hover:bg-emerald-100 transition-all"
                  />
               </div>

               <button onClick={() => setShowBedsModal(false)} className="bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white w-10 h-10 flex items-center justify-center rounded-xl transition-all border border-rose-100 shadow-sm">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            {/* BED GRID */}
            <div className="p-6 flex-grow overflow-y-auto bg-emerald-50/20 scrollbar-thin scrollbar-thumb-emerald-200">
               {loadingBeds ? (
                  <div className="flex flex-col justify-center items-center h-64 gap-4">
                     <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Mapping Status...</p>
                  </div>
               ) : bedsList.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-emerald-50">
                     <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No Facility Layout Configured</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                     {bedsList.map(bed => {
                        const isAvail = bed.status === 'Available';
                        const isOccupied = bed.status === 'Occupied';
                        const isMaint = bed.status === 'Maintenance';
                        
                        let cardColor = isAvail ? "bg-white border-emerald-100 hover:border-emerald-500 shadow-sm" : isOccupied ? "bg-rose-50/50 border-rose-100" : "bg-amber-50/50 border-amber-100";

                        return (
                           <div 
                             key={bed._id} 
                             onClick={() => setStatusModal({ isOpen: true, bed, newStatus: bed.status })}
                             className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer hover:scale-105 hover:shadow-lg ${cardColor}`}
                           >
                              
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex flex-col gap-2 transition-all">
                                 <button 
                                   type="button"
                                   title="Update Bed Price"
                                   onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setPriceModal({ isOpen: true, bed, newPrice: bed.pricePerDay || '' }); 
                                   }} 
                                   className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg shadow-sm transition-colors"
                                 >
                                    <SettingsIcon className="w-3 h-3" />
                                 </button>
                              </div>

                              <span className="text-3xl mb-3 drop-shadow-sm transform group-hover:scale-110 transition-transform">{isOccupied ? '🛌' : isMaint ? '🛠️' : '🛏️'}</span>
                              <span className="text-xs font-black text-gray-900 tracking-widest uppercase mb-1">{bed.bedNumber}</span>
                              
                              <div className="min-h-[30px] flex items-center justify-center w-full">
                                 {isOccupied ? (
                                    <p className="text-[9px] font-black text-rose-700 truncate max-w-[90%] uppercase bg-white/60 px-2 py-1 rounded border border-rose-50">{bed.currentOccupant || 'Occupied'}</p>
                                 ) : (
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${isAvail ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                       {bed.status}
                                    </span>
                                 )}
                              </div>
                              <span className="mt-3 text-[9px] text-gray-400 font-black tracking-widest">₹{bed.pricePerDay || 0} / DAY</span>
                           </div>
                        )
                     })}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 1: ADD NEW WARD ---------------- */}
      {showAddModal && (
        <ModalWrapper title="New Ward Registry" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateWard} className="space-y-4">
            <Input label="Ward Name" value={addFormData.name} onChange={(v) => setAddFormData({...addFormData, name: v})} placeholder="e.g. Cardio Intensive" />
            <div className="space-y-1.5">
              <label className="text-[10px] text-emerald-600 font-black uppercase tracking-widest ml-1">Type Category</label>
              <select required value={addFormData.type} onChange={(e) => setAddFormData({...addFormData, type: e.target.value})} className="w-full border-2 border-emerald-50 bg-emerald-50/30 rounded-xl p-3 text-xs font-black focus:border-emerald-600 focus:bg-white transition-all appearance-none outline-none">
                <option value="">Select Type</option>
                {wardTypes.map((type, index) => <option key={index} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Beds Count" type="number" value={addFormData.totalBeds} onChange={(v) => setAddFormData({...addFormData, totalBeds: v})} placeholder="10" />
              <Input label="Day Price (₹)" type="number" value={addFormData.pricePerDay} onChange={(v) => setAddFormData({...addFormData, pricePerDay: v})} placeholder="2500" />
            </div>
            <SubmitButton isProcessing={isProcessing} text="Initialize Infrastructure" />
          </form>
        </ModalWrapper>
      )}

      {/* ---------------- MODAL 5: CHANGE BED STATUS ---------------- */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:pl-64 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-emerald-50 relative">
            <div className="bg-emerald-50/50 border-b border-emerald-100 p-5 flex justify-between items-center">
               <div>
                 <h2 className="text-lg font-black text-emerald-900 tracking-tight flex items-center gap-2">
                   <SettingsIcon className="w-4 h-4 text-emerald-600"/>
                   Modify State
                 </h2>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 ml-6">Unit: {statusModal.bed?.bedNumber}</p>
               </div>
               <button type="button" onClick={() => setStatusModal({ isOpen: false, bed: null, newStatus: '' })} className="text-gray-400 hover:text-rose-600 bg-white hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm border border-gray-100">
                 <CloseIcon className="w-4 h-4"/>
               </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleStatusSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] text-emerald-600 font-black uppercase tracking-widest ml-1">Operational State</label>
                  <div className="space-y-2.5">
                    {[
                      { val: 'Available', label: 'Available', desc: 'Ready to receive patient', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
                      { val: 'Occupied', label: 'Occupied', desc: 'Currently assigned/in-use', dot: 'bg-rose-500', ring: 'ring-rose-200' },
                      { val: 'Maintenance', label: 'Maintenance', desc: 'Cleaning or repair required', dot: 'bg-amber-500', ring: 'ring-amber-200' }
                    ].map((st) => {
                       const isSelected = statusModal.newStatus === st.val;
                       return (
                         <div 
                           key={st.val}
                           onClick={() => setStatusModal({...statusModal, newStatus: st.val})}
                           className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-50/30 shadow-sm' : 'border-gray-100 hover:border-emerald-200 bg-white'}`}
                         >
                           <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${st.dot} ${isSelected ? `shadow-md ring-2 ring-offset-1 ${st.ring}` : ''}`}></div>
                             <div>
                               <p className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{st.label}</p>
                               <p className="text-[9px] font-bold text-gray-400">{st.desc}</p>
                             </div>
                           </div>
                           {isSelected && (
                             <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                               <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                             </div>
                           )}
                         </div>
                       )
                    })}
                  </div>
                </div>
                <div className="pt-2">
                   <SubmitButton isProcessing={isProcessing} text="Apply Status Change" />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: EDIT WARD ---------------- */}
      {showEditModal && (
        <ModalWrapper title="Update Ward Config" onClose={() => setShowEditModal(false)}>
           <form onSubmit={handleUpdateWardInfo} className="space-y-4">
              <Input label="Ward Name" value={editFormData.name} onChange={(v) => setEditFormData({...editFormData, name: v})} />
              <div className="flex items-center justify-between bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-tight">Operational Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" checked={editFormData.isActive} onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})} className="sr-only peer" />
                   <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all shadow-sm"></div>
                </label>
              </div>
              <SubmitButton isProcessing={isProcessing} text="Sync Changes" />
           </form>
        </ModalWrapper>
      )}

      {/* ---------------- MODAL 3: CAPACITY ---------------- */}
      {showCapacityModal && (
        <ModalWrapper title={`Facility Capacity Control`} onClose={() => setShowCapacityModal(false)}>
           <form onSubmit={handleUpdateCapacity} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => setCapacityData({...capacityData, action: 'add'})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${capacityData.action === 'add' ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-sm' : 'border-emerald-50 text-gray-300'}`}>
                    <span className="text-xl">➕</span><span className="text-[9px] font-black uppercase">Expansion</span>
                 </button>
                 <button type="button" onClick={() => setCapacityData({...capacityData, action: 'remove'})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${capacityData.action === 'remove' ? 'border-rose-600 bg-rose-50 text-rose-600 shadow-sm' : 'border-emerald-50 text-gray-300'}`}>
                    <span className="text-xl">➖</span><span className="text-[9px] font-black uppercase">Reduction</span>
                 </button>
              </div>
              <Input label="Quantity" type="number" value={capacityData.bedCount} onChange={(v) => setCapacityData({...capacityData, bedCount: v})} placeholder="Count" />
              <SubmitButton isProcessing={isProcessing} text="Update Units" />
           </form>
        </ModalWrapper>
      )}

      {/* ---------------- MODAL 6: UPDATE BED PRICE ---------------- */}
      {priceModal.isOpen && (
        <ModalWrapper title="Modify Bed Rate" onClose={() => setPriceModal({ isOpen: false, bed: null, newPrice: '' })}>
           <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 mb-4">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Selected Unit</span>
                <p className="text-lg font-black text-gray-800">{priceModal.bed?.bedNumber}</p>
              </div>
              <Input label="Day Price (₹)" type="number" value={priceModal.newPrice} onChange={(v) => setPriceModal({...priceModal, newPrice: v})} placeholder="e.g. 1500" />
              <SubmitButton isProcessing={isProcessing} text="Update Rate" />
           </form>
        </ModalWrapper>
      )}

    </div>
  );
};

export default ManageWards;

// ---------------------------------------------------------
// REUSABLE UI COMPONENTS (Design-focused)
// ---------------------------------------------------------

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:pl-64 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white w-full max-w-md overflow-hidden rounded-3xl shadow-2xl relative border border-emerald-50">
      <div className="bg-white border-b border-emerald-50 px-6 py-5 flex justify-between items-center">
         <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">{title}</h2>
         <button type="button" onClick={onClose} className="text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-lg transition-all"><CloseIcon className="w-4 h-4"/></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Legend = ({ label, color }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm shadow-emerald-100`}></div>
    <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</span>
  </div>
);

const Input = ({ label, value, onChange, type="text", placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] text-emerald-600 font-black uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-emerald-50 bg-emerald-50/30 rounded-xl p-3 text-xs font-black focus:border-emerald-600 focus:bg-white transition-all outline-none text-emerald-900"
    />
  </div>
);

const SubmitButton = ({ isProcessing, text }) => (
  <button type="submit" disabled={isProcessing} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
    {isProcessing && <SpinnerIcon className="w-4 h-4 text-white animate-spin" />} 
    <span>{isProcessing ? 'Processing...' : text}</span>
  </button>
);

const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SettingsIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);