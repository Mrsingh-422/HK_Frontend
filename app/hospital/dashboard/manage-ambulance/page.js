"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageAmbulance = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [ambulances, setAmbulances] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  // ---------------------------------------------------------
  // Form State (Mapped strictly to API spec parameters)
  // ---------------------------------------------------------
  const initialFormState = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    department: 'Emergency Logistics',
    dob: '',
    ambulanceNumber: '',
    vehicleType: 'Advance Life Support',
    defaultService: 'Emergency Rescue Support',
    fixedPrice: '',
    distance: '',
    perKMPrice: '',
    hasNurse: false,
    nursePrice: '',
    hasDoctor: false,
    doctorPrice: '',
    accidentalService: false,
    emergencyService: false,
    referralService: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [optionalServices, setOptionalServices] = useState([{ name: '', price: '' }]);
  const [files, setFiles] = useState({ 
    drivingLicenseFile: null, 
    rcFile: null, 
    insuranceFile: null, 
    fitnessCertificate: null, 
    ambulancePermit: null 
  });
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    setFetchLoading(true);
    try {
      const response = await HospitalAPI.getMyAmbulances();
      if (response.success) setAmbulances(response.data || []);
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleToggleMaintenance = async (e, ambId, currentStatus) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Maintenance' ? 'Available' : 'Maintenance';
    if (!confirm(`Switch ambulance to ${newStatus}?`)) return;

    try {
      const response = await HospitalAPI.updateAmbulance(ambId, { status: newStatus });
      if (response.success) {
        alert("Status updated successfully");
        fetchAmbulances();
      }
    } catch (error) {
      alert("Failed to toggle status");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'number') {
      const val = value < 0 ? '0' : value;
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fileKey]: file }));
      setPreviews((prev) => ({ ...prev, [fileKey]: URL.createObjectURL(file) }));
    }
  };

  // Optional Services Handlers
  const handleAddOptionalService = () => {
    setOptionalServices([...optionalServices, { name: '', price: '' }]);
  };

  const handleRemoveOptionalService = (index) => {
    setOptionalServices(optionalServices.filter((_, i) => i !== index));
  };

  const handleOptionalServiceChange = (index, field, value) => {
    const updated = [...optionalServices];
    updated[index][field] = field === 'price' && value < 0 ? '0' : value;
    setOptionalServices(updated);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setOptionalServices([{ name: '', price: '' }]);
    setFiles({ drivingLicenseFile: null, rcFile: null, insuranceFile: null, fitnessCertificate: null, ambulancePermit: null });
    setPreviews({});
    setIsEditing(false);
    setEditId(null);
  };

  // Submit Handler constructing multipart/form-data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    
    // Core Driver & Vehicle Fields
    submitData.append('fullName', formData.fullName);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    if (!isEditing && formData.password) {
      submitData.append('password', formData.password);
    }
    submitData.append('address', formData.address);
    submitData.append('department', formData.department);
    submitData.append('dob', formData.dob);

    // Vehicle Specifications
    submitData.append('ambulanceNumber', formData.ambulanceNumber);
    submitData.append('vehicleType', formData.vehicleType);
    submitData.append('defaultService', formData.defaultService);

    // Fare & Pricing
    submitData.append('fixedPrice', formData.fixedPrice || '0');
    submitData.append('distance', formData.distance || '0');
    submitData.append('perKMPrice', formData.perKMPrice || '0');

    // Support Medical Staff Config
    submitData.append('hasNurse', formData.hasNurse ? 'true' : 'false');
    submitData.append('nursePrice', formData.hasNurse ? (formData.nursePrice || '0') : '0');
    submitData.append('hasDoctor', formData.hasDoctor ? 'true' : 'false');
    submitData.append('doctorPrice', formData.hasDoctor ? (formData.doctorPrice || '0') : '0');

    // Free Services Config
    submitData.append('accidentalService', formData.accidentalService ? 'true' : 'false');
    submitData.append('emergencyService', formData.emergencyService ? 'true' : 'false');
    submitData.append('referralService', formData.referralService ? 'true' : 'false');

    // Optional Extra Services Array (Serialized JSON)
    const validOptional = optionalServices.filter(s => s.name.trim() !== '');
    submitData.append('optionalService', JSON.stringify(validOptional));

    // File Attachments
    if (files.drivingLicenseFile) submitData.append('drivingLicenseFile', files.drivingLicenseFile);
    if (files.rcFile) submitData.append('rcFile', files.rcFile);
    if (files.insuranceFile) submitData.append('insuranceFile', files.insuranceFile);
    if (files.fitnessCertificate) submitData.append('fitnessCertificate', files.fitnessCertificate);
    if (files.ambulancePermit) submitData.append('ambulancePermit', files.ambulancePermit);

    try {
      let res = isEditing 
        ? await HospitalAPI.updateAmbulance(editId, submitData) 
        : await HospitalAPI.addAmbulance(submitData);
        
      if (res.success) {
        alert(isEditing ? "Ambulance updated successfully!" : "Ambulance registered successfully!");
        setShowForm(false);
        resetForm();
        fetchAmbulances();
      } else {
        alert(res.message || "Failed to save ambulance record");
      }
    } catch (err) {
      console.error("Error saving ambulance:", err);
      alert(err.response?.data?.message || "Error occurred while saving ambulance");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, amb) => {
    e.stopPropagation();
    setFormData({ 
      fullName: amb.driverInfo?.fullName || amb.name || '', 
      email: amb.email || '',
      phone: amb.phone || '',
      password: '',
      address: amb.address || '',
      department: amb.driverInfo?.department || 'Emergency Logistics',
      dob: amb.driverInfo?.dob ? amb.driverInfo.dob.split('T')[0] : '',
      ambulanceNumber: amb.vehicleNumber || '',
      vehicleType: amb.vehicleType || 'Advance Life Support',
      defaultService: amb.defaultService || 'Emergency Rescue Support',
      fixedPrice: amb.pricing?.fixedPrice ?? '',
      distance: amb.pricing?.baseDistance ?? '',
      perKMPrice: amb.pricing?.pricePerKM ?? '',
      hasNurse: Boolean(amb.supportStaff?.nurse?.available),
      nursePrice: amb.supportStaff?.nurse?.price ?? '',
      hasDoctor: Boolean(amb.supportStaff?.doctor?.available),
      doctorPrice: amb.supportStaff?.doctor?.price ?? '',
      accidentalService: Boolean(amb.freeServices?.accidental),
      emergencyService: Boolean(amb.freeServices?.emergency),
      referralService: Boolean(amb.freeServices?.referral),
    });

    if (amb.optionalServices && Array.isArray(amb.optionalServices) && amb.optionalServices.length > 0) {
      setOptionalServices(amb.optionalServices.map(s => ({ name: s.name || '', price: s.price || '' })));
    } else {
      setOptionalServices([{ name: '', price: '' }]);
    }

    setEditId(amb._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this ambulance vehicle?')) return;
    await HospitalAPI.deleteAmbulance(id);
    fetchAmbulances();
  };

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Ambulance Fleet Management</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Monitor live status, emergency availability, rates, and fleet compliance.</p>
        </div>
        <button 
          onClick={() => { if (showForm) resetForm(); setShowForm(!showForm); }}
          className={`mt-4 md:mt-0 px-8 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 ${
            showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-[#08B36A] hover:bg-[#08B36A]/90 text-lg'
          }`}
        >
          {showForm ? '✖ Cancel' : '➕ Register New Ambulance'}
        </button>
      </div>

      {showForm ? (
        /* COMPREHENSIVE ADD / EDIT FORM VIEW */
        <div className="bg-white p-8 shadow-2xl rounded-3xl border border-gray-100">
             <h3 className="text-2xl font-black mb-8 border-b pb-4 text-gray-800 flex items-center justify-between">
                <span>{isEditing ? 'Edit Ambulance Profile' : 'Register Hospital Ambulance'}</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Multipart Registration Console</span>
             </h3>

             <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECTION 1: DRIVER & LOGIN DETAILS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest border-b pb-2">1. Driver & Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Driver Full Name *" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="e.g. Lakshay Ravat" />
                      <InputGroup label="Driver Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="lakshay.driver@gmail.com" />
                      <InputGroup label="Driver Phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+919876543210" />
                      {!isEditing && (
                        <InputGroup label="Driver Password *" name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" />
                      )}
                      <InputGroup label="Medical Department" name="department" value={formData.department} onChange={handleInputChange} placeholder="Emergency Logistics" />
                      <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                      <div className="md:col-span-3">
                        <InputGroup label="Driver Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Mohali, Punjab" />
                      </div>
                  </div>
                </div>

                {/* SECTION 2: VEHICLE SPECIFICATIONS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest border-b pb-2">2. Vehicle Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Vehicle Plate Number (RC)" name="ambulanceNumber" value={formData.ambulanceNumber} onChange={handleInputChange} placeholder="PB-65-XX-1234" />
                      <div className="space-y-1.5">
                          <label className="text-xs text-gray-700 font-bold uppercase">Vehicle Type</label>
                          <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#08B36A] bg-white outline-none font-medium">
                              <option value="Van">Van</option>
                              <option value="Mini Van">Mini Van</option>
                              <option value="Advance Life Support">Advance Life Support</option>
                              <option value="ICU Ambulance">ICU Ambulance</option>
                          </select>
                      </div>
                      <InputGroup label="Default Service Name" name="defaultService" value={formData.defaultService} onChange={handleInputChange} placeholder="Emergency Rescue Support" />
                  </div>
                </div>

                {/* SECTION 3: FARE & DISTANCE PRICING */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest border-b pb-2">3. Distance & Fare Pricing Structure</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Fixed Base Price (₹)" name="fixedPrice" type="number" min="0" value={formData.fixedPrice} onChange={handleInputChange} placeholder="1500" />
                      <InputGroup label="Base Distance (KM)" name="distance" type="number" min="0" value={formData.distance} onChange={handleInputChange} placeholder="5" />
                      <InputGroup label="Per KM Price (₹)" name="perKMPrice" type="number" min="0" value={formData.perKMPrice} onChange={handleInputChange} placeholder="15" />
                  </div>
                </div>

                {/* SECTION 4: MEDICAL SUPPORT STAFF RATES */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest border-b pb-2">4. Medical Support Staff Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                      
                      {/* Nurse Config */}
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="hasNurse" checked={formData.hasNurse} onChange={handleInputChange} className="w-4 h-4 accent-[#08B36A]" />
                          <span className="text-xs font-black text-gray-800 uppercase">Support Nurse Available</span>
                        </label>
                        {formData.hasNurse && (
                          <InputGroup label="Nurse Fee (₹)" name="nursePrice" type="number" min="0" value={formData.nursePrice} onChange={handleInputChange} placeholder="300" />
                        )}
                      </div>

                      {/* Doctor Config */}
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="hasDoctor" checked={formData.hasDoctor} onChange={handleInputChange} className="w-4 h-4 accent-[#08B36A]" />
                          <span className="text-xs font-black text-gray-800 uppercase">Support Doctor Available</span>
                        </label>
                        {formData.hasDoctor && (
                          <InputGroup label="Doctor Fee (₹)" name="doctorPrice" type="number" min="0" value={formData.doctorPrice} onChange={handleInputChange} placeholder="1000" />
                        )}
                      </div>

                  </div>
                </div>

                {/* SECTION 5: COMPLIMENTARY FREE SERVICES */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest border-b pb-2">5. Complimentary Free Service Offerings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                      <label className="flex items-center gap-2 bg-white p-3.5 rounded-xl border border-gray-100 cursor-pointer">
                        <input type="checkbox" name="accidentalService" checked={formData.accidentalService} onChange={handleInputChange} className="w-4 h-4 accent-[#08B36A]" />
                        <span className="text-xs font-bold text-gray-800 uppercase">Free Accidental Runs</span>
                      </label>
                      <label className="flex items-center gap-2 bg-white p-3.5 rounded-xl border border-gray-100 cursor-pointer">
                        <input type="checkbox" name="emergencyService" checked={formData.emergencyService} onChange={handleInputChange} className="w-4 h-4 accent-[#08B36A]" />
                        <span className="text-xs font-bold text-gray-800 uppercase">Free General Emergency</span>
                      </label>
                      <label className="flex items-center gap-2 bg-white p-3.5 rounded-xl border border-gray-100 cursor-pointer">
                        <input type="checkbox" name="referralService" checked={formData.referralService} onChange={handleInputChange} className="w-4 h-4 accent-[#08B36A]" />
                        <span className="text-xs font-bold text-gray-800 uppercase">Free Referral Transfers</span>
                      </label>
                  </div>
                </div>

                {/* SECTION 6: OPTIONAL EXTRA SUPPORT SERVICES */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest">6. Extra Optional Services</h4>
                    <button type="button" onClick={handleAddOptionalService} className="text-xs font-bold text-[#08B36A] hover:underline">
                      + Add Extra Service
                    </button>
                  </div>
                  <div className="space-y-3">
                    {optionalServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <input 
                          type="text" 
                          placeholder="Service Name (e.g. Oxygen Tank)" 
                          className="flex-1 p-2.5 text-xs font-bold border border-gray-200 rounded-lg outline-none focus:border-[#08B36A]"
                          value={service.name} 
                          onChange={(e) => handleOptionalServiceChange(index, 'name', e.target.value)} 
                        />
                        <input 
                          type="number" 
                          min="0"
                          placeholder="Price (₹)" 
                          className="w-32 p-2.5 text-xs font-bold border border-gray-200 rounded-lg outline-none focus:border-[#08B36A]"
                          value={service.price} 
                          onChange={(e) => handleOptionalServiceChange(index, 'price', e.target.value)} 
                        />
                        {optionalServices.length > 1 && (
                          <button type="button" onClick={() => handleRemoveOptionalService(index)} className="text-red-500 font-bold text-xs p-2 hover:bg-red-50 rounded-lg">
                            ✖
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 7: DOCUMENT ATTACHMENTS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest border-b pb-2">7. Verification Document Attachments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                      <FileInputGroup label="Driving License" fileKey="drivingLicenseFile" onChange={handleFileChange} fileName={files.drivingLicenseFile?.name} preview={previews.drivingLicenseFile} />
                      <FileInputGroup label="RC Certificate" fileKey="rcFile" onChange={handleFileChange} fileName={files.rcFile?.name} preview={previews.rcFile} />
                      <FileInputGroup label="Insurance Policy" fileKey="insuranceFile" onChange={handleFileChange} fileName={files.insuranceFile?.name} preview={previews.insuranceFile} />
                      <FileInputGroup label="Fitness Clearance" fileKey="fitnessCertificate" onChange={handleFileChange} fileName={files.fitnessCertificate?.name} preview={previews.fitnessCertificate} />
                      <FileInputGroup label="Ambulance Permit" fileKey="ambulancePermit" onChange={handleFileChange} fileName={files.ambulancePermit?.name} preview={previews.ambulancePermit} />
                  </div>
                </div>

                {/* SUBMIT BUTTONS */}
                <div className="flex gap-4 pt-4 border-t">
                  <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="px-8 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-10 py-3.5 bg-[#08B36A] hover:bg-[#079f5c] text-white font-black rounded-xl uppercase text-xs shadow-lg shadow-green-100 flex items-center gap-2">
                    {loading ? <SpinnerIcon className="w-4 h-4 animate-spin text-white" /> : (isEditing ? "Update Ambulance Profile" : "Confirm Registration")}
                  </button>
                </div>

             </form>
        </div>
      ) : (
        /* FLEET TABLE LIST VIEW */
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ambulance Name / Code</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Vehicle Number</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Online / Emergency</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Radius & Fare</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchLoading ? (
                  <tr><td colSpan="7" className="py-20 text-center"><SpinnerIcon className="w-10 h-10 text-[#08B36A] mx-auto animate-spin" /></td></tr>
                ) : ambulances.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center font-bold text-gray-400">
                      No ambulance units registered in your fleet database.
                    </td>
                  </tr>
                ) : ambulances.map((amb) => (
                  <tr 
                    key={amb._id} 
                    onClick={() => setSelectedAmbulance(amb)}
                    className="hover:bg-[#08B36A]/5 cursor-pointer transition-colors group"
                  >
                    {/* Name & ID */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-sm group-hover:text-[#08B36A] transition-colors">
                          {amb.name || 'N/A'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                          ID: #{amb._id?.slice(-8)}
                        </span>
                      </div>
                    </td>

                    {/* Vehicle Number */}
                    <td className="px-6 py-5">
                      <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 text-xs uppercase tracking-wider">
                        {amb.vehicleNumber || 'N/A'}
                      </span>
                    </td>

                    {/* Contact Phone */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">
                          {amb.phone || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Vehicle Type */}
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider bg-[#08B36A]/10 px-2.5 py-1 rounded-md border border-[#08B36A]/20">
                        {amb.vehicleType || 'Mini Van'}
                      </span>
                    </td>

                    {/* Online / Emergency Flags */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full w-fit ${
                          amb.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${amb.isOnline ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
                          {amb.isOnline ? 'Online' : 'Offline'}
                        </span>
                        {amb.availableForEmergency && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider w-fit">
                            🚨 Emergency Ready
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Service Radius & Pricing */}
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-xs text-gray-800 font-bold">
                            Radius: {amb.serviceRadius || 'Default'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold">
                            Fixed: ₹{amb.pricing?.fixedPrice ?? 0} • Per KM: ₹{amb.pricing?.pricePerKM ?? 0}
                          </span>
                       </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={(e) => handleToggleMaintenance(e, amb._id, amb.status)}
                          title="Toggle Status"
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg border border-transparent hover:border-amber-100 transition-all"
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(e, amb)}
                          title="Edit Profile"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, amb._id)}
                          title="Delete Unit"
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL DIAGNOSTICS & DETAILS MODAL */}
      {selectedAmbulance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative scrollbar-hide border border-gray-100">
            
            {/* Modal Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
               <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-gray-900">{selectedAmbulance.name}</h2>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      selectedAmbulance.profileStatus === 'Approved' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {selectedAmbulance.profileStatus || 'Pending'}
                    </span>
                  </div>
                  <p className="text-[#08B36A] font-bold text-xs uppercase tracking-[0.2em] mt-1">
                    Vehicle Number: {selectedAmbulance.vehicleNumber || 'N/A'} • Role: {selectedAmbulance.role || 'Ambulance Unit'}
                  </p>
               </div>
               <button 
                 onClick={() => setSelectedAmbulance(null)} 
                 className="text-gray-400 hover:text-red-500 bg-gray-50 w-10 h-10 flex items-center justify-center rounded-full transition-all border border-gray-200"
               >
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-8 space-y-8">

               {/* Quick Metrics Header Cards */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Online Duty Status</p>
                    <p className={`text-base font-black ${selectedAmbulance.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                      {selectedAmbulance.isOnline ? '● Online (Active)' : '○ Offline'}
                    </p>
                  </div>
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Vehicle Type</p>
                    <p className="text-base font-black text-gray-800 uppercase">{selectedAmbulance.vehicleType || 'Mini Van'}</p>
                  </div>
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Service Radius</p>
                    <p className="text-base font-black text-gray-800">{selectedAmbulance.serviceRadius || '25 km'}</p>
                  </div>
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Emergency Service</p>
                    <p className="text-base font-black text-gray-800">
                      {selectedAmbulance.availableForEmergency ? '🚨 Available' : 'Disabled'}
                    </p>
                  </div>
               </div>

               {/* SECTION 1: CONTACT & LOCATION INFORMATION */}
               <InfoSection title="📞 Contact & Base Location">
                  <InfoItem label="Contact Phone" value={selectedAmbulance.phone} />
                  <InfoItem label="Email Address" value={selectedAmbulance.email} />
                  <InfoItem label="Phone Verified" value={selectedAmbulance.isPhoneVerified ? 'Yes ✅' : 'No ❌'} />
                  <InfoItem label="City / State" value={[selectedAmbulance.city, selectedAmbulance.state].filter(Boolean).join(', ')} />
                  <InfoItem label="Country / Pincode" value={selectedAmbulance.country || 'India'} />
                  <InfoItem label="Full Street Address" value={selectedAmbulance.address} />
                  <InfoItem 
                    label="Live Lat / Lng Coordinates" 
                    value={selectedAmbulance.location?.lat ? `${selectedAmbulance.location.lat}, ${selectedAmbulance.location.lng}` : 'Coordinates Unavailable'} 
                  />
                  <InfoItem label="Hospital System ID" value={selectedAmbulance.hospitalId} />
               </InfoSection>

               {/* SECTION 2: PRICING STRUCTURE */}
               <InfoSection title="💰 Fare & Distance Pricing">
                  <InfoItem label="Base Included Distance" value={`${selectedAmbulance.pricing?.baseDistance ?? 0} KM`} />
                  <InfoItem label="Fixed Base Price" value={`₹${selectedAmbulance.pricing?.fixedPrice ?? 0}`} />
                  <InfoItem label="Per KM Rate" value={`₹${selectedAmbulance.pricing?.pricePerKM ?? 0} / km`} />
               </InfoSection>

               {/* SECTION 3: MEDICAL SUPPORT STAFF RATES */}
               <InfoSection title="👨‍⚕️ Medical Support Staff">
                  <InfoItem 
                    label="Nurse Support" 
                    value={selectedAmbulance.supportStaff?.nurse?.available ? `Available (₹${selectedAmbulance.supportStaff.nurse.price ?? 0})` : 'Not Available'} 
                  />
                  <InfoItem 
                    label="Doctor Support" 
                    value={selectedAmbulance.supportStaff?.doctor?.available ? `Available (₹${selectedAmbulance.supportStaff.doctor.price ?? 0})` : 'Not Available'} 
                  />
               </InfoSection>

               {/* SECTION 4: FREE COMPLIMENTARY SERVICES */}
               <InfoSection title="🎁 Complimentary Services Offered">
                  <InfoItem label="Free Accidental Transport" value={selectedAmbulance.freeServices?.accidental ? 'Yes ✅' : 'No ❌'} />
                  <InfoItem label="Free Emergency Transport" value={selectedAmbulance.freeServices?.emergency ? 'Yes ✅' : 'No ❌'} />
                  <InfoItem label="Free Referral Transport" value={selectedAmbulance.freeServices?.referral ? 'Yes ✅' : 'No ❌'} />
               </InfoSection>

               {/* SECTION 5: DRIVER & VEHICLE COMPLIANCE */}
               <InfoSection title="📄 Legal & Registration Compliance">
                  <InfoItem label="Driver Full Name" value={selectedAmbulance.driverInfo?.fullName || selectedAmbulance.name} />
                  <InfoItem label="Department" value={selectedAmbulance.driverInfo?.department} />
                  <InfoItem label="Date of Birth" value={formatDate(selectedAmbulance.driverInfo?.dob)} />
                  <InfoItem label="Driving License No." value={selectedAmbulance.drivingLicenseNumber} />
                  <InfoItem label="License Expiry" value={formatDate(selectedAmbulance.licenseExpiryDate)} />
                  <InfoItem label="Experience" value={selectedAmbulance.experienceYears ? `${selectedAmbulance.experienceYears} Years` : 'N/A'} />
                  <InfoItem label="Blood Group" value={selectedAmbulance.bloodGroup} />
                  <InfoItem label="RC Number" value={selectedAmbulance.rcNumber} />
                  <InfoItem label="RC Expiry" value={formatDate(selectedAmbulance.rcExpiryDate)} />
                  <InfoItem label="Insurance Policy No." value={selectedAmbulance.insuranceNumber} />
                  <InfoItem label="Insurance Valid Till" value={formatDate(selectedAmbulance.insuranceValidTill)} />
               </InfoSection>

               {/* SECTION 6: BANK ACCOUNT DETAILS */}
               <InfoSection title="🏦 Bank Account Details">
                  <InfoItem label="Account Holder" value={selectedAmbulance.bankDetails?.accountHolderName} />
                  <InfoItem label="Bank Name" value={selectedAmbulance.bankDetails?.bankName} />
                  <InfoItem label="Account Number" value={selectedAmbulance.bankDetails?.accountNumber} />
                  <InfoItem label="Account Type" value={selectedAmbulance.bankDetails?.accountType} />
                  <InfoItem label="IFSC Code" value={selectedAmbulance.bankDetails?.ifscCode} />
                  <InfoItem label="UPI ID" value={selectedAmbulance.bankDetails?.upiId} />
                  <InfoItem label="Bank Verification" value={selectedAmbulance.bankDetails?.isVerified ? 'Verified ✅' : 'Unverified ⏳'} />
               </InfoSection>

               {/* SECTION 7: UPLOADED VERIFICATION DOCUMENTS */}
               <InfoSection title="📑 Uploaded Verification Documents">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 col-span-full mt-2">
                     <DocSmall label="Driving License" path={getFullUrl(selectedAmbulance.documents?.drivingLicenseFile)} />
                     <DocSmall label="RC Book File" path={getFullUrl(selectedAmbulance.documents?.rcFile)} />
                     <DocSmall label="Insurance Policy" path={getFullUrl(selectedAmbulance.documents?.insuranceFile)} />
                     <DocSmall label="Fitness Certificate" path={getFullUrl(selectedAmbulance.documents?.fitnessCertificate)} />
                     <DocSmall label="Ambulance Permit" path={getFullUrl(selectedAmbulance.documents?.ambulancePermit)} />
                  </div>
               </InfoSection>

               {/* SYSTEM TIMESTAMP FOOTER */}
               <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Registered: {formatDate(selectedAmbulance.createdAt)}</span>
                  <span>Last Updated: {formatDate(selectedAmbulance.updatedAt)}</span>
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ---------------------------------------------------------
// REUSABLE SUB-COMPONENTS
// ---------------------------------------------------------
const InputGroup = ({ label, name, type = 'text', value, onChange, required, placeholder, min }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-gray-700 font-bold tracking-wide uppercase">{label}</label>
    <input 
      type={type} 
      name={name} 
      min={min}
      value={value} 
      onChange={onChange} 
      required={required} 
      placeholder={placeholder}
      className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-[#08B36A] transition-all bg-white font-medium" 
    />
  </div>
);

const FileInputGroup = ({ label, fileKey, onChange, fileName, preview }) => (
  <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">{label}</label>
    <input 
      type="file" 
      onChange={(e) => onChange(e, fileKey)} 
      className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-[#08B36A]/10 file:text-[#08B36A] hover:file:bg-[#08B36A]/20 cursor-pointer"
    />
    {fileName && <p className="text-[9px] text-[#08B36A] font-bold truncate mt-1">Attached: {fileName}</p>}
  </div>
);

const InfoSection = ({ title, children }) => (
  <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
    <h4 className="text-xs font-black text-[#08B36A] uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</p>
    <p className="text-xs font-black text-gray-800 break-words">{value || 'N/A'}</p>
  </div>
);

const DocSmall = ({ label, path }) => (
  <div 
    onClick={() => path ? window.open(path, '_blank') : alert('Document file not uploaded.')} 
    className="cursor-pointer group text-center"
  >
    <div className={`h-24 rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all ${
      path ? 'bg-green-50/50 border-green-200 hover:border-[#08B36A]' : 'bg-gray-100 border-gray-200 opacity-60'
    }`}>
      <span className="text-2xl">{path ? '📄' : '🚫'}</span>
      <span className="text-[9px] font-bold text-gray-500 mt-1">{path ? 'View Doc' : 'Missing'}</span>
    </div>
    <p className="text-[10px] mt-1.5 font-bold text-gray-600 uppercase tracking-tight">{label}</p>
  </div>
);

// ICONS
const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>);
const SettingsIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

export default ManageAmbulance;