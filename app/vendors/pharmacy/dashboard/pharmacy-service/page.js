'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FaPlus, FaCapsules, FaSearch, FaSpinner, FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaEye, FaUndo, FaExchangeAlt } from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import AddInventoryModal from './components/AddInventoryModal';
import MedicineViewModal from './components/MedicineViewModal';

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
      alt="Medicine" 
    />
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [masterList, setMasterList] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetching(true);
    try {
      const [invRes, masterRes] = await Promise.all([
        PharmacyVendorAPI.getMyInventory(),
        PharmacyVendorAPI.searchMasterMedicines('') 
      ]);
      setInventory(invRes?.data || []);
      const masterData = masterRes?.data?.docs || masterRes?.data?.medicines || masterRes?.data || [];
      setMasterList(Array.isArray(masterData) ? masterData : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setFetching(false);
    }
  };

  const filteredInventory = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter(item => 
      item.medicineId?.name?.toLowerCase().includes(q) ||
      item.medicineId?.manufacturers?.toLowerCase().includes(q) ||
      item.batch_number?.toLowerCase().includes(q)
    );
  }, [inventory, searchTerm]);

  // Synchronized with the documentation
  const handleSave = async (payload) => {
    setLoading(true);
    try {
      let res;
      if (selectedItem?._id) {
        const updatePayload = {
          vendor_price: Number(payload.vendor_price),
          mrp: Number(payload.mrp),
          stock_quantity: Number(payload.stock_quantity),
          batch_number: payload.batch_number?.trim(),
          expiry_date: payload.expiry_date,
          isReturnAllowed: payload.isReturnAllowed !== undefined ? Boolean(payload.isReturnAllowed) : true,
          isReplacementAllowed: payload.isReplacementAllowed !== undefined ? Boolean(payload.isReplacementAllowed) : true,
          ...(payload.manufacturing_date && { manufacturing_date: payload.manufacturing_date }),
          ...(payload.hsn_number && { hsn_number: payload.hsn_number })
        };
        res = await PharmacyVendorAPI.updateInventory(selectedItem._id, updatePayload);
      } else {
        res = await PharmacyVendorAPI.addToInventory(payload);
      }

      if (res?.success || res) {
        setIsModalOpen(false);
        setSelectedItem(null);
        await fetchInitialData(); 
        alert(res?.message || "Medicine inventory and return/replacement settings updated successfully.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inventoryId) => {
    if (!inventoryId) return;
    
    const confirmDelete = window.confirm("Are you sure you want to remove this medicine batch from your store's stock list?");
    if (!confirmDelete) return;

    try {
      const res = await PharmacyVendorAPI.deleteInventory(inventoryId);
      if (res?.success || res) {
        setInventory(prev => prev.filter(item => item._id !== inventoryId));
        alert("Item batch successfully removed from your store.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      if (err.response?.status === 404) {
        alert("API Error: The server could not find the delete route.");
      } else {
        alert(err.response?.data?.message || "Could not delete. Item might be linked to active orders.");
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-6 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#08B36A] text-white rounded-2xl shadow-lg shadow-[#08B36A]/20">
              <FaCapsules size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Pharmacy Stock</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Inventory & Stock Control</p>
            </div>
          </div>
          <button 
            onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} 
            className="w-full md:w-auto px-7 py-3.5 bg-[#08B36A] hover:bg-[#069959] text-white font-bold rounded-2xl shadow-lg shadow-[#08B36A]/25 flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider transition-all duration-200 active:scale-95"
          >
            <FaPlus size={12} /> Add / Suggest Medicine
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Search & Active Batches Counter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input 
              type="text" 
              placeholder="Search store inventory or batch no..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/20 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-[11px] font-black uppercase text-[#08B36A]">
            <div className="px-4 py-1.5 bg-white rounded-xl shadow-xs">
              My Active Batches: <span className="font-bold text-slate-800 ml-1">{inventory.length}</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden min-h-[480px]">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-32">
              <FaSpinner className="animate-spin text-[#08B36A] mb-4" size={38} />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading Store Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4.5">Item Description</th>
                    <th className="px-6 py-4.5">Batch & Expiry</th>
                    <th className="px-6 py-4.5">Price (Vendor / MRP)</th>
                    <th className="px-6 py-4.5">Stock Level</th>
                    <th className="px-6 py-4.5">Policy Settings</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Item Description */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-11 w-11 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/60 shrink-0">
                            <MedicineImage src={resolveImageUrl(item.medicineId?.image_url)} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.medicineId?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{item.medicineId?.manufacturers}</p>
                          </div>
                        </div>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-lg uppercase tracking-wider w-fit border border-slate-200 text-[10px]">
                            {item.batch_number || 'GENERIC'}
                          </span>
                          {item.hsn_number && (
                            <span className="text-slate-400 text-[10px] font-semibold">
                              HSN: <span className="font-mono text-slate-700 font-bold">{item.hsn_number}</span>
                            </span>
                          )}
                          <span className="text-slate-500 font-medium text-[10px]">
                            Exp: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-[#08B36A]">₹{item.vendor_price}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            Batch MRP: ₹{item.mrp ?? item.medicineId?.mrp ?? 'N/A'}
                          </span>
                          {(item.medicineId?.masterMrp || item.medicineId?.mrp) && (
                            <span className="text-[9px] text-slate-400 font-medium uppercase">
                              Ceiling: ₹{item.medicineId.masterMrp || item.medicineId.mrp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${item.stock_quantity < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {item.stock_quantity}
                          </span>
                          {item.stock_quantity < 10 && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-extrabold uppercase rounded-full border border-rose-100">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Policy Badges: Return / Replacement */}
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold w-fit ${item.isReturnAllowed ? 'bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                            <FaUndo size={9} /> {item.isReturnAllowed ? 'Returnable' : 'No Return'}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold w-fit ${item.isReplacementAllowed ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                            <FaExchangeAlt size={9} /> {item.isReplacementAllowed ? 'Replaceable' : 'No Replace'}
                          </span>
                        </div>
                      </td>

                      {/* Live Status */}
                      <td className="px-6 py-4.5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.is_available ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-slate-100 text-slate-400'}`}>
                          {item.is_available ? <><FaCheckCircle size={10} /> Live</> : <><FaTimesCircle size={10} /> Hidden</>}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => { setSelectedItem(item); setIsViewOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-xl transition-all"
                            title="View Details"
                          >
                            <FaEye size={15}/>
                          </button>
                          <button 
                            onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Inventory"
                          >
                            <FaEdit size={15}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)} 
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete Batch"
                          >
                            <FaTrash size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddInventoryModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
        onSave={handleSave}
        loading={loading}
        initialData={selectedItem}
        masterList={masterList}
      />

      <MedicineViewModal 
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedItem(null); }}
        data={selectedItem}
      />
    </div>
  )
}