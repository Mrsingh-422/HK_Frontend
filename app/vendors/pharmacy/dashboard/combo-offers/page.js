"use client";

import PharmacyVendorAPI from "@/app/services/PharmacyVendorAPI";
import React, { useState, useEffect, useMemo, useRef } from "react";

export default function PharmacyAdminPanel() {
  // --- STATE ---
  const [inventoryList, setInventoryList] = useState([]); // Raw data from inventory endpoint
  const [campaigns, setCampaigns] = useState([]); // List of active/paused offers
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Architect Form Fields State
  const [campaignDisplayName, setCampaignDisplayName] = useState("");
  const [selectedMedId, setSelectedMedId] = useState(""); // Medicine _id (Target Medicine ID)
  const [buyQty, setBuyQty] = useState(2);
  const [getFreeQty, setGetFreeQty] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  
  // Multi-Image Upload State
  const [selectedImages, setSelectedImages] = useState([]); // Array of { file: File (or null if pre-existing), preview: string }
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
      // Step A.1: Fetch medicines in the active inventory (getMyInventory)
      const inventoryRes = await PharmacyVendorAPI.getMyInventory();
      if (inventoryRes.success && inventoryRes.data) {
        setInventoryList(inventoryRes.data);
        if (inventoryRes.data.length > 0) {
          setSelectedMedId(inventoryRes.data[0].medicineId._id);
        }
      }

      // Step A.3: Fetch active/paused combo offers for registry (my-offers)
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
      // Clean up object URLs created during browser run to free memory
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

  // Handle Form Submission: Create (Step A.2) or Edit (Step A.4-B)
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
      const computedPromoMargin = Number(dealAnalysis?.promoMargin || 0);

      // Construct a unified FormData instance to support multipart/form-data upload
      const formData = new FormData();
      formData.append("campaignDisplayName", campaignDisplayName.trim() || `${selectedItem?.medicineId?.name} Buy ${buyQty} Get ${getFreeQty}`);
      formData.append("medicineId", selectedMedId);
      formData.append("buyQty", Number(buyQty));
      formData.append("getFreeQty", Number(getFreeQty));
      formData.append("startDate", startDate);
      formData.append("expiryDate", expiryDate);
      formData.append("projectedPromoMargin", computedPromoMargin);

      // Append binary files for newly added files
      selectedImages.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file);
        }
      });

      if (editingId) {
        // Step A.4-B: Update existing campaign (PUT with Multipart optional image re-upload)
        const response = await PharmacyVendorAPI.updateComboOffer(editingId, formData);
        if (response.success) {
          setEditingId(null);
        }
      } else {
        // Step A.2: Create new campaign (POST with Multipart images requirement)
        await PharmacyVendorAPI.createComboOffer(formData);
      }

      // Reset configurations and load updated lists
      resetForm();
      const freshOffers = await PharmacyVendorAPI.listComboOffers();
      if (freshOffers.success) setCampaigns(freshOffers.data);
    } catch (err) {
      console.error("Error saving campaign parameters", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Step A.4-A: Switch toggle active state
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

  // Step A.4-B: Load target record details into editing state
  const handleEditInit = (camp) => {
    setEditingId(camp._id);
    setCampaignDisplayName(camp.campaignDisplayName);
    
    const targetId = typeof camp.medicineId === 'object' ? camp.medicineId._id : camp.medicineId;
    setSelectedMedId(targetId);
    
    setBuyQty(camp.buyQty);
    setGetFreeQty(camp.getFreeQty);
    
    if (camp.startDate) setStartDate(camp.startDate.substring(0, 10));
    if (camp.expiryDate) setExpiryDate(camp.expiryDate.substring(0, 10));

    // Map existing remote image strings back into structural layout previews
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

    // Revoke local object URLs to prevent system footprint lag
    selectedImages.forEach(img => {
      if (img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setSelectedImages([]);
  };

  // Step A.4-C: Delete Campaign
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
    // Clean storage prefix configurations if required
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
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans antialiased selection:bg-[#08B36A]/20">
      
      {/* Navigation Brand Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-5 px-8  top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#08B36A]/10 rounded-2xl text-[#08B36A] shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v15.714a3 3 0 01-3 3h-3.375a3 3 0 01-3-3V3.104a3 3 0 013-3h3.375a3 3 0 013 3zm0 15.714a3 3 0 013-3h3.375a3 3 0 013 3v1.5a3 3 0 01-3 3h-3.375a3 3 0 01-3-3v-1.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">RxCombo Dashboard</h1>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide">BOGO Offer Optimization Suite</p>
            </div>
          </div>
          <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
            Control Console
          </span>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Campaign Architect */}
          <section className="lg:col-span-5 space-y-6">
            <div className={`bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] border transition-all duration-300 overflow-hidden ${
              editingId ? "border-[#08B36A]/50 ring-4 ring-[#08B36A]/5" : "border-slate-200/80"
            }`}>
              
              <div className={`p-6 border-b transition-colors ${
                editingId ? "border-[#08B36A]/10 bg-[#08B36A]/5" : "border-slate-100"
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {editingId ? "Edit Campaign" : "Campaign Architect"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {editingId ? "Modify settings for this active offer" : "Design standard 'Buy X Get Y Free' promotional setups"}
                    </p>
                  </div>
                  {editingId && (
                    <button 
                      onClick={cancelEditing}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {inventoryList.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <p className="text-sm font-semibold">No active inventory found.</p>
                  <p className="text-xs text-slate-400 mt-1">Please populate your store inventory list before configuring combo promotions.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveCampaign} className="p-6 space-y-5">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Campaign Display Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Paracetamol Clearance"
                      value={campaignDisplayName}
                      onChange={(e) => setCampaignDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] focus:outline-none p-3 text-xs font-semibold transition"
                      required
                    />
                  </div>

                  {/* Target Medicine Select (Step A.1) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Select Target Medicine
                    </label>
                    <select 
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] focus:outline-none p-3 text-xs font-semibold transition"
                      required
                      disabled={!!editingId} // Protect medicine modification on existing promotions
                    >
                      {inventoryList.map(item => (
                        <option key={item._id} value={item.medicineId._id}>
                          {item.medicineId.name} ({parseFloat(item.vendor_price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mechanic Configurations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Buy Qty (X)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={buyQty} 
                        onChange={(e) => setBuyQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-3 text-xs font-semibold focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Get Free (Y)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={getFreeQty} 
                        onChange={(e) => setGetFreeQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-3 text-xs font-semibold focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Config (Start and Expiry Dates) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Start Date
                      </label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-3 text-xs font-semibold focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Expiry Date
                      </label>
                      <input 
                        type="date" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] p-3 text-xs font-semibold focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Multi-Image File upload interface */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Campaign Banner / Promo Images (Max 10)
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
                      className="w-full border-2 border-dashed border-slate-200 hover:border-[#08B36A] bg-slate-50 hover:bg-[#08B36A]/5 p-5 rounded-2xl cursor-pointer transition text-center flex flex-col items-center justify-center space-y-1.5"
                    >
                      <div className="p-2 bg-white rounded-xl border border-slate-100 text-[#08B36A] shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Add Campaign Media</span>
                      <span className="text-[10px] text-slate-400">Attach banner images for promotion display</span>
                    </div>

                    {/* Previews Grid with delete action overlay */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
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
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
                      <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider opacity-95">
                        <span>Projected Promo Margin</span>
                        <span>{dealAnalysis.promoMargin}%</span>
                      </div>
                      {dealAnalysis.isNegative && (
                        <p className="text-[10px] leading-relaxed">
                          Negative margins. Cost of raw materials exceeds estimated promotional revenue.
                        </p>
                      )}
                      {dealAnalysis.isTight && !dealAnalysis.isNegative && (
                        <p className="text-[10px] leading-relaxed">
                          Margin is tight (under 15%). Assess item volume constraints before running.
                        </p>
                      )}
                      {!dealAnalysis.isTight && !dealAnalysis.isNegative && (
                        <p className="text-[10px] leading-relaxed">
                          Margin healthy. Promotional yield is sustainable.
                        </p>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={actionProcessing}
                    className="w-full bg-[#08B36A] disabled:bg-slate-300 hover:bg-[#079d5c] text-white font-extrabold rounded-xl text-xs px-5 py-3.5 text-center transition duration-150 shadow-sm shadow-[#08B36A]/10"
                  >
                    {actionProcessing ? "Saving changes..." : editingId ? "Save Campaign Changes" : "Deploy BOGO Offer"}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* COLUMN 2: Campaign Registry (Step A.3) */}
          <section className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Campaign Registry</h3>
                <p className="text-xs text-slate-400 mt-0.5">Control live and paused combo offers deployed to standard registers</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                      <th className="p-4 font-bold uppercase tracking-wider">Campaign Details</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Mechanic Rule</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Campaign Schedule</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">Status Toggle</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-400 py-16 italic font-medium">
                          No offers configured in registry. Create one using the architect form.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map(camp => {
                        const medName = typeof camp.medicineId === "object" ? camp.medicineId?.name : "Unknown Medicine";
                        const isCurrentlyEditing = editingId === camp._id;
                        
                        // Pick first image for the registry list thumbnail view
                        const firstImage = camp.images && camp.images.length > 0 ? camp.images[0] : null;

                        return (
                          <tr key={camp._id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                            isCurrentlyEditing ? "bg-slate-50" : ""
                          }`}>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                {firstImage && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-100">
                                    <img 
                                      src={getFullImageUrl(firstImage)} 
                                      alt="Banner" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{camp.campaignDisplayName}</p>
                                  <p className="text-slate-400 text-[10px] mt-0.5">{medName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="bg-[#08B36A]/10 text-[#08B36A] font-bold px-2.5 py-1.5 rounded-xl border border-[#08B36A]/20">
                                Buy {camp.buyQty} Get {camp.getFreeQty}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-0.5 text-slate-500 font-semibold">
                                <span className="text-[10px]"><strong className="text-slate-400">Start:</strong> {camp.startDate ? camp.startDate.substring(0, 10) : "Immediate"}</span>
                                <span className="text-[10px]"><strong className="text-slate-400">End:</strong> {camp.expiryDate ? camp.expiryDate.substring(0, 10) : "No Expiry"}</span>
                              </div>
                            </td>
                            
                            {/* iOS Style Toggle Switch (Step A.4-A) */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleToggleStatus(camp._id)}
                                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                  style={{ backgroundColor: camp.isActive ? "#08B36A" : "#CBD5E1" }}
                                >
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${camp.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                                </button>
                                <span className="text-[10px] font-extrabold text-slate-400 min-w-[45px] text-left">
                                  {camp.isActive ? "Active" : "Paused"}
                                </span>
                              </div>
                            </td>

                            {/* Actions Control Column */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                {/* Edit Button */}
                                <button 
                                  onClick={() => handleEditInit(camp)} 
                                  title="Edit Campaign"
                                  className={`p-2 rounded-xl transition ${
                                    isCurrentlyEditing 
                                      ? "bg-[#08B36A] text-white" 
                                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>

                                {/* Delete Button */}
                                <button 
                                  onClick={() => handleDeleteCampaign(camp._id)} 
                                  title="Delete Campaign"
                                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50/50 transition"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
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