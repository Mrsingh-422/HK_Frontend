'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaStethoscope, FaPlus, FaEdit, FaTimes, FaSpinner, 
  FaRupeeSign, FaFileImage, FaHeading, FaAlignLeft
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
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-[#08B36A] via-emerald-500 to-teal-700 relative flex items-center px-8">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10 flex w-full justify-between items-center text-white pt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <FaStethoscope size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Hospital Services</h1>
                  <p className="text-sm text-green-50 opacity-90 font-medium">Manage and list medical services</p>
                </div>
              </div>
              
              <button 
                onClick={openAddModal}
                className="hidden sm:flex bg-white text-[#08B36A] px-6 py-2.5 rounded-2xl font-bold hover:bg-gray-50 hover:shadow-lg transition-all items-center gap-2"
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

        {/* --- SERVICES GRID --- */}
        {services.length === 0 ? (
           <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-[#08B36A] mb-4 opacity-50">
                <FaStethoscope size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Services Added</h3>
              <p className="text-gray-500 max-w-md mx-auto">You haven't listed any hospital services yet. Add services like X-Ray, Blood Test, etc. to display them.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => {
              const imgUrl = service.image ? `${backendUrl}${service.image}` : null;
              return (
                <div key={service._id} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
                  
                  {/* Image Header */}
                  <div className="h-40 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                    {imgUrl ? (
                      <img src={imgUrl} alt={service.serviceName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <FaStethoscope className="text-gray-300 text-4xl opacity-50" />
                    )}
                    
                    {/* Price Tag Overlay */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-[#08B36A] font-black text-sm flex items-center gap-1 border border-white">
                      <FaRupeeSign size={12} /> {service.price}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-gray-800 mb-2 truncate" title={service.serviceName}>
                      {service.serviceName}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-1">
                      {service.description || "No description provided."}
                    </p>
                    
                    <button 
                      onClick={() => openEditModal(service)}
                      className="mt-4 w-full py-2.5 rounded-xl font-bold text-[#08B36A] bg-green-50 hover:bg-[#08B36A] hover:text-white border border-green-100 transition-all flex items-center justify-center gap-2"
                    >
                      <FaEdit /> Edit Service
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- ADD / EDIT SERVICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                {editId ? <FaEdit className="text-[#08B36A]"/> : <FaPlus className="text-[#08B36A]"/>} 
                {editId ? 'Update Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors border border-gray-100">
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-36 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="relative z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                        <FaEdit /> Change Image
                      </div>
                    </>
                  ) : (
                    <>
                      <FaFileImage className="text-gray-400 text-3xl mb-2" />
                      <span className="text-sm font-bold text-gray-600">Click to upload image</span>
                      <span className="text-xs text-gray-400 mt-1">(JPEG, PNG, JPG)</span>
                    </>
                  )}
                  <input 
                    type="file" accept="image/*" name="image" onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaHeading className="text-gray-400" /></div>
                  <input 
                    type="text" name="serviceName" required 
                    value={formData.serviceName} onChange={handleTextChange} 
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-gray-800" 
                    placeholder="e.g. Full Body MRI"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaRupeeSign className="text-gray-400" /></div>
                  <input 
                    type="number" name="price" required min="0"
                    value={formData.price} onChange={handleTextChange} 
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" 
                    placeholder="1500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <div className="relative">
                  <div className="absolute top-4 left-4 flex items-start pointer-events-none"><FaAlignLeft className="text-gray-400" /></div>
                  <textarea 
                    name="description" rows="3"
                    value={formData.description} onChange={handleTextChange} 
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 resize-none" 
                    placeholder="Write a short description about this service..."
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-2 border-t border-gray-100">
                <button 
                  type="submit" disabled={isSubmitting} 
                  className="w-full py-4 rounded-2xl font-bold text-white bg-[#08B36A] hover:bg-emerald-600 transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><FaSpinner className="animate-spin" /> Saving...</>
                  ) : (
                    <>{editId ? 'Update Service' : 'Save Service'}</>
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