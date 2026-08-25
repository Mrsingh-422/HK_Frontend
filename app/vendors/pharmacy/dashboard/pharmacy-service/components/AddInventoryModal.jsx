'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  FaTimes, 
  FaSpinner, 
  FaSearch, 
  FaCapsules, 
  FaChevronLeft, 
  FaChevronRight, 
  FaInfoCircle,
  FaUpload,
  FaTrash,
  FaBarcode,
  FaFileInvoice
} from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

function MedicineImage({ src }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="h-full w-full bg-slate-50 flex items-center justify-center">
        <FaCapsules className="text-slate-300 text-lg" />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      onError={() => setError(true)} 
      className="w-full h-full object-cover animate-fade-in" 
      alt="med" 
    />
  );
}

export default function AddInventoryModal({ isOpen, onClose, onSave, loading, initialData, masterList = [] }) {
  const [activeTab, setActiveTab] = useState('master'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [masterResults, setMasterResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [loadingMasterDetails, setLoadingMasterDetails] = useState(false);
  
  // Tax HSN database configurations list
  const [hsnCodesList, setHsnCodesList] = useState([]);
  const [loadingHsn, setLoadingHsn] = useState(false);
  const [hsnError, setHsnError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [showMrpRequestForm, setShowMrpRequestForm] = useState(false);
  const [mrpSubmitting, setMrpSubmitting] = useState(false);

  // Custom HSN request workflow
  const [showHsnRequestForm, setShowHsnRequestForm] = useState(false);
  const [hsnRequestSubmitting, setHsnRequestSubmitting] = useState(false);
  const [myHsnRequests, setMyHsnRequests] = useState([]);
  const [loadingMyHsnRequests, setLoadingMyHsnRequests] = useState(false);
  const [showMyHsnRequests, setShowMyHsnRequests] = useState(false);

  const [formData, setFormData] = useState({
    batch_number: '', 
    mrp: '',
    vendor_price: '', 
    stock_quantity: '', 
    expiry_date: '',
    manufacturing_date: '',
    hsn_number: '',
    newName: '', 
    newManufacturer: '', 
    newSalt: '', 
    newPackaging: '', 
    newMRP: '',
    newBestPrice: '',
    newDescription: '',
    newPrescriptionRequired: 'No',
    proposedMrp: '',
    mrpRequestReason: '',
    newHsnCode: '',
    newHsnDescription: '',
    newHsnTaxPercent: '',
    newHsnReason: ''
  });

  const resolveImageUrl = (imageUrlArray) => {
    const primaryImage = imageUrlArray?.[0];
    if (!primaryImage) return null;
    if (primaryImage.startsWith('http://') || primaryImage.startsWith('https://')) {
      return primaryImage;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanImage = primaryImage.startsWith('/') ? primaryImage.slice(1) : primaryImage;
    return `${cleanBase}/${cleanImage}`;
  };

  const preventNegativeInput = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const handleNonNegativeChange = (field, value) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    const num = Number(value);
    setFormData(prev => ({
      ...prev,
      [field]: num < 0 ? '0' : value
    }));
  };

  const fetchMasterMedicines = async (query = '', page = 1) => {
    setSearching(true);
    try {
      const res = await PharmacyVendorAPI.searchMasterMedicines(query.trim(), page);
      if (res && res.data) {
        const responseData = res.data;
        if (Array.isArray(responseData)) {
          setMasterResults(responseData);
          setTotalPages(res.totalPages || 1);
        } else if (responseData.docs && Array.isArray(responseData.docs)) {
          setMasterResults(responseData.docs);
          setTotalPages(responseData.totalPages || res.totalPages || 1);
        } else if (responseData.medicines && Array.isArray(responseData.medicines)) {
          setMasterResults(responseData.medicines);
          setTotalPages(responseData.totalPages || res.totalPages || 1);
        } else {
          setMasterResults([]);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch global master medicines:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Load HSN code list and initialize modal
  useEffect(() => {
    if (isOpen) {
        const loadHsn = async () => {
          setLoadingHsn(true);
          setHsnError('');
          try {
            const res = await PharmacyVendorAPI.listHsnCodes();

            // Handle every reasonable response envelope shape:
            // { success, count, data: [...] } | { data: { data: [...] } } | [...]
            let items = [];
            if (Array.isArray(res?.data)) {
              items = res.data;
            } else if (Array.isArray(res?.data?.data)) {
              items = res.data.data;
            } else if (Array.isArray(res)) {
              items = res;
            }

            // Only exclude items EXPLICITLY marked inactive.
            // Some records may omit isActive entirely (treat as active),
            // and some backends may send it as a string/number.
            const activeItems = items.filter(item => {
              const val = item.isActive;
              return !(val === false || val === 'false' || val === 0 || val === '0');
            });

            // Sort by HSN code for a predictable, scannable dropdown
            activeItems.sort((a, b) => {
              const codeA = (a.hsnCode || a.hsn_code || a.code || '').toString();
              const codeB = (b.hsnCode || b.hsn_code || b.code || '').toString();
              return codeA.localeCompare(codeB);
            });

            setHsnCodesList(activeItems);

            if (activeItems.length === 0) {
              console.warn('HSN list loaded but empty — check API response shape:', res);
            }
          } catch (err) {
            console.error("Error loading HSN configurations:", err);
            setHsnCodesList([]);
            const status = err?.response?.status;
            if (status === 401) {
              setHsnError('HSN list request was rejected (401). This usually means NEXT_PUBLIC_BACKEND_URL is missing/misconfigured, not an auth issue with this endpoint.');
            } else if (err.message?.includes('not configured')) {
              setHsnError('Backend URL is not configured. Check NEXT_PUBLIC_BACKEND_URL in your env file.');
            } else {
              setHsnError('Could not load HSN codes. Check your connection and try again.');
            }
          } finally {
            setLoadingHsn(false);
          }
        };
        loadHsn();
        fetchMyHsnRequests();

        if (initialData) {
            setSelectedMaster(initialData.medicineId);
            setFormData(prev => ({ 
              ...prev, 
              batch_number: initialData.batch_number || '', 
              mrp: initialData.mrp ?? initialData.medicineId?.mrp ?? '',
              vendor_price: initialData.vendor_price ?? '', 
              stock_quantity: initialData.stock_quantity ?? '', 
              expiry_date: initialData.expiry_date?.split('T')[0] || '',
              manufacturing_date: initialData.manufacturing_date?.split('T')[0] || '',
              hsn_number: initialData.hsn_number || initialData.hsnCode || ''
            }));
            setActiveTab('config');
            setShowMrpRequestForm(false);
            const medId = initialData.medicineId?._id || initialData.medicineId;
            if (medId && typeof medId === 'string') {
              fetchDeepDetails(medId);
            }
        } else {
            setActiveTab('master');
            setSearchTerm('');
            setDebouncedSearchTerm('');
            setCurrentPage(1);
            setSelectedFile(null);
            setImagePreview('');
            setShowMrpRequestForm(false);
            setSuggestSubmitting(false);
            setFormData({
              batch_number: '',
              mrp: '',
              vendor_price: '',
              stock_quantity: '',
              expiry_date: '',
              manufacturing_date: '',
              hsn_number: '',
              newName: '',
              newManufacturer: '',
              newSalt: '',
              newPackaging: '',
              newMRP: '',
              newBestPrice: '',
              newDescription: '',
              newPrescriptionRequired: 'No',
              proposedMrp: '',
              mrpRequestReason: '',
              newHsnCode: '',
              newHsnDescription: '',
              newHsnTaxPercent: '',
              newHsnReason: ''
            });
            fetchMasterMedicines('', 1);
        }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'master' && !initialData) {
      fetchMasterMedicines(debouncedSearchTerm, currentPage);
    }
  }, [currentPage, debouncedSearchTerm, isOpen, activeTab, initialData]);

  const fetchMyHsnRequests = async () => {
    setLoadingMyHsnRequests(true);
    try {
      const res = await PharmacyVendorAPI.getMyHsnRequests();
      const items = Array.isArray(res?.data) ? res.data : [];
      // Most recent first
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setMyHsnRequests(items);
    } catch (err) {
      console.error("Failed to fetch HSN requests:", err);
      setMyHsnRequests([]);
    } finally {
      setLoadingMyHsnRequests(false);
    }
  };

  const handleHsnRequestSubmit = async (e) => {
    if (e) e.preventDefault();
    const taxPercent = Number(formData.newHsnTaxPercent);
    const code = formData.newHsnCode.trim();

    if (!/^\d{6}(\d{2})?$/.test(code)) {
      alert("HSN code must be either 6 or 8 digits.");
      return;
    }
    if (!formData.newHsnDescription.trim()) {
      alert("Please provide a description for this HSN code.");
      return;
    }
    if (formData.newHsnTaxPercent === '' || taxPercent < 0) {
      alert("Please provide a valid suggested GST percentage.");
      return;
    }

    setHsnRequestSubmitting(true);
    try {
      const res = await PharmacyVendorAPI.submitHsnRequest({
        hsnCode: code,
        description: formData.newHsnDescription.trim(),
        suggestedTaxPercent: taxPercent,
        reason: formData.newHsnReason.trim(),
      });
      alert(res?.message || "Request submitted to Admin successfully! You can track its status below.");
      setFormData(prev => ({
        ...prev,
        newHsnCode: '',
        newHsnDescription: '',
        newHsnTaxPercent: '',
        newHsnReason: ''
      }));
      setShowHsnRequestForm(false);
      setShowMyHsnRequests(true);
      fetchMyHsnRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to submit HSN request");
    } finally {
      setHsnRequestSubmitting(false);
    }
  };

  const fetchDeepDetails = async (id) => {
    setLoadingMasterDetails(true);
    try {
      const res = await PharmacyVendorAPI.getMasterDetails(id);
      if (res && res.success && res.data) {
        setSelectedMaster(prev => ({
          ...(typeof prev === 'object' ? prev : {}),
          ...res.data
        }));
      }
    } catch (err) {
      console.error("Failed to load details for medicine ID:", id, err);
    } finally {
      setLoadingMasterDetails(false);
    }
  };

  const handleSelectMaster = (m) => {
    setSelectedMaster(m);
    setFormData(p => ({
      ...p, 
      mrp: m.mrp || '',
      vendor_price: m.best_price || m.mrp || ''
    })); 
    setActiveTab('config');
    fetchDeepDetails(m._id);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.newMRP) < 0 || Number(formData.newBestPrice) < 0) {
      alert("MRP and Best Price cannot be negative.");
      return;
    }
    setSuggestSubmitting(true);
    try {
        let finalImageUrl = [];
        if (selectedFile) {
          const simulatedUrl = `https://api-url/uploads/medicines/${selectedFile.name.replace(/\s+/g, '_')}`;
          finalImageUrl = [simulatedUrl];
        }
        const payload = {
            name: formData.newName.trim(),
            manufacturers: formData.newManufacturer.trim(),
            salt_composition: formData.newSalt.trim(),
            packaging: formData.newPackaging.trim(),
            mrp: Number(formData.newMRP),
            best_price: formData.newBestPrice !== '' ? Number(formData.newBestPrice) : Number(formData.newMRP), 
            description: formData.newDescription.trim(),
            prescription_required: formData.newPrescriptionRequired,
            image_url: finalImageUrl
        };
        await PharmacyVendorAPI.submitNewMasterRequest(payload);
        alert("Request to add new medicine submitted successfully!");
        onClose();
    } catch (err) { 
        alert(err.response?.data?.message || err.message || "Failed to submit request"); 
    } finally {
        setSuggestSubmitting(false);
    }
  };

  const handleMrpIncreaseSubmit = async (e) => {
    if (e) e.preventDefault();
    const proposed = Number(formData.proposedMrp);
    const ceilingLimit = Number(selectedMaster?.masterMrp || selectedMaster?.mrp || 0);

    if (!proposed || (ceilingLimit > 0 && proposed <= ceilingLimit)) {
      alert("Proposed MRP must be greater than the current catalog limit.");
      return;
    }
    if (!formData.mrpRequestReason.trim()) {
      alert("Please provide a reason for the MRP increase request.");
      return;
    }

    setMrpSubmitting(true);
    try {
      const medId = selectedMaster?._id || selectedMaster || initialData?.medicineId;
      const payload = {
        medicineId: medId,
        proposedMrp: proposed,
        reason: formData.mrpRequestReason.trim()
      };
      await PharmacyVendorAPI.requestMrpIncrease(payload);
      alert("MRP increase request submitted to Admin successfully!");
      setShowMrpRequestForm(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to submit MRP increase request");
    } finally {
      setMrpSubmitting(false);
    }
  };

  const hsnStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${styles[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  const ceiling = Number(selectedMaster?.masterMrp || selectedMaster?.mrp || 0);
  const batchMrpExceedsMaster = !initialData && ceiling > 0 && Number(formData.mrp) > ceiling;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="bg-slate-50/60 border-b border-slate-100">
            <div className="p-6 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Medicine Configurator</h2>
                  <p className="text-xs text-slate-400 font-medium">Register batch stock or refill existing inventory</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <FaTimes size={18}/>
                </button>
            </div>
            <div className="flex px-6 border-t border-slate-100">
                {!initialData && (
                  <>
                    <button 
                      onClick={() => { setActiveTab('master'); setCurrentPage(1); }} 
                      className={`px-4 py-3.5 text-xs font-bold transition-all border-b-4 ${
                        activeTab === 'master' 
                          ? 'border-[#08B36A] text-[#08B36A]' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Pickup Master
                    </button>
                    <button 
                      onClick={() => setActiveTab('suggest')} 
                      className={`px-4 py-3.5 text-xs font-bold transition-all border-b-4 ${
                        activeTab === 'suggest' 
                          ? 'border-[#08B36A] text-[#08B36A]' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Suggest New
                    </button>
                  </>
                )}
                {activeTab === 'config' && (
                    <div className="px-4 py-3.5 text-xs font-bold border-b-4 border-[#08B36A] text-[#08B36A]">
                      Configure Batch
                    </div>
                )}
                <button 
                  onClick={() => setActiveTab('hsnRequests')} 
                  className={`px-4 py-3.5 text-xs font-bold transition-all border-b-4 flex items-center gap-1.5 ${
                    activeTab === 'hsnRequests' 
                      ? 'border-[#08B36A] text-[#08B36A]' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  HSN Requests
                  {myHsnRequests.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black">
                      {myHsnRequests.length}
                    </span>
                  )}
                </button>
            </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col min-h-0 bg-white">
          
          {/* TAB 1: Master Search */}
          {activeTab === 'master' && (
            <div className="space-y-5 flex flex-col flex-grow min-h-0">
              <div className="relative group flex-shrink-0">
                <input 
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-xs placeholder-slate-400 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] focus:bg-white transition-all duration-150" 
                  placeholder="Type to search global reference database (e.g. Paracetamol)..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <button 
                  type="button"
                  className="absolute right-2 top-2 bottom-2 px-4 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center"
                >
                  {searching ? <FaSpinner className="animate-spin text-sm" /> : <FaSearch className="text-xs" />}
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1 flex-grow max-h-[480px] min-h-[260px]">
                {masterResults.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400 animate-fade-in">
                    <FaInfoCircle size={24} className="text-slate-300 mb-2" />
                    <span className="font-semibold text-xs">No records found matching your query</span>
                  </div>
                ) : (
                  masterResults.map((m) => (
                    <div 
                      key={m._id} 
                      className="flex justify-between items-center p-4 border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-[#08B36A]/40 cursor-pointer group transition-all duration-150 shadow-sm animate-fade-in" 
                      onClick={() => handleSelectMaster(m)}
                    >
                       <div className="flex gap-3.5 items-center">
                          <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border">
                            <MedicineImage src={resolveImageUrl(m.image_url)} />
                          </div>
                          <div>
                              <p className="font-extrabold text-slate-900 text-sm leading-tight">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{m.manufacturers || "Unknown Manufacturer"}</p>
                          </div>
                       </div>
                       <button className="px-3.5 py-1.5 bg-white border border-slate-200 text-[#08B36A] text-[10px] font-black uppercase rounded-lg group-hover:bg-[#08B36A] group-hover:text-white group-hover:border-[#08B36A] transition-all shadow-sm">
                         Select
                       </button>
                    </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 flex-shrink-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1 || searching}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 rounded-xl transition duration-150"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages || searching}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 rounded-xl transition duration-150"
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Suggest Medicine */}
          {activeTab === 'suggest' && (
            <form onSubmit={handleSuggestSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Medicine Name</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newName} onChange={e => setFormData({...formData, newName: e.target.value})} placeholder="e.g. Paracetamol 500mg" />
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Manufacturer</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newManufacturer} onChange={e => setFormData({...formData, newManufacturer: e.target.value})} placeholder="e.g. Cipla Ltd" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Salt Composition</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newSalt} onChange={e => setFormData({...formData, newSalt: e.target.value})} placeholder="e.g. Paracetamol (500mg)" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Packaging</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newPackaging} onChange={e => setFormData({...formData, newPackaging: e.target.value})} placeholder="e.g. Strip of 15 tablets" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Prescription Required</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newPrescriptionRequired} onChange={e => setFormData({...formData, newPrescriptionRequired: e.target.value})}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Global MRP</label>
                    <input required type="number" min="0" step="0.01" onKeyDown={preventNegativeInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newMRP} onChange={e => handleNonNegativeChange('newMRP', e.target.value)} placeholder="40.00" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Best Price</label>
                    <input required type="number" min="0" step="0.01" onKeyDown={preventNegativeInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition" value={formData.newBestPrice} onChange={e => handleNonNegativeChange('newBestPrice', e.target.value)} placeholder="32.00" />
                </div>

                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea rows="2" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none transition resize-none" value={formData.newDescription} onChange={e => setFormData({...formData, newDescription: e.target.value})} placeholder="Used for pain relief and fever treatment." />
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Medicine Image</label>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    
                    {!imagePreview ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#08B36A] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-50/80 transition-all group"
                      >
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 group-hover:text-[#08B36A] transition-all">
                          <FaUpload size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">Choose file from system</span>
                      </div>
                    ) : (
                      <div className="relative border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl border border-slate-100 overflow-hidden bg-white flex items-center justify-center">
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 max-w-[200px] truncate">{selectedFile?.name}</p>
                          </div>
                        </div>
                        <button type="button" onClick={handleRemoveImage} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl">
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                </div>

                <button type="submit" className="col-span-2 mt-4 py-4 bg-[#08B36A] hover:bg-[#079d5c] text-white font-extrabold rounded-xl uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2">
                  {suggestSubmitting ? <FaSpinner className="animate-spin text-sm" /> : 'Submit for Approval'}
                </button>
            </form>
          )}

          {/* TAB 3: Configure Medicine Batch */}
          {activeTab === 'config' && (
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                const batchMrp = Number(formData.mrp);
                const price = Number(formData.vendor_price);
                const stock = Number(formData.stock_quantity);

                if (price < 0 || stock < 0 || batchMrp < 0) {
                  alert("Price, MRP, and Stock quantity cannot be negative.");
                  return;
                }

                if (!initialData && ceiling > 0 && batchMrp > ceiling) {
                  alert(`Anti-fraud shield: Entered batch MRP (₹${batchMrp}) exceeds the master approved catalog limit (₹${ceiling}). Please request an MRP increase.`);
                  return;
                }

                if (price > batchMrp) {
                  alert(`Invalid Configuration: Selling price (₹${price}) cannot exceed the batch MRP (₹${batchMrp}).`);
                  return;
                }

                const resolvedMedId = selectedMaster?._id || selectedMaster || initialData?.medicineId;

                onSave({ 
                  medicineId: resolvedMedId, 
                  batch_number: formData.batch_number.trim(), 
                  mrp: batchMrp,
                  vendor_price: price, 
                  stock_quantity: stock, 
                  expiry_date: formData.expiry_date,
                  manufacturing_date: formData.manufacturing_date,
                  hsn_number: formData.hsn_number
                }); 
              }} 
              className="grid grid-cols-2 gap-5"
            >
                {/* Reference Medicine Selected Card */}
                <div className="col-span-2 p-5 bg-[#08B36A] rounded-2xl text-white flex flex-col gap-2 shadow-lg shadow-[#08B36A]/10 animate-fade-in relative">
                    {loadingMasterDetails && (
                      <div className="absolute inset-0 bg-[#08B36A]/80 rounded-2xl flex items-center justify-center z-10">
                        <FaSpinner className="animate-spin text-white" size={24} />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <div className="h-12 w-12 bg-white/20 rounded-xl overflow-hidden flex items-center justify-center border border-white/20 shrink-0">
                             <MedicineImage src={resolveImageUrl(selectedMaster?.image_url)} />
                          </div>
                          <div>
                              <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-85">Reference Item Selected</p>
                              <p className="text-base font-black leading-tight">{selectedMaster?.name || 'Selected Medicine'}</p>
                          </div>
                        </div>
                        {!initialData && (
                            <button type="button" onClick={() => { setActiveTab('master'); setCurrentPage(1); }} className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all shrink-0">
                              Change
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 pt-3 border-t border-white/20 text-[10px]">
                        <div>
                            <span className="font-bold uppercase tracking-wider opacity-75">Manufacturer:</span>{" "}
                            <span className="font-black">{selectedMaster?.manufacturers || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="font-bold uppercase tracking-wider opacity-75">Salt Composition:</span>{" "}
                            <span className="font-black truncate block max-w-[200px]" title={selectedMaster?.salt_composition}>{selectedMaster?.salt_composition || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="font-bold uppercase tracking-wider opacity-75">Standard Catalog MRP:</span>{" "}
                            <span className="font-black">₹{selectedMaster?.mrp || 'N/A'}</span>
                        </div>
                        {selectedMaster?.masterMrp && (
                            <div>
                                <span className="font-bold uppercase tracking-wider opacity-75">Admin Ceiling:</span>{" "}
                                <span className="font-black">₹{selectedMaster?.masterMrp}</span>
                            </div>
                        )}
                    </div>
                    {selectedMaster?.description && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-[9px] opacity-90 leading-relaxed italic">
                        "{selectedMaster.description}"
                      </div>
                    )}
                </div>

                {/* Batch Number */}
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                      Batch Number <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. DOL-C303" 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all uppercase" 
                      value={formData.batch_number} 
                      onChange={e => setFormData({...formData, batch_number: e.target.value.toUpperCase()})} 
                    />
                </div>

                {/* Batch Printed MRP */}
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                      Batch Printed MRP <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</div>
                      <input 
                        required 
                        type="number"
                        min="0"
                        step="0.01" 
                        onKeyDown={preventNegativeInput}
                        className={`w-full pl-8 p-3.5 bg-slate-50 border rounded-xl font-semibold text-xs outline-none transition-all ${
                          batchMrpExceedsMaster 
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' 
                            : 'border-slate-200 focus:border-[#08B36A]'
                        }`} 
                        value={formData.mrp} 
                        onChange={e => handleNonNegativeChange('mrp', e.target.value)} 
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block ml-1">
                      Approved limit: ₹{ceiling || 'N/A'}
                    </span>
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Selling Price <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</div>
                      <input 
                        required 
                        type="number"
                        min="0"
                        step="0.01" 
                        onKeyDown={preventNegativeInput}
                        className="w-full pl-8 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" 
                        value={formData.vendor_price} 
                        onChange={e => handleNonNegativeChange('vendor_price', e.target.value)} 
                      />
                    </div>
                </div>

                {/* Anti-Fraud Exceeded Warning */}
                {batchMrpExceedsMaster && (
                  <div className="col-span-2 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3">
                    <div className="flex gap-2.5 items-start text-rose-800">
                      <FaInfoCircle className="mt-0.5 shrink-0 text-rose-500" size={14} />
                      <div>
                        <p className="text-xs font-black">Anti-Fraud Shield Active</p>
                        <p className="text-[11px] font-medium text-rose-700/90 mt-0.5">
                          The batch MRP (₹{formData.mrp}) exceeds the approved catalog limit (₹{ceiling}). 
                          You must submit an MRP Increase Request for Admin approval to stock this batch.
                        </p>
                      </div>
                    </div>
                    {!showMrpRequestForm ? (
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowMrpRequestForm(true);
                          setFormData(prev => ({
                            ...prev,
                            proposedMrp: prev.mrp,
                            mrpRequestReason: `New batch ${prev.batch_number || 'code'} has a printed price of ₹${prev.mrp} due to vendor raw material inflation.`
                          }));
                        }} 
                        className="self-start px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-all shadow-sm"
                      >
                        Request MRP Increase
                      </button>
                    ) : (
                      <div className="border-t border-rose-100 pt-3 space-y-3 w-full">
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">MRP Increase Ticket Details</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Proposed MRP Limit</label>
                            <input 
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-rose-500"
                              value={formData.proposedMrp}
                              onChange={e => handleNonNegativeChange('proposedMrp', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Reason for Request</label>
                            <textarea 
                              required
                              rows="1"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-rose-500 resize-none"
                              value={formData.mrpRequestReason}
                              onChange={e => setFormData({ ...formData, mrpRequestReason: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-1">
                          <button 
                            type="button"
                            disabled={mrpSubmitting}
                            onClick={handleMrpIncreaseSubmit}
                            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {mrpSubmitting && <FaSpinner className="animate-spin text-xs" />}
                            Submit Request
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setShowMrpRequestForm(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Quantity */}
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Stock Units <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="number"
                      min="0" 
                      step="1"
                      onKeyDown={preventNegativeInput}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" 
                      value={formData.stock_quantity} 
                      onChange={e => handleNonNegativeChange('stock_quantity', e.target.value)} 
                      placeholder="e.g. 200" 
                    />
                </div>

                {/* HSN CODE SELECT DROPDOWN */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        HSN / Tax Category <span className="text-rose-500">*</span>
                      </label>
                      {loadingHsn && (
                        <span className="flex items-center gap-1 text-[9px] text-[#08B36A] font-bold">
                          <FaSpinner className="animate-spin" /> Loading list...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none z-10" />
                      <select 
                        required
                        className="w-full pl-10 pr-8 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] focus:bg-white outline-none transition-all appearance-none cursor-pointer text-slate-700 truncate" 
                        value={formData.hsn_number} 
                        onChange={e => setFormData({ ...formData, hsn_number: e.target.value })}
                      >
                        <option value="">-- Select HSN Code / Tax Rate ({hsnCodesList.length} items available) --</option>
                        {hsnCodesList.map((item, index) => {
                          const code = item.hsnCode || item.hsn_code || item.code || '';
                          const desc = item.description || item.name || 'Category';
                          const gst = item.totalGstPercent ?? item.gstRate ?? 0;
                          return (
                            <option key={item._id || `${code}-${index}`} value={code}>
                              {code} — {desc} ({gst}% GST)
                            </option>
                          );
                        })}
                        {/* Preserve existing batch HSN if not present in the list */}
                        {formData.hsn_number && !hsnCodesList.some(i => (i.hsnCode || i.hsn_code) === formData.hsn_number) && (
                          <option value={formData.hsn_number}>
                            {formData.hsn_number} (Selected)
                          </option>
                        )}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                        ▼
                      </div>
                    </div>
                    {hsnError && (
                      <span className="text-[10px] text-rose-500 font-bold block ml-1">{hsnError}</span>
                    )}
                    <div className="flex items-center justify-between ml-1 pt-1">
                      <button
                        type="button"
                        onClick={() => { setShowHsnRequestForm(true); setActiveTab('hsnRequests'); }}
                        className="text-[10px] font-bold text-[#08B36A] hover:underline"
                      >
                        Can't find your HSN code? Request new
                      </button>
                      {myHsnRequests.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('hsnRequests')}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:underline"
                        >
                          View my requests ({myHsnRequests.length})
                        </button>
                      )}
                    </div>
                </div>

                {/* Manufacturing Date */}
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Manufacturing Date</label>
                    <input 
                      type="date" 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" 
                      value={formData.manufacturing_date} 
                      onChange={e => setFormData({...formData, manufacturing_date: e.target.value})} 
                    />
                </div>

                {/* Batch Expiry */}
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Batch Expiry <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="date" 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" 
                      value={formData.expiry_date} 
                      onChange={e => setFormData({...formData, expiry_date: e.target.value})} 
                    />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || batchMrpExceedsMaster} 
                  className="col-span-2 mt-2 py-4 bg-slate-900 hover:bg-[#08B36A] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl uppercase text-[10px] tracking-widest transition-all duration-150 shadow-md flex items-center justify-center gap-2"
                >
                    {loading ? <FaSpinner className="animate-spin text-sm" /> : <><FaFileInvoice /> Confirm Stock Details</>}
                </button>
            </form>
          )}

          {/* TAB 4: Full HSN Requests List */}
          {activeTab === 'hsnRequests' && (
            <div className="flex flex-col flex-grow min-h-0 space-y-4">
              <div className="flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-sm font-black text-slate-900">My HSN Code Requests</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Track approval status for HSN codes you've submitted</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHsnRequestForm(prev => !prev)}
                  className="px-4 py-2.5 bg-[#08B36A] hover:bg-[#079d5c] text-white text-[10px] font-extrabold uppercase rounded-xl tracking-wider transition-all shadow-sm flex-shrink-0"
                >
                  {showHsnRequestForm ? 'Close Form' : '+ New Request'}
                </button>
              </div>

              {/* CUSTOM HSN CODE REQUEST FORM */}
              {showHsnRequestForm && (
                <div className="flex-shrink-0 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fade-in">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Request New HSN Code</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">HSN Code (6 or 8 digits)</label>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="e.g. 30049088"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#08B36A]"
                        value={formData.newHsnCode}
                        onChange={e => setFormData({ ...formData, newHsnCode: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Suggested GST %</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        onKeyDown={preventNegativeInput}
                        placeholder="e.g. 12"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#08B36A]"
                        value={formData.newHsnTaxPercent}
                        onChange={e => handleNonNegativeChange('newHsnTaxPercent', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Novel Anti-viral Tablet Formulation"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#08B36A]"
                        value={formData.newHsnDescription}
                        onChange={e => setFormData({ ...formData, newHsnDescription: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Reason (optional)</label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Newly approved drug batch arrived this week."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#08B36A] resize-none"
                        value={formData.newHsnReason}
                        onChange={e => setFormData({ ...formData, newHsnReason: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={hsnRequestSubmitting}
                      onClick={handleHsnRequestSubmit}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {hsnRequestSubmitting && <FaSpinner className="animate-spin text-xs" />}
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHsnRequestForm(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* FULL REQUESTS LIST */}
              <div className="flex-grow overflow-y-auto pr-1 min-h-[260px] max-h-[420px] space-y-2.5">
                {loadingMyHsnRequests ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400">
                    <FaSpinner className="animate-spin text-lg mb-2" />
                    <span className="font-semibold text-xs">Loading your requests...</span>
                  </div>
                ) : myHsnRequests.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400 animate-fade-in">
                    <FaFileInvoice size={24} className="text-slate-300 mb-2" />
                    <span className="font-semibold text-xs">No HSN requests submitted yet</span>
                    <span className="text-[10px] text-slate-400 mt-1">Use "+ New Request" above to submit one</span>
                  </div>
                ) : (
                  myHsnRequests.map(req => (
                    <div key={req._id} className="p-4 border border-slate-200/60 rounded-2xl shadow-sm animate-fade-in space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaBarcode className="text-slate-300 text-xs" />
                          <span className="text-sm font-black text-slate-900">{req.hsnCode}</span>
                        </div>
                        {hsnStatusBadge(req.status)}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{req.description}</p>
                      <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Suggested GST: {req.suggestedTaxPercent}%</span>
                        {req.createdAt && (
                          <span>Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                      {req.reason && (
                        <p className="text-[10px] text-slate-500 italic border-t border-slate-100 pt-1.5 mt-1.5">"{req.reason}"</p>
                      )}
                      {req.status === 'Rejected' && req.rejectionReason && (
                        <p className="text-[10px] text-rose-700 font-semibold bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mt-1.5">
                          <span className="font-black uppercase tracking-wider block mb-0.5">Rejection Reason</span>
                          {req.rejectionReason}
                        </p>
                      )}
                      {req.status === 'Approved' && (
                        <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-1.5">
                          This HSN code is now live and available in the dropdown.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}