"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageWards = () => {
  const [wards, setWards] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [wardTypes, setWardTypes] = useState([]); 
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------
  const [selectedWard, setSelectedWard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showBedsModal, setShowBedsModal] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null); // Patient dossier in bed map
  
  const [addFormData, setAddFormData] = useState({ name: '', type: '', totalBeds: '', pricePerDay: '' });
  const [editFormData, setEditFormData] = useState({ name: '', type: '', isActive: true });
  const [capacityData, setCapacityData] = useState({ action: 'add', bedCount: '', pricePerDay: '' });
  
  const [bedsData, setBedsData] = useState({ beds: [], summary: null });
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, bed: null, newStatus: '' });
  const [priceModal, setPriceModal] = useState({ isOpen: false, bed: null, newPrice: '' }); 
  const [isProcessing, setIsProcessing] = useState(false);

  // Load initial data
  useEffect(() => { 
    fetchEnums();
    fetchDashboardAndWards();
  }, []);

  // Fetch when opening specific ward bed grid
  useEffect(() => {
    if (showBedsModal && selectedWard?._id) {
      fetchBedsForWard(selectedWard._id);
    }
  }, [showBedsModal, selectedWard?._id]);

  const fetchDashboardAndWards = async () => {
    setLoading(true);
    try {
      const [statsRes, wardsRes] = await Promise.all([
        HospitalAPI.getDashboardStats(),
        HospitalAPI.getWardsList()
      ]);

      if (statsRes?.success) {
        setDashboardStats(statsRes.data);
      }
      if (wardsRes?.success) {
        setWards(wardsRes.data || []);
      }
    } catch (error) { 
      console.error("Error loading ward data:", error); 
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
    } catch (error) { 
      console.error("Error fetching enums:", error); 
    }
  };

  // API 3: GET /hospital/panel/ward/:wardId/beds
  const fetchBedsForWard = async (wardId) => {
    setLoadingBeds(true);
    try {
      const response = await HospitalAPI.getWardBeds(wardId);
      if (response?.success) {
        setBedsData({
          beds: response.data || [],
          summary: {
            totalBeds: response.totalBeds,
            availableBeds: response.availableBeds,
            occupiedBeds: response.occupiedBeds,
            reservedBeds: response.reservedBeds,
            maintenanceBeds: response.maintenanceBeds,
            ward: response.ward
          }
        });
      }
    } catch (error) { 
      console.error("Error loading ward beds:", error); 
    } finally { 
      setLoadingBeds(false); 
    }
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = { 
        ...addFormData, 
        totalBeds: Number(addFormData.totalBeds), 
        pricePerDay: Number(addFormData.pricePerDay) 
      };
      const response = await HospitalAPI.createWard(payload);
      if (response?.success) {
        setShowAddModal(false);
        setAddFormData({ name: '', type: '', totalBeds: '', pricePerDay: '' });
        fetchDashboardAndWards();
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleUpdateWardInfo = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.updateWard(selectedWard._id, editFormData);
      if (response?.success) {
        setShowEditModal(false);
        fetchDashboardAndWards();
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleDeleteWard = async (wardId) => {
    if (!confirm('Are you sure you want to delete this ward?')) return;
    try {
      const response = await HospitalAPI.deleteWard(wardId);
      if (response?.success) fetchDashboardAndWards();
    } catch (error) { 
      console.error(error); 
    }
  };

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = { 
        wardId: selectedWard._id, 
        ...capacityData, 
        bedCount: Number(capacityData.bedCount), 
        pricePerDay: Number(capacityData.pricePerDay) 
      };
      const response = await HospitalAPI.updateWardCapacity(payload);
      if (response?.success) {
        setShowCapacityModal(false);
        fetchDashboardAndWards(); 
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.updateBedStatus({ 
        bedId: statusModal.bed._id, 
        status: statusModal.newStatus 
      });
      if (response?.success) {
        setBedsData(prev => ({
          ...prev,
          beds: prev.beds.map(b => b._id === statusModal.bed._id ? { ...b, status: statusModal.newStatus } : b)
        }));
        setStatusModal({ isOpen: false, bed: null, newStatus: '' });
        fetchDashboardAndWards(); 
      }
    } finally { 
      setIsProcessing(false); 
    }
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
        setBedsData(prev => ({
          ...prev,
          beds: prev.beds.map(b => b._id === priceModal.bed._id ? { ...b, pricePerDay: Number(priceModal.newPrice) } : b)
        }));
        setPriceModal({ isOpen: false, bed: null, newPrice: '' });
        fetchDashboardAndWards();
      }
    } catch (error) { 
      console.error("Error updating bed price:", error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  // Safe variables extracted from API 1: /hospital/panel/dashboard-stats
  const bedCap = dashboardStats?.bedCapacity || {};
  const flow = dashboardStats?.inpatientFlow || {};

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto font-sans min-h-screen bg-slate-50/50 space-y-6">
      
      {/* ---------------- PENDING DISCHARGE ALERT BANNER ---------------- */}
      {flow.pendingDischarges > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl text-xs font-black">⚠️</span>
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                Discharge Approvals Pending
              </h4>
              <p className="text-[11px] font-semibold text-amber-800">
                You have <span className="font-bold underline">{flow.pendingDischarges}</span> discharge summaries pending approval.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black uppercase tracking-wider">
            Review Needed
          </span>
        </div>
      )}

      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#08B36A] rounded-2xl text-white shadow-lg shadow-[#08B36A]/20 text-xl">
            🏥
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Hospital Ward Management
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
              Live Facility Capacity &amp; Inpatient Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchDashboardAndWards}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl uppercase transition-all flex items-center gap-2 cursor-pointer"
          >
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto px-6 py-3 text-xs bg-[#08B36A] hover:bg-[#069959] text-white font-black rounded-xl shadow-lg shadow-[#08B36A]/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <span>+</span> 
            <span>Initialize Ward</span>
          </button>
        </div>
      </div>

      {/* ---------------- 1. DASHBOARD STATS WIDGETS (API 1) ---------------- */}
      {dashboardStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1: Total & Occupancy Rate Progress */}
          <div className="col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Bed Capacity</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{bedCap.totalBeds ?? dashboardStats.totalBeds ?? 0} Beds</h3>
              </div>
              <span className="px-2.5 py-1 bg-[#08B36A]/10 text-[#08B36A] rounded-lg text-[10px] font-black uppercase">
                {bedCap.occupancyRate ?? dashboardStats.occupancyRate ?? "0%"} Occupied
              </span>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="space-y-1.5 mt-3">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#08B36A] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, bedCap.occupancyRateNumeric ?? 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{bedCap.occupiedBeds ?? dashboardStats.occupiedBeds ?? 0} In-Use</span>
                <span>{bedCap.availableBeds ?? dashboardStats.availableBeds ?? 0} Available</span>
              </div>
            </div>
          </div>

          {/* Card 2: Available Beds */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vacant Beds</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-[#08B36A]">{bedCap.availableBeds ?? dashboardStats.availableBeds ?? 0}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Ready for admission</p>
            </div>
          </div>

          {/* Card 3: Ventilator Status */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ventilator Beds</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">{bedCap.ventilatorBedsAvailable ?? 0}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">out of {bedCap.ventilatorBedsTotal ?? 0} available</p>
            </div>
          </div>

          {/* Card 4: Inpatient Flow Activity */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Flow</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">+{flow.todayAdmissions ?? 0}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {flow.todayDischarges ?? 0} Discharged &bull; {flow.activeEmergencyCases ?? 0} Emergency
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 2. WARDS GRID (API 2: /hospital/panel/wards/list) ---------------- */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-black tracking-widest uppercase">Syncing Wards &amp; Beds...</p>
          </div>
        ) : wards.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-xs border border-dashed border-slate-300 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-3 mx-auto">🛏️</div>
            <p className="text-slate-800 text-lg font-black tracking-tight">No Wards Configured</p>
            <p className="text-slate-400 mt-1 text-xs font-medium">Click "Initialize Ward" above to register hospital wards.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wards.map((ward) => (
              <div 
                key={ward._id} 
                className="bg-white border border-slate-200 hover:border-[#08B36A]/50 rounded-3xl shadow-xs hover:shadow-xl transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      {ward.type || "Ward"}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { 
                          setSelectedWard(ward); 
                          setEditFormData({ name: ward.name, type: ward.type, isActive: ward.isActive !== false }); 
                          setShowEditModal(true); 
                        }} 
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteWard(ward._id)} 
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 tracking-tight truncate group-hover:text-[#08B36A] transition-colors">
                    {ward.name}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-black text-[#08B36A]">
                      {ward.priceRange || `₹${ward.pricePerDay || 0}`} <span className="text-[9px] text-slate-400 font-medium">/ day</span>
                    </p>
                    {ward.ventilatorBedsCount > 0 && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {ward.ventilatorBedsCount} Ventilators
                      </span>
                    )}
                  </div>

                  {/* 2x2 Metric Grid directly from API response */}
                  <div className="grid grid-cols-2 gap-2 my-4 text-center">
                    <div className="bg-emerald-50/60 rounded-xl p-2 border border-[#08B36A]/10">
                      <p className="text-[8px] font-black text-[#08B36A] uppercase tracking-wider">Available</p>
                      <p className="text-base font-black text-[#08B36A]">{ward.availableBeds || 0}</p>
                    </div>
                    <div className="bg-rose-50/60 rounded-xl p-2 border border-rose-100">
                      <p className="text-[8px] font-black text-rose-500 uppercase tracking-wider">Occupied</p>
                      <p className="text-base font-black text-rose-700">{ward.occupiedBeds || 0}</p>
                    </div>
                    <div className="bg-amber-50/60 rounded-xl p-2 border border-amber-100">
                      <p className="text-[8px] font-black text-amber-600 uppercase tracking-wider">Reserved</p>
                      <p className="text-base font-black text-amber-700">{ward.reservedBeds || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Total Beds</p>
                      <p className="text-base font-black text-slate-700">{ward.totalBeds || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => { setSelectedWard(ward); setShowBedsModal(true); }} 
                    className="flex-grow bg-slate-900 hover:bg-[#08B36A] text-white font-black py-2.5 rounded-xl transition-all flex justify-center items-center gap-1.5 text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    <span>🛏️</span>
                    <span>Bed Chart ({ward.occupancyRate || '0%'})</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setSelectedWard(ward); 
                      setCapacityData({ action: 'add', bedCount: '', pricePerDay: ward.pricePerDay || '' }); 
                      setShowCapacityModal(true); 
                    }} 
                    title="Adjust Capacity / Pricing"
                    className="w-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- 3. BED GRID SCREEN MODAL (API 3: /hospital/panel/ward/:wardId/beds) ---------------- */}
      {showBedsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white gap-4 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="text-[#08B36A]">{selectedWard?.name}</span> Bed Grid
                </h2>
                
                {/* Badges Legend as per API guide */}
                <div className="flex items-center gap-3.5 mt-2 flex-wrap">
                  <Legend label="Available (Green)" color="bg-[#08B36A]" />
                  <Legend label="Occupied (Red)" color="bg-rose-500" />
                  <Legend label="Reserved (Orange)" color="bg-amber-500" />
                  <Legend label="Maintenance (Gray)" color="bg-slate-400" />
                </div>
              </div>

              {/* Summary stats from /ward/:wardId/beds */}
              {bedsData.summary && (
                <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[#08B36A]">{bedsData.summary.availableBeds} Free</span>
                  <span>&bull;</span>
                  <span className="text-rose-600">{bedsData.summary.occupiedBeds} Occupied</span>
                  <span>&bull;</span>
                  <span className="text-slate-600">{bedsData.summary.totalBeds} Total</span>
                </div>
              )}

              <button 
                onClick={() => { setShowBedsModal(false); setSelectedPatientModal(null); }} 
                className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer shrink-0"
              >
                <CloseIcon className="w-4 h-4"/>
              </button>
            </div>

            {/* Bed Map Matrix */}
            <div className="p-6 flex-grow overflow-y-auto bg-slate-50/50">
              {loadingBeds ? (
                <div className="flex flex-col justify-center items-center h-64 gap-3">
                  <div className="w-8 h-8 border-3 border-slate-300 border-t-[#08B36A] rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Loading Bed Grid...</p>
                </div>
              ) : bedsData.beds.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">No Beds Configured in this Ward</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3.5">
                  {bedsData.beds.map((bed) => {
                    const isAvail = bed.status === 'Available';
                    const isOccupied = bed.status === 'Occupied';
                    const isReserved = bed.status === 'Reserved';
                    const isHold = bed.activePatient?.isHold;

                    // Color mapped directly to documentation guide
                    let cardColor = isAvail 
                      ? "bg-white border-slate-200 hover:border-[#08B36A]" 
                      : isOccupied 
                      ? "bg-rose-50/70 border-rose-200" 
                      : isReserved
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-slate-100/70 border-slate-200";

                    return (
                      <div 
                        key={bed._id} 
                        onClick={() => {
                          if (bed.activePatient) {
                            setSelectedPatientModal({ ...bed.activePatient, bedNumber: bed.bedNumber });
                          } else {
                            setStatusModal({ isOpen: true, bed, newStatus: bed.status });
                          }
                        }}
                        className={`relative p-3.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer group hover:shadow-md ${cardColor}`}
                      >
                        {/* Ventilator Indicator */}
                        {bed.isVentilatorAvailable && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-black bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                            VENT
                          </span>
                        )}

                        {/* Top quick setting for price */}
                        <button
                          type="button"
                          title="Modify Price"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPriceModal({ isOpen: true, bed, newPrice: bed.pricePerDay || '' });
                          }}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-1"
                        >
                          ⚙️
                        </button>

                        <span className="text-2xl mt-2 mb-1">{isOccupied ? '🛌' : isReserved ? '⏳' : isAvail ? '🛏️' : '🛠️'}</span>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{bed.bedNumber}</span>

                        {/* Status Label */}
                        <div className="w-full mt-1">
                          {isOccupied && bed.activePatient ? (
                            <p className="text-[10px] font-bold text-rose-700 truncate px-1 bg-white/70 rounded">
                              {bed.activePatient.patientName}
                            </p>
                          ) : isReserved ? (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isHold ? 'bg-amber-200 text-amber-900 animate-pulse' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isHold ? 'Deposit Hold' : 'Reserved'}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isAvail ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {bed.status}
                            </span>
                          )}
                        </div>

                        <span className="mt-2 text-[9px] text-slate-400 font-bold">₹{bed.pricePerDay || 0}/day</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ACTIVE PATIENT DOSSIER POPUP ---------------- */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Inpatient Details</span>
                <h3 className="text-base font-black text-slate-900">{selectedPatientModal.patientName}</h3>
                <p className="text-xs text-[#08B36A] font-bold">Unit: {selectedPatientModal.bedNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedPatientModal(null)} 
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <CloseIcon className="w-4 h-4"/>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Admission Booking ID:</span>
                <span className="font-mono font-bold text-slate-800">#{selectedPatientModal.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attending Doctor:</span>
                <span className="font-bold text-slate-800">{selectedPatientModal.doctorName || 'General Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admitted Date:</span>
                <span className="font-bold text-slate-800">
                  {selectedPatientModal.admittedDate ? new Date(selectedPatientModal.admittedDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration of Stay:</span>
                <span className="font-bold text-slate-800">{selectedPatientModal.daysStayed || 1} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Triage Severity:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedPatientModal.triageLevel === 'Emergency' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedPatientModal.triageLevel || 'Routine'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 1: ADD NEW WARD ---------------- */}
      {showAddModal && (
        <ModalWrapper title="Initialize New Ward" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateWard} className="space-y-4">
            <Input label="Ward Name" value={addFormData.name} onChange={(v) => setAddFormData({...addFormData, name: v})} placeholder="e.g. Intensive Care Unit (ICU)" />
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider ml-1">Type Category</label>
              <select 
                required 
                value={addFormData.type} 
                onChange={(e) => setAddFormData({...addFormData, type: e.target.value})} 
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#08B36A] focus:bg-white transition-all"
              >
                <option value="">Select Ward Type</option>
                {wardTypes.map((type, index) => <option key={index} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Initial Beds Count" type="number" value={addFormData.totalBeds} onChange={(v) => setAddFormData({...addFormData, totalBeds: v})} placeholder="e.g. 10" />
              <Input label="Base Price / Day (₹)" type="number" value={addFormData.pricePerDay} onChange={(v) => setAddFormData({...addFormData, pricePerDay: v})} placeholder="e.g. 2500" />
            </div>

            <SubmitButton isProcessing={isProcessing} text="Register Ward" />
          </form>
        </ModalWrapper>
      )}

      {/* ---------------- MODAL 2: EDIT WARD ---------------- */}
      {showEditModal && (
        <ModalWrapper title="Update Ward Config" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateWardInfo} className="space-y-4">
            <Input label="Ward Name" value={editFormData.name} onChange={(v) => setEditFormData({...editFormData, name: v})} />
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-black text-slate-800 uppercase">Operational Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={editFormData.isActive} 
                  onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})} 
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#08B36A] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <SubmitButton isProcessing={isProcessing} text="Save Changes" />
          </form>
        </ModalWrapper>
      )}

      {/* ---------------- MODAL 3: CAPACITY CONTROL ---------------- */}
      {showCapacityModal && (
        <ModalWrapper title="Adjust Ward Capacity" onClose={() => setShowCapacityModal(false)}>
          <form onSubmit={handleUpdateCapacity} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setCapacityData({...capacityData, action: 'add'})} 
                className={`p-3.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  capacityData.action === 'add' ? 'border-[#08B36A] bg-emerald-50 text-[#08B36A]' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-lg">➕</span>
                <span className="text-[10px] font-black uppercase">Add Beds</span>
              </button>
              <button 
                type="button" 
                onClick={() => setCapacityData({...capacityData, action: 'remove'})} 
                className={`p-3.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  capacityData.action === 'remove' ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-lg">➖</span>
                <span className="text-[10px] font-black uppercase">Reduce Beds</span>
              </button>
            </div>
            <Input label="Bed Quantity" type="number" value={capacityData.bedCount} onChange={(v) => setCapacityData({...capacityData, bedCount: v})} placeholder="Number of beds" />
            <SubmitButton isProcessing={isProcessing} text="Apply Capacity Change" />
          </form>
        </ModalWrapper>
      )}

      {/* ---------------- MODAL 4: CHANGE BED STATUS ---------------- */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Change Bed State</h3>
                <p className="text-[10px] font-bold text-slate-400">Unit: {statusModal.bed?.bedNumber}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setStatusModal({ isOpen: false, bed: null, newStatus: '' })} 
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <CloseIcon className="w-4 h-4"/>
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                {[
                  { val: 'Available', label: 'Available', dot: 'bg-[#08B36A]' },
                  { val: 'Occupied', label: 'Occupied', dot: 'bg-rose-500' },
                  { val: 'Reserved', label: 'Reserved', dot: 'bg-amber-500' },
                  { val: 'Maintenance', label: 'Maintenance', dot: 'bg-slate-400' }
                ].map((st) => (
                  <div 
                    key={st.val}
                    onClick={() => setStatusModal({...statusModal, newStatus: st.val})}
                    className={`cursor-pointer p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                      statusModal.newStatus === st.val ? 'border-[#08B36A] bg-emerald-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                      <span className="text-xs font-black uppercase text-slate-800">{st.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <SubmitButton isProcessing={isProcessing} text="Update State" />
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 5: MODIFY BED PRICE ---------------- */}
      {priceModal.isOpen && (
        <ModalWrapper title="Modify Bed Rate" onClose={() => setPriceModal({ isOpen: false, bed: null, newPrice: '' })}>
          <form onSubmit={handlePriceSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Unit</span>
              <p className="text-base font-black text-slate-800">{priceModal.bed?.bedNumber}</p>
            </div>
            <Input label="Day Price (₹)" type="number" value={priceModal.newPrice} onChange={(v) => setPriceModal({...priceModal, newPrice: v})} placeholder="e.g. 2500" />
            <SubmitButton isProcessing={isProcessing} text="Update Rate" />
          </form>
        </ModalWrapper>
      )}

    </div>
  );
};

export default ManageWards;

// ---------------- UI Helpers ----------------
const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border border-slate-200">
      <div className="border-b border-slate-100 px-6 py-5 flex justify-between items-center">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer">
          <CloseIcon className="w-4 h-4"/>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Legend = ({ label, color }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{label}</span>
  </div>
);

const Input = ({ label, value, onChange, type="text", placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold focus:border-[#08B36A] focus:bg-white transition-all outline-none text-slate-900"
    />
  </div>
);

const SubmitButton = ({ isProcessing, text }) => (
  <button 
    type="submit" 
    disabled={isProcessing} 
    className="w-full mt-2 bg-[#08B36A] hover:bg-[#069959] text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-[#08B36A]/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
  >
    {isProcessing ? 'Processing...' : text}
  </button>
);

const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);