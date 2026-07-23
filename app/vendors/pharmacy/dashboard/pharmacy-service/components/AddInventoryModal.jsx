'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  FaTimes, 
  FaSpinner, 
  FaSearch, 
  FaCapsules, 
  FaChevronLeft, 
  FaChevronRight, 
  FaInfoCircle,
  FaUpload,
  FaTrash
} from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function AddInventoryModal({ isOpen, onClose, onSave, loading, initialData, masterList = [] }) {
  const [activeTab, setActiveTab] = useState('master'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [masterResults, setMasterResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  
  // File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Form State
  const [formData, setFormData] = useState({
    vendor_price: '', 
    stock_quantity: '', 
    expiry_date: '',
    newName: '', 
    newManufacturer: '', 
    newSalt: '', 
    newPackaging: '', 
    newMRP: '',
    newBestPrice: '',
    newDescription: '',
    newPrescriptionRequired: 'No'
  });

  // Fetch the default master medicine database from backend
  const fetchDefaultMaster = async () => {
    setSearching(true);
    try {
      const res = await PharmacyVendorAPI.searchMasterMedicines('');
      if (res && res.data) {
        setMasterResults(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch global master medicines", err);
    } finally {
      setSearching(false);
    }
  };

  // Hydrate modal states
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setSelectedMaster(initialData.medicineId);
            setFormData(prev => ({ 
              ...prev, 
              vendor_price: initialData.vendor_price, 
              stock_quantity: initialData.stock_quantity, 
              expiry_date: initialData.expiry_date?.split('T')[0] || '' 
            }));
            setActiveTab('config');
        } else {
            setActiveTab('master');
            setSearchTerm('');
            setCurrentPage(1);
            setSelectedFile(null);
            setImagePreview('');
            fetchDefaultMaster();
        }
    }
  }, [initialData, isOpen]);

  // Handle local image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
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

  // Handle server-side API search
  const handleMasterSearch = async () => {
    setSearching(true);
    setCurrentPage(1);
    try {
      const res = await PharmacyVendorAPI.searchMasterMedicines(searchTerm.trim());
      setMasterResults(res.data || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setSearching(false); 
    }
  };

  // Synchronize dynamic lists
  const processedList = useMemo(() => {
    if (masterResults && masterResults.length > 0) {
      return masterResults;
    }
    if (searchTerm.trim() !== "") {
      return masterList.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.manufacturers && item.manufacturers.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return masterList;
  }, [searchTerm, masterResults, masterList]);

  // Compute Active Paginated Chunk
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedList, currentPage]);

  const totalPages = Math.ceil(processedList.length / ITEMS_PER_PAGE) || 1;

  // Handle flat object submission
  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    try {
        let finalImageUrl = [];

        if (selectedFile) {
          // वास्तविक प्रोडक्शन में: पहले इमेज फ़ाइल को सर्वर/S3 पर अपलोड करें और प्राप्त URL का उपयोग करें।
          // उदाहरण: const uploadRes = await PharmacyVendorAPI.uploadImage(selectedFile);
          // finalImageUrl = [uploadRes.url];
          
          // यहाँ पेलोड संरचना को पूरा करने के लिए एक सांकेतिक URL का उपयोग किया गया है:
          const simulatedUrl = `https://api-url/uploads/medicines/${selectedFile.name.replace(/\s+/g, '_')}`;
          finalImageUrl = [simulatedUrl];
        }

        const payload = {
            name: formData.newName,
            manufacturers: formData.newManufacturer,
            salt_composition: formData.newSalt,
            packaging: formData.newPackaging,
            mrp: formData.newMRP,
            best_price: formData.newBestPrice || formData.newMRP, 
            description: formData.newDescription,
            prescription_required: formData.newPrescriptionRequired,
            image_url: finalImageUrl
        };
        
        await PharmacyVendorAPI.submitNewMasterRequest(payload);
        alert("Request to add new medicine submitted successfully!");
        onClose();
    } catch (err) { 
      alert("Failed to submit request"); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="bg-slate-50/60 border-b border-slate-100">
            <div className="p-6 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Medicine Configurator</h2>
                  <p className="text-xs text-slate-400 font-medium">Link medicine reference to active inventory</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <FaTimes size={18}/>
                </button>
            </div>
            {!initialData && activeTab !== 'config' && (
                <div className="flex px-6 border-t border-slate-100">
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
                </div>
            )}
        </div>

        {/* Modal Scrollable Container */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col min-h-0 bg-white">
          
          {/* TAB 1: Pickup Master Medicine */}
          {activeTab === 'master' && (
            <div className="space-y-5 flex flex-col flex-grow min-h-0">
              
              {/* Search Bar Input */}
              <div className="relative group flex-shrink-0">
                <input 
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-xs placeholder-slate-400 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] focus:bg-white transition-all duration-150" 
                  placeholder="Search global reference database (e.g. Paracetamol)..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleMasterSearch()} 
                />
                <button 
                  onClick={handleMasterSearch} 
                  className="absolute right-2 top-2 bottom-2 px-4 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center"
                >
                  {searching ? <FaSpinner className="animate-spin text-sm" /> : <FaSearch className="text-xs" />}
                </button>
              </div>

              {/* Medicine Records Scrollable Grid */}
              <div className="space-y-2 overflow-y-auto pr-1 flex-grow max-h-[480px] min-h-[260px]">
                {paginatedItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400">
                    <FaInfoCircle size={24} className="text-slate-300 mb-2" />
                    <span className="font-semibold text-xs">No records found matching your query</span>
                    <span className="text-[10px] text-slate-400">Try adjusting terms or submit a suggestion</span>
                  </div>
                ) : (
                  paginatedItems.map((m) => (
                    <div 
                      key={m._id} 
                      className="flex justify-between items-center p-4 border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-[#08B36A]/40 cursor-pointer group transition-all duration-150 shadow-sm" 
                      onClick={() => { setSelectedMaster(m); setFormData(p => ({...p, vendor_price: m.mrp})); setActiveTab('config'); }}
                    >
                       <div className="flex gap-3.5 items-center">
                          <div className="h-9 w-9 bg-[#08B36A]/10 rounded-xl flex items-center justify-center text-[#08B36A] font-bold">
                            <FaCapsules size={14} />
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

              {/* Dynamic Pagination Controls Block */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 flex-shrink-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Page {currentPage} of {totalPages} ({processedList.length} items)
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl transition duration-150"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl transition duration-150"
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Suggest Medicine to Admin */}
          {activeTab === 'suggest' && (
            <form onSubmit={handleSuggestSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Medicine Name</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newName} onChange={e => setFormData({...formData, newName: e.target.value})} placeholder="e.g. Paracetamol 500mg" />
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Manufacturer</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newManufacturer} onChange={e => setFormData({...formData, newManufacturer: e.target.value})} placeholder="e.g. Cipla Ltd" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Salt Composition</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newSalt} onChange={e => setFormData({...formData, newSalt: e.target.value})} placeholder="e.g. Paracetamol (500mg)" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Packaging</label>
                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newPackaging} onChange={e => setFormData({...formData, newPackaging: e.target.value})} placeholder="e.g. Strip of 15 tablets" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Prescription Required</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newPrescriptionRequired} onChange={e => setFormData({...formData, newPrescriptionRequired: e.target.value})}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Global MRP</label>
                    <input required type="number" step="0.01" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newMRP} onChange={e => setFormData({...formData, newMRP: e.target.value})} placeholder="40.00" />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Best Price</label>
                    <input required type="number" step="0.01" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition" value={formData.newBestPrice} onChange={e => setFormData({...formData, newBestPrice: e.target.value})} placeholder="32.00" />
                </div>

                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea rows="2" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#08B36A] rounded-xl font-semibold text-xs outline-none transition resize-none" value={formData.newDescription} onChange={e => setFormData({...formData, newDescription: e.target.value})} placeholder="Used for pain relief and fever treatment." />
                </div>

                {/* System Photo Selector with Preview */}
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Medicine Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    
                    {!imagePreview ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#08B36A] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-50/80 transition-all group"
                      >
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 group-hover:text-[#08B36A] group-hover:shadow-sm transition-all">
                          <FaUpload size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">Choose file from system</span>
                        <span className="text-[9px] text-slate-400 font-medium">Supports PNG, JPG, JPEG (Max. 5MB)</span>
                      </div>
                    ) : (
                      <div className="relative border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl border border-slate-100 overflow-hidden bg-white flex items-center justify-center">
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 max-w-[200px] truncate">{selectedFile?.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{(selectedFile?.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                </div>

                <button type="submit" className="col-span-2 mt-4 py-4 bg-[#08B36A] hover:bg-[#079d5c] text-white font-extrabold rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-md hover:shadow-lg shadow-[#08B36A]/10">Submit for Approval</button>
            </form>
          )}

          {/* TAB 3: Configure Medicine Batch */}
          {activeTab === 'config' && (
            <form onSubmit={(e) => { e.preventDefault(); onSave({ medicineId: selectedMaster._id, vendor_price: Number(formData.vendor_price), stock_quantity: Number(formData.stock_quantity), expiry_date: formData.expiry_date }); }} className="grid grid-cols-2 gap-5">
                <div className="col-span-2 p-5 bg-[#08B36A] rounded-2xl text-white flex justify-between items-center shadow-lg shadow-[#08B36A]/10">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Reference Item Selected</p>
                        <p className="text-base font-black">{selectedMaster?.name}</p>
                    </div>
                    {!initialData && <button type="button" onClick={() => { setActiveTab('master'); setCurrentPage(1); }} className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all">Change</button>}
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Selling Price</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</div>
                      <input required step="0.01" type="number" className="w-full pl-8 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" value={formData.vendor_price} onChange={e => setFormData({...formData, vendor_price: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Stock Units</label>
                    <input required type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Batch Expiry</label>
                    <input required type="date" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:border-[#08B36A] outline-none transition-all" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>
                <button type="submit" disabled={loading} className="col-span-2 mt-2 py-4 bg-slate-900 hover:bg-[#08B36A] text-white font-extrabold rounded-xl uppercase text-[10px] tracking-widest transition-all duration-150 shadow-md">
                    {loading ? <FaSpinner className="animate-spin mx-auto text-sm" /> : 'Confirm Stock Details'}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}