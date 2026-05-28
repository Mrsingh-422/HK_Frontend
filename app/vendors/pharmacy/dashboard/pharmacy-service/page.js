'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { FaPlus, FaCapsules, FaSearch, FaSpinner, FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaEye } from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import AddInventoryModal from './components/AddInventoryModal';
import MedicineViewModal from './components/MedicineViewModal';

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
      setInventory(invRes.data || []);
      setMasterList(masterRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setFetching(false);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.medicineId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicineId?.manufacturers?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const handleSave = async (payload) => {
    setLoading(true);
    try {
      let res;
      if (selectedItem?._id) {
          res = await PharmacyVendorAPI.updateInventory(selectedItem._id, payload);
      } else {
          res = await PharmacyVendorAPI.addToInventory(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        setSelectedItem(null);
        fetchInitialData(); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * PROPER DELETE FUNCTION
   * Deletes the item from your specific inventory list.
   */
  const handleDelete = async (inventoryId) => {
      if (!inventoryId) return;
      
      const confirmDelete = window.confirm("Are you sure you want to remove this medicine from your store's stock list?");
      if (!confirmDelete) return;

      try {
          // Sending the item's _id from your JSON (e.g., 69e39e87...)
          const res = await PharmacyVendorAPI.deleteInventory(inventoryId);
          
          if (res.success || res) {
              // Filter the local state using the same ID
              setInventory(prev => prev.filter(item => item._id !== inventoryId));
              alert("Item successfully removed from your store.");
          }
      } catch (err) {
          console.error("Delete Error:", err);
          if (err.response?.status === 404) {
              alert("API Error: The server could not find the delete route. Check if the backend uses /delete/:id or /remove/:id.");
          } else {
              alert(err.response?.data?.message || "Could not delete. Item might be linked to active orders.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      {/* Header */}
      <div className="bg-white border-b border-emerald-50 py-6 px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100">
                <FaCapsules size={28} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Pharmacy Stock</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Inventory & Stock Control</p>
            </div>
          </div>
          <button 
            onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} 
            className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 text-xs uppercase hover:bg-emerald-600 transition-all active:scale-95"
          >
             <FaPlus /> Add / Suggest Medicine
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                    type="text" 
                    placeholder="Search your store inventory..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 ring-emerald-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border text-[10px] font-black uppercase text-emerald-600">
                <div className="px-4 py-2 bg-white rounded-xl shadow-sm">My Active Stock: {inventory.length}</div>
            </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-32">
                <FaSpinner className="animate-spin text-emerald-600 mb-4" size={40} />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading Store Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b bg-slate-50/50">
                    <th className="px-8 py-6">Item Description</th>
                    <th className="px-8 py-6">Price Point</th>
                    <th className="px-8 py-6">Stock Level</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 overflow-hidden border">
                                {item.medicineId?.image_url?.[0] ? 
                                    <img src={item.medicineId.image_url[0]} className="w-full h-full object-cover" alt="med" /> : 
                                    'MED'
                                }
                            </div>
                            <div>
                                <p className="font-black text-slate-700 text-sm">{item.medicineId?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.medicineId?.manufacturers}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-emerald-600">₹{item.vendor_price}</span>
                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">MRP ₹{item.medicineId?.mrp}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${item.stock_quantity < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                                {item.stock_quantity}
                            </span>
                            {item.stock_quantity < 10 && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded-full animate-pulse">
                                    Low Stock
                                </span>
                            )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {item.is_available ? <><FaCheckCircle /> Live</> : <><FaTimesCircle /> Hidden</>}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setSelectedItem(item); setIsViewOpen(true); }} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                <FaEye size={16}/>
                            </button>
                            <button onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <FaEdit size={16}/>
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                <FaTrash size={16}/>
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