"use client";

import PharmacyVendorAPI from "@/app/services/PharmacyVendorAPI";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FaInfoCircle, FaRegClock, FaTrashAlt, FaEdit, 
  FaCloudUploadAlt, FaPercentage, FaCapsules, FaChevronRight 
} from "react-icons/fa";

export default function PharmacyAdminPanel() {
  // --- STATE ---
  const [inventoryList, setInventoryList] = useState([]); // Filtered OTC non-prescription medicines
  const [campaigns, setCampaigns] = useState([]); // List of active/paused offers
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Architect Form Fields State
  const [campaignDisplayName, setCampaignDisplayName] = useState("");
  const [selectedMedId, setSelectedMedId] = useState(""); // Medicine _id
  const [buyQty, setBuyQty] = useState(2);
  const [getFreeQty, setGetFreeQty] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  
  // Multi-Image Upload State
  const [selectedImages, setSelectedImages] = useState([]); // Array of { file, preview }
  const fileInputRef = useRef(null);

  // Base backend URL for rendering images loaded from public storage paths
  const imageBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  // --- API INTEGRATION: FETCH DATA ---

  useEffect(() => {
    fetchRequiredData();
  }, []);

  const fetchRequiredData = async () => {
    setLoading(true);
    try {
      // Swapped standard getMyInventory to getMyOtcInventory for Combo promotions
      const inventoryRes = await PharmacyVendorAPI.getMyOtcInventory();
      if (inventoryRes.success && inventoryRes.data) {
        // STRICT REGULATORY FILTER: Only allow medicines where prescription_required is explicitly "NO"
        const filteredOtcOnly = inventoryRes.data.filter(
          item => item.medicineId?.prescription_required === "NO"
        );
        
        setInventoryList(filteredOtcOnly);
        if (filteredOtcOnly.length > 0) {
          setSelectedMedId(filteredOtcOnly[0].medicineId._id);
        }
      }

      // Fetch active/paused combo offers for registry (my-offers)
      const offersRes = await PharmacyVendorAPI.listComboOffers();
      if (offersRes.success && offersRes.data) {
        setCampaigns(offersRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch initial admin dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- MULTI-IMAGE MANAGEMENT ---

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check maximum limits
    if (selectedImages.length + files.length > 10) {
      alert("A maximum of 10 images can be attached to a campaign.");
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages(prev => {
      const updated = [...prev];
      const target = updated[indexToRemove];
      if (target.preview.startsWith("blob:")) {
        URL.revokeObjectURL(target.preview);
      }
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- ACTIONS ---

  // Handle Form Submission: Create or Edit
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (!selectedMedId) return;

    if (selectedImages.length === 0) {
      alert("Please attach at least one campaign banner image.");
      return;
    }

    setActionProcessing(true);
    try {
      const selectedItem = inventoryList.find(item => item.medicineId._id === selectedMedId);
      
      // Safety Check before submission
      if (selectedItem?.medicineId?.prescription_required !== "NO") {
        alert("Action Blocked: Only non-prescription medicines can be utilized in combo campaigns.");
        setActionProcessing(false);
        return;
      }

      const computedPromoMargin = Number(dealAnalysis?.promoMargin || 0);

      const formData = new FormData();
      formData.append("campaignDisplayName", campaignDisplayName.trim() || `${selectedItem?.medicineId?.name} Buy ${buyQty} Get ${getFreeQty}`);
      formData.append("medicineId", selectedMedId);
      formData.append("buyQty", Number(buyQty));
      formData.append("getFreeQty", Number(getFreeQty));
      formData.append("startDate", startDate);
      formData.append("expiryDate", expiryDate);
      formData.append("projectedPromoMargin", computedPromoMargin);

      selectedImages.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file);
        }
      });

      if (editingId) {
        const response = await PharmacyVendorAPI.updateComboOffer(editingId, formData);
        if (response.success) {
          setEditingId(null);
        }
      } else {
        await PharmacyVendorAPI.createComboOffer(formData);
      }

      resetForm();
      const freshOffers = await PharmacyVendorAPI.listComboOffers();
      if (freshOffers.success) setCampaigns(freshOffers.data);
    } catch (err) {
      console.error("Error saving campaign parameters", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Switch toggle active state
  const handleToggleStatus = async (id) => {
    try {
      const res = await PharmacyVendorAPI.toggleComboOffer(id);
      if (res.success) {
        setCampaigns(campaigns.map(camp => {
          if (camp._id === id) {
            return { ...camp, isActive: !camp.isActive };
          }
          return camp;
        }));
      }
    } catch (err) {
      console.error("Error updating status toggle", err);
    }
  };

  // Load target record details into editing state
  const handleEditInit = (camp) => {
    setEditingId(camp._id);
    setCampaignDisplayName(camp.campaignDisplayName);
    
    const targetId = typeof camp.medicineId === 'object' ? camp.medicineId._id : camp.medicineId;
    setSelectedMedId(targetId);
    
    setBuyQty(camp.buyQty);
    setGetFreeQty(camp.getFreeQty);
    
    if (camp.startDate) setStartDate(camp.startDate.substring(0, 10));
    if (camp.expiryDate) setExpiryDate(camp.expiryDate.substring(0, 10));

    if (camp.images && Array.isArray(camp.images)) {
      setSelectedImages(camp.images.map(imgUrl => ({ file: null, preview: imgUrl })));
    } else {
      setSelectedImages([]);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setCampaignDisplayName("");
    if (inventoryList.length > 0) {
      setSelectedMedId(inventoryList[0].medicineId._id);
    } else {
      setSelectedMedId("");
    }
    setBuyQty(2);
    setGetFreeQty(1);
    setStartDate("");
    setExpiryDate("");

    selectedImages.forEach(img => {
      if (img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setSelectedImages([]);
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this combo offer?")) return;
    try {
      const res = await PharmacyVendorAPI.deleteComboOffer(id);
      if (res.success) {
        if (editingId === id) setEditingId(null);
        setCampaigns(campaigns.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete campaign from database", err);
    }
  };

  // --- REAL-TIME PORTAL MARGIN CALCULATION ---
  const dealAnalysis = useMemo(() => {
    const selectedItem = inventoryList.find(item => item.medicineId._id === selectedMedId);
    if (!selectedItem) return null;

    const retailPrice = parseFloat(selectedItem.medicineId.mrp); // MRP Limit
    const costPrice = parseFloat(selectedItem.vendor_price); // Buying Rate

    const totalUnits = buyQty + getFreeQty;
    const grossRevenue = buyQty * retailPrice;
    const totalCost = totalUnits * costPrice;
    const promoProfit = grossRevenue - totalCost;
    const promoMargin = (promoProfit / grossRevenue) * 100;

    return {
      promoMargin: isNaN(promoMargin) ? "0.0" : promoMargin.toFixed(1),
      isNegative: promoMargin < 0,
      isTight: promoMargin >= 0 && promoMargin < 15
    };
  }, [selectedMedId, buyQty, getFreeQty, inventoryList]);

  // Image Source formatter helper
  const getFullImageUrl = (path) => {
    if (!path) return "/placeholder-image.png";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
      return path;
    }
    return `${imageBaseUrl}/${path.replace(/\\/g, "/")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A] mb-4"></div>
        <span className="text-sm font-semibold text-slate-500">Loading BOGO Console...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfd] text-slate-800 min-h-screen font-sans antialiased selection:bg-[#08B36A]/20">
      
      {/* Navigation Brand Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 py-6 px-8  top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 rounded-2xl text-[#08B36A] border border-emerald-100/50 shadow-sm">
              <FaCapsules size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">OTC Promo Hub</h1>
              <p className="text-xs text-slate-400 font-bold tracking-wide mt-0.5">Compliant BOGO Campaign Suite</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-black bg-slate-100 border border-slate-200/50 px-4 py-2 rounded-2xl shadow-sm tracking-widest uppercase">
            REGULATED CONSOLE
          </span>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMN 1: Campaign Architect */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Regulatory Safeguard Info Banner */}
            <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-3xl flex items-start gap-4">
              <FaInfoCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Regulatory Safeguard</h4>
                <p className="text-[11px] text-blue-700/90 leading-relaxed font-semibold">
                  Under retail drug regulations, prescription-required medicines are strictly barred from incentive promotional bundling programs. Only Over-The-Counter (OTC) medicines can be selected.
                </p>
              </div>
            </div>

            <div className={`bg-white rounded-[32px] shadow-[0_12px_50px_rgba(8,179,106,0.03)] border transition-all duration-300 overflow-hidden ${
              editingId ? "border-[#08B36A]/45 ring-4 ring-[#08B36A]/5" : "border-slate-100"
            }`}>
              
              <div className={`p-6 border-b transition-colors ${
                editingId ? "border-[#08B36A]/10 bg-emerald-50/10" : "border-slate-50"
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {editingId ? "Edit Promo Setup" : "Campaign Architect"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Configure your Buy-X-Get-Y promotional templates.
                    </p>
                  </div>
                  {editingId && (
                    <button 
                      onClick={cancelEditing}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-black bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-xl uppercase tracking-wider transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {inventoryList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="text-sm font-black">No compliant OTC medicines found.</p>
                  <p className="text-xs text-slate-400">Please verify you have medicines in your inventory marked as prescription not required.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveCampaign} className="p-6 space-y-6">
                  {/* Campaign Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Campaign Display Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Paracetamol Clearance"
                      value={campaignDisplayName}
                      onChange={(e) => setCampaignDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] focus:outline-none p-4 text-xs font-bold transition"
                      required
                    />
                  </div>

                  {/* Target Medicine Select (Filtered to OTC Only) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Select Eligible OTC Medicine
                      </label>
                      <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">
                        OTC ONLY
                      </span>
                    </div>
                    <select 
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] focus:outline-none p-4 text-xs font-bold transition cursor-pointer"
                      required
                      disabled={!!editingId}
                    >
                      {inventoryList.map(item => (
                        <option key={item._id} value={item.medicineId._id}>
                          {item.medicineId.name} (MRP: ₹{parseFloat(item.medicineId.mrp).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mechanic Configurations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Buy Qty (X)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={buyQty} 
                        onChange={(e) => setBuyQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-4 text-xs font-bold focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Get Free (Y)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={getFreeQty} 
                        onChange={(e) => setGetFreeQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-4 text-xs font-bold focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Config (Start and Expiry Dates) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Start Date
                      </label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-4 text-xs font-bold focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Expiry Date
                      </label>
                      <input 
                        type="date" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-4 text-xs font-bold focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Multi-Image File upload interface */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Campaign Banner / Banners (Max 10)
                    </label>
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange}
                      className="hidden" 
                    />

                    <div 
                      onClick={triggerFileSelect}
                      className="w-full border-2 border-dashed border-slate-200 hover:border-[#08B36A]/60 bg-slate-50 hover:bg-emerald-50/20 p-6 rounded-3xl cursor-pointer transition text-center flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="p-3 bg-white rounded-2xl border border-slate-100 text-[#08B36A] shadow-sm">
                        <FaCloudUploadAlt size={22} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Add Campaign Media</span>
                      <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, or WebP banner designs</span>
                    </div>

                    {/* Previews Grid with delete action overlay */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            <img 
                              src={getFullImageUrl(img.preview)} 
                              alt="Upload preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={() => removeSelectedImage(idx)}
                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                                title="Delete image"
                              >
                                <FaTrashAlt size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profit/Margin Insight Panel */}
                  {dealAnalysis && (
                    <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-1.5 transition-all duration-300 ${
                      dealAnalysis.isNegative 
                        ? "bg-rose-50/70 border-rose-100 text-rose-800" 
                        : dealAnalysis.isTight 
                          ? "bg-amber-50/70 border-amber-100 text-amber-800" 
                          : "bg-[#08B36A]/5 border-[#08B36A]/10 text-emerald-800"
                    }`}>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><FaPercentage /> Projected Margin</span>
                        <span className="font-extrabold text-sm">{dealAnalysis.promoMargin}%</span>
                      </div>
                      {dealAnalysis.isNegative && (
                        <p className="text-[10px] leading-relaxed font-semibold">
                          Alert: The cost of raw goods exceeds estimated promotional revenue payouts.
                        </p>
                      )}
                      {dealAnalysis.isTight && !dealAnalysis.isNegative && (
                        <p className="text-[10px] leading-relaxed font-semibold">
                          Notice: Profit margins are thin (under 15%). Assess item volume constraints before running.
                        </p>
                      )}
                      {!dealAnalysis.isTight && !dealAnalysis.isNegative && (
                        <p className="text-[10px] leading-relaxed font-semibold">
                          Success: Profit margin parameters are stable.
                        </p>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={actionProcessing}
                    className="w-full bg-[#08B36A] disabled:bg-slate-300 hover:bg-[#079d5c] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest py-4 text-center transition duration-150 shadow-lg shadow-emerald-100/30"
                  >
                    {actionProcessing ? "Saving changes..." : editingId ? "Save Campaign Changes" : "Deploy BOGO Offer"}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* COLUMN 2: Campaign Registry */}
          <section className="lg:col-span-7">
            <div className="bg-white rounded-[32px] shadow-[0_12px_50px_rgba(8,179,106,0.03)] border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Campaign Registry</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Registry queue of active, compliant OTC discount programs</p>
                </div>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  Count: {campaigns.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50 text-[9px] uppercase tracking-widest font-black">
                      <th className="p-5 pl-8">Campaign Details</th>
                      <th className="p-5">Mechanic Rule</th>
                      <th className="p-5">Campaign Schedule</th>
                      <th className="p-5 text-center">Status Toggle</th>
                      <th className="p-5 text-right pr-8">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-300 py-20 uppercase font-black tracking-widest text-[10px]">
                          No offers configured in registry.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map(camp => {
                        const medName = typeof camp.medicineId === "object" ? camp.medicineId?.name : "Unknown Medicine";
                        const isCurrentlyEditing = editingId === camp._id;
                        const firstImage = camp.images && camp.images.length > 0 ? camp.images[0] : null;

                        return (
                          <tr key={camp._id} className={`hover:bg-emerald-50/10 transition-colors ${
                            isCurrentlyEditing ? "bg-emerald-50/20" : ""
                          }`}>
                            <td className="p-5 pl-8">
                              <div className="flex items-center space-x-3.5">
                                {firstImage && (
                                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                                    <img 
                                      src={getFullImageUrl(firstImage)} 
                                      alt="Banner" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-black text-slate-800 text-sm">{camp.campaignDisplayName}</p>
                                    <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-100">
                                      OTC Only
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">{medName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 whitespace-nowrap">
                              <span className="bg-emerald-50 text-[#08B36A] font-black px-3 py-2 rounded-2xl text-[10px] border border-[#08B36A]/10 uppercase tracking-wider">
                                Buy {camp.buyQty} Get {camp.getFreeQty}
                              </span>
                            </td>
                            <td className="p-5">
                              <div className="flex flex-col gap-1 text-slate-500 font-bold">
                                <span className="text-[10px] flex items-center gap-1"><FaRegClock className="text-slate-300" size={10} /> <strong>Start:</strong> {camp.startDate ? camp.startDate.substring(0, 10) : "Immediate"}</span>
                                <span className="text-[10px] flex items-center gap-1"><FaRegClock className="text-slate-300" size={10} /> <strong>End:</strong> {camp.expiryDate ? camp.expiryDate.substring(0, 10) : "No Expiry"}</span>
                              </div>
                            </td>
                            
                            {/* iOS Style Toggle Switch */}
                            <td className="p-5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleToggleStatus(camp._id)}
                                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                  style={{ backgroundColor: camp.isActive ? "#08B36A" : "#CBD5E1" }}
                                >
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${camp.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                                </button>
                                <span className="text-[9px] font-black text-slate-400 min-w-[45px] text-left uppercase tracking-wider">
                                  {camp.isActive ? "Active" : "Paused"}
                                </span>
                              </div>
                            </td>

                            {/* Actions Control Column */}
                            <td className="p-5 text-right pr-8">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Edit Button */}
                                <button 
                                  onClick={() => handleEditInit(camp)} 
                                  title="Edit Campaign"
                                  className={`p-2 rounded-xl border transition ${
                                    isCurrentlyEditing 
                                      ? "bg-[#08B36A] text-white border-[#08B36A]" 
                                      : "text-slate-400 hover:text-slate-700 bg-slate-50 border-slate-100 hover:border-slate-200"
                                  }`}
                                >
                                  <FaEdit size={12} />
                                </button>

                                {/* Delete Button */}
                                <button 
                                  onClick={() => handleDeleteCampaign(camp._id)} 
                                  title="Delete Campaign"
                                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition"
                                >
                                  <FaTrashAlt size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}