"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageWards = () => {
  const [wards, setWards] = useState([]);
  const [wardTypes, setWardTypes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // ---------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------
  const [selectedWard, setSelectedWard] = useState(null);
  
  // 1. Add Ward
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: '', type: '', totalBeds: '', pricePerDay: '' });
  
  // 2. Edit Ward Info
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', type: '', isActive: true });
  
  // 3. Manage Capacity (Add/Remove Beds)
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [capacityData, setCapacityData] = useState({ action: 'add', bedCount: '', pricePerDay: '' });

  // 4. Bed Grid View
  const [showBedsModal, setShowBedsModal] = useState(false);
  const [bedsList, setBedsList] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  // 5. NEW: Bed Status Dialog
  const [statusModal, setStatusModal] = useState({ isOpen: false, bed: null, newStatus: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------------
  // Fetch Initial Data (Wards & Enums)
  // ---------------------------------------------------------
  useEffect(() => { 
    fetchWards(); 
    fetchEnums(); 
  }, []);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getWardsList();
      if (response?.success) setWards(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchEnums = async () => {
    try {
      const response = await HospitalAPI.getEnums();
      if (response?.success && response.data?.wardTypes) {
        setWardTypes(response.data.wardTypes);
      }
    } catch (error) { console.error("Error fetching enums:", error); }
  };

  // ---------------------------------------------------------
  // Create Ward (Auto-Generate Beds)
  // ---------------------------------------------------------
  const handleCreateWard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        name: addFormData.name,
        type: addFormData.type,
        totalBeds: Number(addFormData.totalBeds),
        pricePerDay: Number(addFormData.pricePerDay)
      };
      const response = await HospitalAPI.createWard(payload);
      if (response?.success) {
        alert(response.message || 'Ward created & beds generated successfully!');
        setShowAddModal(false);
        setAddFormData({ name: '', type: '', totalBeds: '', pricePerDay: '' });
        fetchWards();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) { alert('Something went wrong!'); } 
    finally { setIsProcessing(false); }
  };

  // ---------------------------------------------------------
  // Update Ward Info
  // ---------------------------------------------------------
  const handleUpdateWardInfo = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.updateWard(selectedWard._id, editFormData);
      if (response?.success) {
        alert('Ward updated successfully!');
        setShowEditModal(false);
        fetchWards();
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong!'); } 
    finally { setIsProcessing(false); }
  };

  const openEditModal = (ward) => {
    setSelectedWard(ward);
    setEditFormData({ name: ward.name || '', type: ward.type || '', isActive: ward.isActive ?? true });
    setShowEditModal(true);
  };

  // ---------------------------------------------------------
  // Delete Ward
  // ---------------------------------------------------------
  const handleDeleteWard = async (wardId) => {
    if (!confirm('Are you sure you want to delete this ward?')) return;
    try {
      const response = await HospitalAPI.deleteWard(wardId);
      if (response?.success) {
        alert(response.message || 'Ward deleted successfully!');
        fetchWards();
      } else { alert('Failed: ' + (response?.message || 'Cannot delete ward.')); }
    } catch (error) { alert('Error deleting ward.'); }
  };

  // ---------------------------------------------------------
  // Bulk Update Capacity (Add/Remove Beds)
  // ---------------------------------------------------------
  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        wardId: selectedWard._id,
        action: capacityData.action,
        bedCount: Number(capacityData.bedCount),
        ...(capacityData.action === 'add' && { pricePerDay: Number(capacityData.pricePerDay) })
      };
      const response = await HospitalAPI.updateWardCapacity(payload);
      if (response?.success) {
        alert(response.message || 'Capacity updated successfully!');
        setShowCapacityModal(false);
        fetchWards(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Something went wrong!'); } 
    finally { setIsProcessing(false); }
  };

  const openCapacityModal = (ward) => {
    setSelectedWard(ward);
    setCapacityData({ action: 'add', bedCount: '', pricePerDay: '' });
    setShowCapacityModal(true);
  };

  // ---------------------------------------------------------
  // Bed Grid View & Status Change
  // ---------------------------------------------------------
  const openBedsGrid = async (ward) => {
    setSelectedWard(ward);
    setShowBedsModal(true);
    setLoadingBeds(true);
    try {
      const response = await HospitalAPI.getWardBeds(ward._id);
      if (response?.success) setBedsList(response.data);
    } catch (error) { alert('Failed to fetch beds'); } 
    finally { setLoadingBeds(false); }
  };

  const handleDeleteSpecificBed = async (bedId) => {
    if (!confirm('Are you sure you want to delete this specific bed?')) return;
    try {
      const response = await HospitalAPI.deleteBed(bedId);
      if (response?.success) {
        setBedsList(prev => prev.filter(b => b._id !== bedId));
        fetchWards(); 
      } else { alert('Error: ' + response.message); }
    } catch (error) { alert('Error deleting bed.'); }
  };

  // 🌟 NEW: Open Bed Status Dialog
  const openStatusDialog = (bed) => {
    setStatusModal({ isOpen: true, bed: bed, newStatus: bed.status });
  };

  // 🌟 NEW: Handle Dialog Submission
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if(statusModal.newStatus === statusModal.bed.status) {
      setStatusModal({ isOpen: false, bed: null, newStatus: '' });
      return; // No change needed
    }

    setIsProcessing(true);
    try {
      const response = await HospitalAPI.updateBedStatus({ bedId: statusModal.bed._id, status: statusModal.newStatus });
      if (response?.success) {
        // Update local state to reflect UI instantly
        setBedsList(prev => prev.map(b => b._id === statusModal.bed._id ? { ...b, status: statusModal.newStatus } : b));
        setStatusModal({ isOpen: false, bed: null, newStatus: '' });
        fetchWards(); // Update total counts quietly
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Error changing bed status.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manage Wards & Beds</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Control ward details, manage bed capacity, and view live occupancy.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Ward
        </button>
      </div>

      {/* WARDS LISTING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4"><SpinnerIcon className="w-10 h-10 text-blue-500 animate-spin" /><p className="text-lg text-gray-500 font-bold">Loading Wards...</p></div>
      ) : wards.length === 0 ? (
        <div className="text-center bg-white p-20 rounded-3xl shadow-sm border-2 border-dashed border-gray-300">
           <div className="w-24 h-24 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner">🛏️</div>
           <p className="text-gray-700 text-2xl font-black">No Wards Found</p>
           <p className="text-gray-500 mt-2 font-medium">Click "Add New Ward" to create your first ward and auto-generate beds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {wards.map((ward) => (
            <div key={ward._id} className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col relative group">
              
              <div className="flex justify-between items-start mb-5">
                 <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-100">{ward.type}</span>
                 <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border shadow-sm ${ward.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                   {ward.isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>} {ward.isActive ? 'Active' : 'Inactive'}
                 </span>
              </div>

              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-800 truncate pr-4">{ward.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => openEditModal(ward)} className="bg-gray-50 hover:bg-blue-50 text-blue-600 p-2 rounded-full transition-colors"><EditIcon className="w-4 h-4" /></button>
                   <button onClick={() => handleDeleteWard(ward._id)} className="bg-gray-50 hover:bg-red-50 text-red-500 p-2 rounded-full transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
              
              {/* Bed Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                 <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Total Beds</span>
                    <span className="text-xl font-black text-gray-800">{ward.totalBeds || 0}</span>
                 </div>
                 <div className="bg-red-50/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-red-50">
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-wider mb-1">Occupied</span>
                    <span className="text-xl font-black text-red-600">{ward.occupiedBeds || 0}</span>
                 </div>
                 <div className="bg-green-50/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-green-50">
                    <span className="text-[10px] text-green-500 font-black uppercase tracking-wider mb-1">Available</span>
                    <span className="text-xl font-black text-green-600">{ward.availableBeds || 0}</span>
                 </div>
              </div>

              {/* Major Actions */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-100">
                 <button onClick={() => openBedsGrid(ward)} className="bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                    🛏️ View Beds
                 </button>
                 <button onClick={() => openCapacityModal(ward)} className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                    ⚙️ Capacity
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
         MODAL 1: ADD NEW WARD (WITH AUTO BEDS & DYNAMIC ENUMS)
      ========================================================= */}
      {showAddModal && (
        <ModalWrapper title="Create New Ward" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateWard} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Ward Name</label>
              <input type="text" placeholder="e.g. Neuro ICU" required value={addFormData.name} onChange={(e) => setAddFormData({...addFormData, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Ward Type</label>
              <select required value={addFormData.type} onChange={(e) => setAddFormData({...addFormData, type: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select Type</option>
                {wardTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Total Beds</label>
                <input type="number" placeholder="10" required value={addFormData.totalBeds} onChange={(e) => setAddFormData({...addFormData, totalBeds: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Price / Day (₹)</label>
                <input type="number" placeholder="2500" required value={addFormData.pricePerDay} onChange={(e) => setAddFormData({...addFormData, pricePerDay: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold bg-gray-50 p-2 rounded-lg">* Upon creation, beds will be automatically generated with naming sequence.</p>
            <SubmitButton isProcessing={isProcessing} text="Create Ward & Generate Beds" />
          </form>
        </ModalWrapper>
      )}

      {/* =========================================================
         MODAL 2: EDIT WARD INFO
      ========================================================= */}
      {showEditModal && (
        <ModalWrapper title="Edit Ward Info" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateWardInfo} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Ward Name</label>
              <input type="text" required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Ward Type</label>
              <select required value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select Type</option>
                {wardTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 border-2 border-gray-100 rounded-xl">
              <div><span className="text-xs text-gray-800 font-black uppercase">Status</span><span className="text-[10px] text-gray-500 font-medium block">Is this ward active?</span></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={editFormData.isActive} onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <SubmitButton isProcessing={isProcessing} text="Save Changes" />
          </form>
        </ModalWrapper>
      )}

      {/* =========================================================
         MODAL 3: BULK UPDATE CAPACITY
      ========================================================= */}
      {showCapacityModal && (
        <ModalWrapper title={`Manage Capacity - ${selectedWard?.name}`} onClose={() => setShowCapacityModal(false)}>
          <form onSubmit={handleUpdateCapacity} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div onClick={() => setCapacityData({...capacityData, action: 'add'})} className={`cursor-pointer p-4 rounded-2xl border-2 text-center transition-all ${capacityData.action === 'add' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-green-200'}`}>
                 <span className="block text-2xl mb-1">➕</span>
                 <span className="text-xs font-black uppercase">Add Beds</span>
               </div>
               <div onClick={() => setCapacityData({...capacityData, action: 'remove'})} className={`cursor-pointer p-4 rounded-2xl border-2 text-center transition-all ${capacityData.action === 'remove' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-red-200'}`}>
                 <span className="block text-2xl mb-1">➖</span>
                 <span className="text-xs font-black uppercase">Remove Beds</span>
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Number of Beds to {capacityData.action}</label>
              <input type="number" placeholder="e.g. 5" required value={capacityData.bedCount} onChange={(e) => setCapacityData({...capacityData, bedCount: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
              {capacityData.action === 'remove' && <p className="text-[10px] text-red-500 font-bold">* Only 'Available' beds will be removed.</p>}
            </div>

            {capacityData.action === 'add' && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Price / Day (₹) for New Beds</label>
                <input type="number" placeholder="2500" required value={capacityData.pricePerDay} onChange={(e) => setCapacityData({...capacityData, pricePerDay: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            )}
            <SubmitButton isProcessing={isProcessing} text="Update Capacity" />
          </form>
        </ModalWrapper>
      )}

      {/* =========================================================
         MODAL 4: BED GRID VIEW (ADDED md:pl-64 HERE)
      ========================================================= */}
      {showBedsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide flex flex-col">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10 shadow-sm">
               <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedWard?.name} - Bed Grid</h2>
                  <div className="flex items-center gap-3 mt-1">
                     <span className="text-green-600 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>
                     <span className="text-red-600 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Occupied</span>
                     <span className="text-yellow-600 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Maintenance</span>
                  </div>
               </div>
               <button onClick={() => setShowBedsModal(false)} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 hover:border-red-200 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            <div className="p-8 flex-grow">
               {loadingBeds ? (
                  <div className="flex justify-center items-center h-40"><SpinnerIcon className="w-8 h-8 text-blue-500 animate-spin" /></div>
               ) : bedsList.length === 0 ? (
                  <p className="text-center text-gray-500 font-bold">No beds found in this ward.</p>
               ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                     {bedsList.map(bed => {
                        const isAvail = bed.status === 'Available';
                        const isOccupied = bed.status === 'Occupied';
                        const isMaint = bed.status === 'Maintenance';
                        
                        let cardStyle = "bg-gray-50 border-gray-200 opacity-80";
                        let badgeStyle = "bg-gray-200 text-gray-800";
                        
                        if (isAvail) { cardStyle = "bg-green-50 border-green-200 hover:shadow-lg hover:shadow-green-100"; badgeStyle = "bg-green-200 text-green-800"; }
                        else if (isOccupied) { cardStyle = "bg-red-50 border-red-200 opacity-80"; badgeStyle = "bg-red-200 text-red-800"; }
                        else if (isMaint) { cardStyle = "bg-yellow-50 border-yellow-300 hover:shadow-lg hover:shadow-yellow-100 border-dashed"; badgeStyle = "bg-yellow-200 text-yellow-800"; }

                        return (
                           <div key={bed._id} className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all group ${cardStyle}`}>
                              
                              {/* Action Buttons on Hover */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-all">
                                 {/* Edit Bed Status Dialog Trigger */}
                                 <button onClick={() => openStatusDialog(bed)} title="Change Bed Status" className="bg-white border border-blue-100 text-blue-600 p-1.5 rounded-md hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                    <SettingsIcon className="w-3.5 h-3.5" />
                                 </button>

                                 {/* Only allow deleting if it's NOT occupied */}
                                 {!isOccupied && (
                                   <button onClick={() => handleDeleteSpecificBed(bed._id)} title="Delete Bed" className="bg-white border border-red-100 text-red-500 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                      <TrashIcon className="w-3.5 h-3.5" />
                                   </button>
                                 )}
                              </div>

                              <span className="text-3xl mb-2 drop-shadow-sm">{isOccupied ? '🛌' : isMaint ? '🛠️' : '🛏️'}</span>
                              <span className="text-sm font-black text-gray-900 tracking-wider uppercase">{bed.bedNumber}</span>
                              <span className={`mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${badgeStyle}`}>
                                {bed.status}
                              </span>
                              <span className="mt-2 text-[10px] text-gray-500 font-bold">₹{bed.pricePerDay || 0}/day</span>
                           </div>
                        )
                     })}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         MODAL 5: CHANGE BED STATUS DIALOG (ADDED md:pl-64 HERE)
      ========================================================= */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl relative transform transition-all">
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-5 flex justify-between items-center">
               <h2 className="text-xl font-black text-blue-900 flex items-center gap-2"><SettingsIcon className="w-5 h-5"/> Bed Status</h2>
               <button onClick={() => setStatusModal({ isOpen: false, bed: null, newStatus: '' })} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-full shadow-sm"><CloseIcon className="w-4 h-4"/></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleStatusSubmit} className="space-y-5">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center mb-2">
                   <span className="text-xs text-gray-500 font-black uppercase tracking-wider">Bed Number</span>
                   <span className="text-lg font-black text-gray-900">{statusModal.bed?.bedNumber}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-700 font-black tracking-wide uppercase">Select New Status</label>
                  <select 
                    value={statusModal.newStatus} 
                    onChange={(e) => setStatusModal({...statusModal, newStatus: e.target.value})} 
                    className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 bg-white font-semibold"
                  >
                    <option value="Available">🟢 Available (Ready for patient)</option>
                    <option value="Maintenance">🟡 Maintenance (Cleaning/Repair)</option>
                    <option value="Occupied">🔴 Occupied (Admitted patient)</option>
                  </select>
                </div>
                
                <SubmitButton isProcessing={isProcessing} text="Update Bed Status" />
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageWards;

// ---------------------------------------------------------
// REUSABLE COMPONENTS & ICONS
// ---------------------------------------------------------

// MODAL WRAPPER ME BHI ADDED md:pl-64
const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl relative transform transition-all">
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
         <h2 className="text-2xl font-black text-gray-800">{title}</h2>
         <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full"><CloseIcon className="w-5 h-5"/></button>
      </div>
      <div className="p-8">{children}</div>
    </div>
  </div>
);

const SubmitButton = ({ isProcessing, text }) => (
  <button type="submit" disabled={isProcessing} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-200 text-lg flex items-center justify-center gap-2">
    {isProcessing && <SpinnerIcon className="w-5 h-5 text-white animate-spin" />} {isProcessing ? 'Processing...' : text}
  </button>
);

const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SettingsIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);