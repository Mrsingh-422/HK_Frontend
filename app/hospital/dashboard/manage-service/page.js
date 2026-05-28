'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaStethoscope, FaPlus, FaEdit, FaTimes, FaSpinner, 
  FaRupeeSign, FaFileImage, FaHeading, FaAlignLeft, FaTrashAlt
} from "react-icons/fa"
import HospitalAPI from '@/app/services/HospitalAPI';

export default function HospitalServicesPage() {
  const { loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null); // Null means Add, String means Update

  // Form State
  const [formData, setFormData] = useState({
    serviceName: '',
    price: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";

  const fetchServices = async () => {
    setIsFetching(true);
    try {
      const response = await HospitalAPI.getServicesList();
      if (response?.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching services", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle Text Inputs
  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image File Input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Local preview
    }
  };

  // Open Modal for ADD
  const openAddModal = () => {
    setEditId(null);
    setFormData({ serviceName: '', price: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  // Open Modal for EDIT
  const openEditModal = (service) => {
    setEditId(service._id);
    setFormData({
      serviceName: service.serviceName || '',
      price: service.price || '',
      description: service.description || ''
    });
    setImageFile(null);
    setImagePreview(service.image ? `${backendUrl}${service.image}` : null);
    setIsModalOpen(true);
  };

  // Submit Handler (ADD & UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append('serviceName', formData.serviceName);
    dataToSend.append('price', Number(formData.price));
    dataToSend.append('description', formData.description);
    if (imageFile) {
      dataToSend.append('image', imageFile);
    }

    try {
      let res;
      if (editId) {
        // Update API
        res = await HospitalAPI.updateService(editId, dataToSend);
      } else {
        // Add API
        res = await HospitalAPI.addService(dataToSend);
      }

      if (res?.success) {
        setIsModalOpen(false);
        fetchServices();
      } else {
        alert(res?.message || "Operation failed.");
      }
    } catch (error) {
      console.error("Error saving service", error);
      alert("An error occurred while saving the service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; }
  }, [isModalOpen]);

  if (authLoading || isFetching) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A]"></div>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="h-28 bg-gradient-to-r from-[#08B36A] via-emerald-500 to-[#069e5d] relative flex items-center px-8">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10 flex w-full justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <FaStethoscope size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Hospital Services</h1>
                  <p className="text-xs text-green-50 opacity-90 font-medium uppercase tracking-wider">Inventory Management</p>
                </div>
              </div>
              
              <button 
                onClick={openAddModal}
                className="hidden sm:flex bg-white text-[#08B36A] px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 hover:shadow-lg transition-all items-center gap-2"
              >
                <FaPlus /> Add New Service
              </button>
            </div>
          </div>
        </div>

        {/* Mobile button */}
        <div className="sm:hidden flex justify-end px-2">
           <button 
              onClick={openAddModal}
              className="bg-[#08B36A] text-white px-6 py-3 rounded-2xl font-bold shadow-md w-full flex items-center justify-center gap-2"
            >
              <FaPlus /> Add New Service
            </button>
        </div>

        {/* --- SERVICES TABLE --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {services.length === 0 ? (
             <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-[#08B36A] mb-4 opacity-50">
                  <FaStethoscope size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Services Added</h3>
                <p className="text-gray-500 max-w-md mx-auto">You haven't listed any hospital services yet.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">Service Details</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">Description</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {services.map((service) => {
                    const imgUrl = service.image ? `${backendUrl}${service.image}` : null;
                    return (
                      <tr key={service._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                              {imgUrl ? (
                                <img src={imgUrl} alt={service.serviceName} className="w-full h-full object-cover" />
                              ) : (
                                <FaStethoscope className="text-gray-300 text-xl" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{service.serviceName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 md:hidden">
                                {service.description?.substring(0, 30)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm text-gray-500 line-clamp-2 max-w-md leading-relaxed">
                            {service.description || "No description provided."}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-[#08B36A] font-black text-sm rounded-lg border border-green-100">
                            <FaRupeeSign size={10} /> {service.price}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openEditModal(service)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-xs hover:bg-[#08B36A] hover:text-white hover:border-[#08B36A] transition-all shadow-sm"
                          >
                            <FaEdit /> Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT SERVICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 scrollbar-hide">
            
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 text-[#08B36A] rounded-xl">
                  {editId ? <FaEdit size={20}/> : <FaPlus size={20}/>}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800">
                    {editId ? 'Update Service' : 'Add New Service'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Service Catalog</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors border border-gray-100">
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Service Image</label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-2xl h-40 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-green-50/30 hover:border-[#08B36A]/30 transition-all overflow-hidden group cursor-pointer">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white px-4 py-2 rounded-xl text-xs font-black text-gray-800 flex items-center gap-2 shadow-sm">
                          <FaFileImage /> Change Image
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                        <FaFileImage className="text-gray-300 text-2xl" />
                      </div>
                      <span className="text-xs font-bold text-gray-500">Drop your image here or click to browse</span>
                      <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Recommended: 800x600 px</span>
                    </>
                  )}
                  <input 
                    type="file" accept="image/*" name="image" onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Service Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaHeading size={14} /></div>
                    <input 
                      type="text" name="serviceName" required 
                      value={formData.serviceName} onChange={handleTextChange} 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-gray-800 text-sm outline-none" 
                      placeholder="e.g. Cardiology Consultation"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Price (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaRupeeSign size={14} /></div>
                    <input 
                      type="number" name="price" required min="0"
                      value={formData.price} onChange={handleTextChange} 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-gray-800 text-sm outline-none" 
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Description</label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 flex items-start pointer-events-none text-gray-400"><FaAlignLeft size={14} /></div>
                    <textarea 
                      name="description" rows="4"
                      value={formData.description} onChange={handleTextChange} 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-gray-800 text-sm outline-none resize-none" 
                      placeholder="Describe what this service includes..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <button 
                  type="submit" disabled={isSubmitting} 
                  className="w-full py-4 rounded-2xl font-black text-sm text-white bg-[#08B36A] hover:bg-[#069e5d] transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <><FaSpinner className="animate-spin" /> Processing...</>
                  ) : (
                    <>{editId ? 'Update Service Details' : 'Confirm & Save Service'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}