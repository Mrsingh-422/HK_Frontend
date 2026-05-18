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
  
  // STATE FOR FULLSCREEN IMAGE ZOOM
  const [zoomImage, setZoomImage] = useState(null);

  // ---------------------------------------------------------
  // Form State
  // ---------------------------------------------------------
  const initialFormState = {
    name: '', email: '', contactNumber: '', password: '',
    country: '', state: '', city: '', address: '',
    fullName: '', department: '', dob: '',
    drivingLicenseNumber: '', licenseExpiryDate: '', experienceYears: '', bloodGroup: '',
    vehicleType: '', ambulanceNumber: '', rcNumber: '', rcExpiryDate: '', insuranceNumber: '', insuranceValidTill: '',
    serviceRadius: '5 km', availableForEmergency: true,
    fixedPrice: '', distance: '', perKMPrice: '',
    accidentalService: false, emergencyService: false, referralService: false, defaultService: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [optionalServices, setOptionalServices] = useState([{ name: '', price: '' }]);
  
  const initialFiles = { drivingLicenseFile: null, rcFile: null, insuranceFile: null, fitnessCertificate: null, ambulancePermit: null };
  const [files, setFiles] = useState(initialFiles);           
  const [previews, setPreviews] = useState(initialFiles);     
  const [existingFiles, setExistingFiles] = useState(initialFiles); 

  // Helper function for full image URL
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^(public\/|\/)/, ''); 
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  // ---------------------------------------------------------
  // Fetch Ambulances
  // ---------------------------------------------------------
  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    setFetchLoading(true);
    try {
      const response = await HospitalAPI.getMyAmbulances();
      if (response.success) setAmbulances(response.data);
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fileType]: file }));
      if (file.type.startsWith('image/')) {
        setPreviews((prev) => ({ ...prev, [fileType]: URL.createObjectURL(file) }));
      } else {
        setPreviews((prev) => ({ ...prev, [fileType]: null }));
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFiles(initialFiles);
    setPreviews(initialFiles);
    setExistingFiles(initialFiles);
    setOptionalServices([{ name: '', price: '' }]);
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('name', formData.name || formData.fullName);
    submitData.append('email', formData.email);
    if (!isEditing || formData.password) submitData.append('password', formData.password);
    
    submitData.append('phone', formData.contactNumber);
    submitData.append('country', formData.country);
    submitData.append('state', formData.state);
    submitData.append('city', formData.city);
    submitData.append('address', formData.address);
    
    submitData.append('fullName', formData.fullName);
    submitData.append('department', formData.department);
    submitData.append('dob', formData.dob);
    submitData.append('driverInfo[fullName]', formData.fullName);
    submitData.append('driverInfo[department]', formData.department);
    if(formData.dob) submitData.append('driverInfo[dob]', formData.dob);
    
    submitData.append('drivingLicenseNumber', formData.drivingLicenseNumber);
    submitData.append('licenseExpiryDate', formData.licenseExpiryDate);
    submitData.append('experienceYears', formData.experienceYears);
    submitData.append('bloodGroup', formData.bloodGroup);

    submitData.append('vehicleType', formData.vehicleType);
    submitData.append('ambulanceType', formData.vehicleType);
    submitData.append('vehicleNumber', formData.ambulanceNumber);
    submitData.append('ambulanceNumber', formData.ambulanceNumber); 
    
    submitData.append('rcNumber', formData.rcNumber);
    submitData.append('rcExpiryDate', formData.rcExpiryDate);
    submitData.append('insuranceNumber', formData.insuranceNumber);
    submitData.append('insuranceValidTill', formData.insuranceValidTill);
    
    submitData.append('serviceRadius', formData.serviceRadius);
    submitData.append('availableForEmergency', formData.availableForEmergency);
    
    submitData.append('fixedPrice', formData.fixedPrice);
    submitData.append('distance', formData.distance);
    submitData.append('perKMPrice', formData.perKMPrice);
    
    submitData.append('accidentalService', formData.accidentalService);
    submitData.append('emergencyService', formData.emergencyService);
    submitData.append('referralService', formData.referralService);
    submitData.append('defaultService', formData.defaultService);

    const validOptionalServices = optionalServices.filter(s => s.name && s.price);
    if (validOptionalServices.length > 0) {
      submitData.append('optionalService', JSON.stringify(validOptionalServices));
    }
    
    Object.keys(files).forEach((fileKey) => {
      if (files[fileKey]) {
        submitData.append(fileKey, files[fileKey]);
      } else if (isEditing && existingFiles[fileKey]) {
        submitData.append(fileKey, existingFiles[fileKey]);
      }
    });

    try {
      let response;
      if (isEditing) {
        response = await HospitalAPI.updateAmbulance(editId, submitData);
      } else {
        response = await HospitalAPI.addAmbulance(submitData);
      }

      if (response?.success) {
        alert(`Ambulance ${isEditing ? 'updated' : 'added'} successfully!`);
        setShowForm(false);
        resetForm();
        fetchAmbulances();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, amb) => {
    e.stopPropagation();
    const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';
    
    setFormData({
      name: amb.name || amb.driverInfo?.fullName || '',
      email: amb.email || '',
      contactNumber: amb.phone || '',
      country: amb.country || '', state: amb.state || '', city: amb.city || '', address: amb.address || '',
      fullName: amb.driverInfo?.fullName || amb.name || '', department: amb.driverInfo?.department || '', dob: formatDate(amb.driverInfo?.dob),
      drivingLicenseNumber: amb.drivingLicenseNumber || '', licenseExpiryDate: formatDate(amb.licenseExpiryDate), experienceYears: amb.experienceYears || '', bloodGroup: amb.bloodGroup || '',
      vehicleType: amb.vehicleType || amb.ambulanceType || 'BLS', ambulanceNumber: amb.vehicleNumber || amb.ambulanceNumber || '',
      rcNumber: amb.rcNumber || '', rcExpiryDate: formatDate(amb.rcExpiryDate), insuranceNumber: amb.insuranceNumber || '', insuranceValidTill: formatDate(amb.insuranceValidTill),
      serviceRadius: amb.serviceRadius || '5 km', availableForEmergency: amb.availableForEmergency ?? true,
      fixedPrice: amb.pricing?.fixedPrice || '', distance: amb.pricing?.baseDistance || '', perKMPrice: amb.pricing?.pricePerKM || '',
      accidentalService: amb.freeServices?.accidental || false, emergencyService: amb.freeServices?.emergency || false, referralService: amb.freeServices?.referral || false,
      defaultService: amb.defaultService || '', password: '',
    });

    setOptionalServices(amb.optionalServices?.length ? amb.optionalServices : [{ name: '', price: '' }]);
    
    const docs = amb.documents || {};
    setExistingFiles({
      drivingLicenseFile: docs.drivingLicenseFile || null, rcFile: docs.rcFile || null, insuranceFile: docs.insuranceFile || null, fitnessCertificate: docs.fitnessCertificate || null, ambulancePermit: docs.ambulancePermit || null
    });
    setPreviews({
      drivingLicenseFile: getFullUrl(docs.drivingLicenseFile), rcFile: getFullUrl(docs.rcFile), insuranceFile: getFullUrl(docs.insuranceFile), fitnessCertificate: getFullUrl(docs.fitnessCertificate), ambulancePermit: getFullUrl(docs.ambulancePermit)
    });

    setIsEditing(true);
    setEditId(amb._id);
    setShowForm(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this ambulance?')) return;
    try {
      const response = await HospitalAPI.deleteAmbulance(id);
      if (response?.success) {
        alert('Ambulance deleted successfully!');
        fetchAmbulances();
      } else {
        alert('Failed to delete: ' + response?.message);
      }
    } catch (error) {
      alert('Error deleting ambulance');
    }
  };

  const displayDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Fixed Address Commas Logic
  const formatAddress = (amb) => {
    const parts = [amb.address, amb.city, amb.state, amb.country].filter(val => val && val.trim() !== '');
    return parts.length > 0 ? parts.join(', ') : 'No Address Provided';
  };

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manage Ambulances</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">View, add, edit, and track your hospital ambulances.</p>
        </div>
        <button 
          onClick={() => { if (showForm) resetForm(); setShowForm(!showForm); }}
          className={`mt-4 md:mt-0 px-8 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 ${
            showForm ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#00A95D] hover:bg-green-700 shadow-green-200 text-lg'
          }`}
        >
          {showForm ? '✖ Cancel & Go Back' : '➕ Add New Ambulance'}
        </button>
      </div>

      {showForm ? (
        /* ---------------------------------------------------------
           ADD / EDIT FORM
        --------------------------------------------------------- */
        <div className="bg-white p-8 shadow-2xl rounded-3xl border border-gray-100">
          <h3 className="text-2xl font-black mb-8 border-b pb-4 text-gray-800 flex items-center gap-2">
            {isEditing ? <EditIcon className="w-8 h-8 text-blue-500"/> : <span className="text-3xl">🚑</span>}
            {isEditing ? 'Edit Ambulance Details' : 'New Ambulance Registration'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 1. Basic & Location */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h4 className="text-gray-800 font-bold border-b pb-3 mb-5 uppercase tracking-wide text-sm">1. Basic & Location Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <InputGroup label="Ambulance Tag Name" name="name" value={formData.name} onChange={handleInputChange} required />
                <InputGroup label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required />
                <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                <InputGroup label={isEditing ? "Update Password (Optional)" : "Login Password"} name="password" type="password" value={formData.password} onChange={handleInputChange} required={!isEditing} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">
                <InputGroup label="Country" name="country" value={formData.country} onChange={handleInputChange} />
                <InputGroup label="State" name="state" value={formData.state} onChange={handleInputChange} />
                <InputGroup label="City" name="city" value={formData.city} onChange={handleInputChange} />
                <InputGroup label="Full Address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
            </div>

            {/* 2. Driver Details */}
            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
              <h4 className="text-blue-900 font-bold border-b border-blue-100 pb-3 mb-5 uppercase tracking-wide text-sm">2. Driver Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <InputGroup label="Driver Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                <InputGroup label="Department" name="department" value={formData.department} onChange={handleInputChange} />
                <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                <InputGroup label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <InputGroup label="Driving License Number" name="drivingLicenseNumber" value={formData.drivingLicenseNumber} onChange={handleInputChange} />
                <InputGroup label="License Expiry Date" name="licenseExpiryDate" type="date" value={formData.licenseExpiryDate} onChange={handleInputChange} />
                <InputGroup label="Experience (Years)" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} />
              </div>
            </div>

            {/* 3. Vehicle & Registration */}
            <div className="bg-green-50/30 p-6 rounded-2xl border border-green-50">
               <h4 className="text-green-900 font-bold border-b border-green-100 pb-3 mb-5 uppercase tracking-wide text-sm">3. Vehicle & Insurance Info</h4>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-700 font-bold uppercase tracking-wide">Vehicle Type</label>
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#00A95D] bg-white transition-colors" required>
                      <option value="">Select Category</option> <option value="BLS">BLS</option> <option value="ALS">ALS</option> <option value="ICU Ambulance">ICU Ambulance</option>
                    </select>
                  </div>
                  <InputGroup label="Vehicle Number" name="ambulanceNumber" value={formData.ambulanceNumber} onChange={handleInputChange} required />
                  <InputGroup label="RC Number" name="rcNumber" value={formData.rcNumber} onChange={handleInputChange} />
                  <InputGroup label="RC Expiry Date" name="rcExpiryDate" type="date" value={formData.rcExpiryDate} onChange={handleInputChange} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  <InputGroup label="Insurance Policy Number" name="insuranceNumber" value={formData.insuranceNumber} onChange={handleInputChange} />
                  <InputGroup label="Insurance Valid Till" name="insuranceValidTill" type="date" value={formData.insuranceValidTill} onChange={handleInputChange} />
               </div>
            </div>

            {/* 4. Pricing & Toggles */}
            <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-50">
               <h4 className="text-orange-900 font-bold border-b border-orange-100 pb-3 mb-5 uppercase tracking-wide text-sm">4. Pricing & Availability Options</h4>
               <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
                 <InputGroup label="Fixed Base Price" name="fixedPrice" type="number" value={formData.fixedPrice} onChange={handleInputChange} />
                 <InputGroup label="Base Distance (km)" name="distance" type="number" value={formData.distance} onChange={handleInputChange} />
                 <InputGroup label="Price Per KM" name="perKMPrice" type="number" value={formData.perKMPrice} onChange={handleInputChange} />
                 <div className="space-y-1.5">
                    <label className="text-xs text-gray-700 font-bold uppercase tracking-wide">Service Radius</label>
                    <select name="serviceRadius" value={formData.serviceRadius} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#00A95D] bg-white transition-colors">
                      <option value="5 km">5 km</option><option value="10 km">10 km</option><option value="20 km">20 km</option><option value="50 km">50 km</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <ToggleSwitch label="Available For Emergency" name="availableForEmergency" checked={formData.availableForEmergency} onChange={handleInputChange} />
                  </div>
               </div>
               <label className="text-sm text-gray-800 font-black block mb-3">Free Services</label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <ToggleSwitch label="Accidental Service" name="accidentalService" checked={formData.accidentalService} onChange={handleInputChange} />
                 <ToggleSwitch label="Emergency Service" name="emergencyService" checked={formData.emergencyService} onChange={handleInputChange} />
                 <ToggleSwitch label="Referral Service" name="referralService" checked={formData.referralService} onChange={handleInputChange} />
               </div>
               <div className="space-y-4 pt-6 border-t border-orange-100">
                 <label className="text-sm text-gray-800 font-black">Optional Extra Services</label>
                 {optionalServices.map((service, index) => (
                    <div key={index} className="flex gap-4">
                        <input type="text" placeholder={`Service Name`} value={service.name} onChange={(e) => { const newArr = [...optionalServices]; newArr[index].name = e.target.value; setOptionalServices(newArr); }} className="w-1/2 border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#00A95D] outline-none transition-colors" />
                        <input type="number" placeholder="₹ Price" value={service.price} onChange={(e) => { const newArr = [...optionalServices]; newArr[index].price = e.target.value; setOptionalServices(newArr); }} className="w-1/4 border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#00A95D] outline-none transition-colors" />
                    </div>
                 ))}
                 <button type="button" onClick={() => setOptionalServices([...optionalServices, { name: '', price: '' }])} className="text-sm text-[#00A95D] font-bold mt-2 hover:underline flex items-center gap-1"><span className="text-lg">+</span> Add Optional Service</button>
               </div>
            </div>

            {/* 5. Document Uploads */}
            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200">
               <h4 className="text-gray-800 font-bold border-b border-gray-200 pb-3 mb-2 uppercase tracking-wide text-sm">5. Document Uploads</h4>
               <p className="text-xs text-gray-500 mb-6 font-medium">{isEditing ? "Images are pre-loaded. Upload a new file only if you want to replace the existing one." : "Upload clear images or PDFs of the required documents."}</p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <PremiumFileUpload label="Driver License" file={files.drivingLicenseFile} preview={previews.drivingLicenseFile} existingUrl={existingFiles.drivingLicenseFile} onChange={(e) => handleFileChange(e, 'drivingLicenseFile')} />
                  <PremiumFileUpload label="RC Book" file={files.rcFile} preview={previews.rcFile} existingUrl={existingFiles.rcFile} onChange={(e) => handleFileChange(e, 'rcFile')} />
                  <PremiumFileUpload label="Insurance File" file={files.insuranceFile} preview={previews.insuranceFile} existingUrl={existingFiles.insuranceFile} onChange={(e) => handleFileChange(e, 'insuranceFile')} />
                  <PremiumFileUpload label="Fitness Cert." file={files.fitnessCertificate} preview={previews.fitnessCertificate} existingUrl={existingFiles.fitnessCertificate} onChange={(e) => handleFileChange(e, 'fitnessCertificate')} />
                  <PremiumFileUpload label="Ambulance Permit" file={files.ambulancePermit} preview={previews.ambulancePermit} existingUrl={existingFiles.ambulancePermit} onChange={(e) => handleFileChange(e, 'ambulancePermit')} />
               </div>
            </div>

            <div className="flex justify-end pt-6">
              <button type="submit" disabled={loading} className="w-full md:w-auto bg-[#00A95D] hover:bg-green-700 text-white font-black py-4 px-14 rounded-xl transition-all shadow-xl shadow-green-200 text-lg flex items-center justify-center gap-2">
                {loading ? <SpinnerIcon /> : null} {loading ? 'Processing...' : isEditing ? 'Update Ambulance' : 'Save Ambulance Details'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ---------------------------------------------------------
           LIST VIEW
        --------------------------------------------------------- */
        <div>
          {fetchLoading ? (
            <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 text-green-500 animate-spin" /></div>
          ) : ambulances.length === 0 ? (
            <div className="text-center bg-white p-20 rounded-3xl shadow-sm border-2 border-dashed border-gray-300">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner">🚑</div>
              <p className="text-gray-700 text-2xl font-black">No ambulances found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {ambulances.map((amb) => (
                <div key={amb._id} onClick={() => setSelectedAmbulance(amb)} className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 p-6 flex flex-col relative cursor-pointer group transform hover:-translate-y-1">
                  <span className={`absolute top-6 left-6 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm ${amb.profileStatus === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{amb.profileStatus}</span>
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                     <button onClick={(e) => handleEdit(e, amb)} className="bg-white border border-blue-100 hover:bg-blue-50 text-blue-600 p-2.5 rounded-full shadow-lg"><EditIcon className="w-4 h-4" /></button>
                     <button onClick={(e) => handleDelete(e, amb._id)} className="bg-white border border-red-100 hover:bg-red-50 text-red-600 p-2.5 rounded-full shadow-lg"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                  <div className="mt-12"><h3 className="text-2xl font-black text-gray-800 truncate pr-4">{amb.name}</h3><p className="text-sm text-[#00A95D] font-bold mt-1 tracking-wide uppercase">{amb.vehicleType || amb.ambulanceType}</p></div>
                  <div className="mt-6 space-y-3 text-sm text-gray-700 bg-gray-50/80 border border-gray-100 p-5 rounded-2xl flex-grow font-medium">
                    <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Vehicle No</span> <span className="font-bold text-gray-900 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">{amb.vehicleNumber || amb.ambulanceNumber || 'N/A'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Phone</span> <span className="text-gray-800">{amb.phone}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------
         FULL DETAILS MODAL (WITH LARGE SQUARE ZOOMABLE IMAGES)
      --------------------------------------------------------- */}
      {selectedAmbulance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-opacity">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative animate-fadeIn scrollbar-hide">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedAmbulance.name}</h2>
                  <p className="text-[#00A95D] font-bold text-sm tracking-wide uppercase mt-1">
                    {selectedAmbulance.vehicleType || selectedAmbulance.ambulanceType} • {selectedAmbulance.vehicleNumber || selectedAmbulance.ambulanceNumber}
                  </p>
               </div>
               <button onClick={() => setSelectedAmbulance(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 hover:border-red-200 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            <div className="p-8 space-y-8">
               
               {/* DRIVER INFO */}
               <InfoSection title="👤 Driver Information">
                  <InfoItem label="Full Name" value={selectedAmbulance.driverInfo?.fullName || selectedAmbulance.name} />
                  <InfoItem label="Department" value={selectedAmbulance.driverInfo?.department} />
                  <InfoItem label="Date of Birth" value={displayDate(selectedAmbulance.driverInfo?.dob)} />
                  <InfoItem label="Contact Number" value={selectedAmbulance.phone} />
                  <InfoItem label="Email Address" value={selectedAmbulance.email} />
                  <InfoItem label="Blood Group" value={selectedAmbulance.bloodGroup} />
                  <InfoItem label="Experience" value={selectedAmbulance.experienceYears} />
               </InfoSection>

               {/* VEHICLE INFO */}
               <InfoSection title="🚑 Vehicle & License Details">
                  <InfoItem label="Vehicle Type" value={selectedAmbulance.vehicleType || selectedAmbulance.ambulanceType} />
                  <InfoItem label="Vehicle Number" value={selectedAmbulance.vehicleNumber || selectedAmbulance.ambulanceNumber} />
                  <InfoItem label="Driving License" value={selectedAmbulance.drivingLicenseNumber} />
                  <InfoItem label="License Expiry" value={displayDate(selectedAmbulance.licenseExpiryDate)} />
                  <InfoItem label="RC Number" value={selectedAmbulance.rcNumber} />
                  <InfoItem label="RC Expiry" value={displayDate(selectedAmbulance.rcExpiryDate)} />
                  <InfoItem label="Insurance Number" value={selectedAmbulance.insuranceNumber} />
                  <InfoItem label="Insurance Valid Till" value={displayDate(selectedAmbulance.insuranceValidTill)} />
               </InfoSection>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <InfoSection title="💰 Pricing Structure">
                    <InfoItem label="Fixed Base Price" value={`₹ ${selectedAmbulance.pricing?.fixedPrice || 0}`} />
                    <InfoItem label="Base Distance" value={`${selectedAmbulance.pricing?.baseDistance || 0} km`} />
                    <InfoItem label="Price Per KM" value={`₹ ${selectedAmbulance.pricing?.pricePerKM || 0}`} />
                 </InfoSection>

                 <InfoSection title="🏥 Services">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAmbulance.availableForEmergency && <Badge color="red" text="Emergency Ready" />}
                      {selectedAmbulance.freeServices?.accidental && <Badge color="green" text="Accidental Free" />}
                      {selectedAmbulance.freeServices?.emergency && <Badge color="green" text="Emergency Free" />}
                      {selectedAmbulance.freeServices?.referral && <Badge color="green" text="Referral Free" />}
                    </div>
                    {selectedAmbulance.optionalServices?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Optional Services</p>
                        {selectedAmbulance.optionalServices.map((opt, i) => (
                           <div key={i} className="flex justify-between text-sm bg-white p-2.5 rounded-lg border border-gray-100 mb-2 font-bold text-gray-700 shadow-sm">
                              <span>{opt.name}</span>
                              <span className="text-[#00A95D]">₹{opt.price}</span>
                           </div>
                        ))}
                      </div>
                    )}
                 </InfoSection>
               </div>

               {/* ADDRESS WITH COMMAS FIXED */}
               <InfoSection title="📍 Location & Address">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full md:w-1/2">
                     <p className="text-sm text-gray-800 font-bold leading-relaxed">
                       {formatAddress(selectedAmbulance)}
                     </p>
                  </div>
               </InfoSection>

               {/* LARGE SQUARE DOCUMENTS UI (ZOOMABLE) - IMPROVED CSS */}
               <InfoSection title="📄 Uploaded Documents">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-4 w-full">
                     <LargeDocViewer label="Driver License" path={getFullUrl(selectedAmbulance.documents?.drivingLicenseFile)} onZoom={setZoomImage} />
                     <LargeDocViewer label="RC Book" path={getFullUrl(selectedAmbulance.documents?.rcFile)} onZoom={setZoomImage} />
                     <LargeDocViewer label="Insurance" path={getFullUrl(selectedAmbulance.documents?.insuranceFile)} onZoom={setZoomImage} />
                     <LargeDocViewer label="Fitness Cert" path={getFullUrl(selectedAmbulance.documents?.fitnessCertificate)} onZoom={setZoomImage} />
                     <LargeDocViewer label="Ambul Permit" path={getFullUrl(selectedAmbulance.documents?.ambulancePermit)} onZoom={setZoomImage} />
                  </div>
               </InfoSection>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         FULLSCREEN ZOOM OVERLAY
      --------------------------------------------------------- */}
      {zoomImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setZoomImage(null)}>
           <button onClick={() => setZoomImage(null)} className="absolute top-6 right-6 text-white hover:text-red-500 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all">
             <CloseIcon className="w-6 h-6" />
           </button>
           <img src={zoomImage} alt="Zoomed Document" className="max-w-full max-h-full rounded-xl shadow-2xl object-contain border border-gray-800" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

    </div>
  );
};

export default ManageAmbulance;

// ---------------------------------------------------------
// REUSABLE PREMIUM UI COMPONENTS
// ---------------------------------------------------------
const InputGroup = ({ label, name, type = 'text', placeholder, value, onChange, required = false }) => (
  <div className="space-y-1.5"><label className="text-xs text-gray-700 font-bold tracking-wide uppercase">{label}</label><input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00A95D] bg-white" /></div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <div className="flex items-center justify-between bg-white p-3 border-2 border-gray-100 rounded-xl h-[52px]">
    <span className="text-xs text-gray-800 font-bold tracking-wide uppercase">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A95D]"></div>
    </label>
  </div>
);

const PremiumFileUpload = ({ label, file, preview, existingUrl, onChange }) => {
  const hasImage = preview || existingUrl;
  return (
    <div className="flex flex-col gap-2">
      <div className={`relative border-2 ${hasImage ? 'border-transparent shadow-md' : 'border-dashed border-gray-300'} rounded-2xl h-40 flex flex-col justify-center items-center text-center hover:shadow-lg transition-all cursor-pointer group overflow-hidden bg-white`}>
        <input type="file" onChange={onChange} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        {hasImage ? (
          <>
            <img src={preview || existingUrl} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2"><UploadCloudIcon className="w-4 h-4"/> Replace</span>
            </div>
          </>
        ) : (
          <div className="relative z-10 flex flex-col items-center pointer-events-none p-4">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-3 border border-gray-100"><UploadCloudIcon className="w-6 h-6"/></div>
            <span className="text-[11px] font-bold text-gray-600 uppercase">Upload File</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-1">
         <span className="text-[11px] font-black text-gray-800 uppercase truncate w-2/3">{label}</span>
         {hasImage ? <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-1 rounded border border-green-100">✔ Done</span> : <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">Pending</span>}
      </div>
    </div>
  );
};

// IMPROVED: Large Square Document Viewer with better CSS
const LargeDocViewer = ({ label, path, onZoom }) => {
  const isPdf = path && path.toLowerCase().endsWith('.pdf');

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        onClick={() => {
           if (isPdf) window.open(path, '_blank');
           else if (path) onZoom(path);
        }}
        className={`relative w-full aspect-square border-2 ${path ? 'border-gray-200 shadow-md cursor-pointer group hover:border-[#00A95D] hover:shadow-xl' : 'border-dashed border-gray-200 cursor-not-allowed opacity-60 bg-gray-50'} rounded-2xl flex flex-col justify-center items-center text-center transition-all duration-300 overflow-hidden bg-white`}
      >
        {path ? (
          <>
            {isPdf ? (
              <div className="flex flex-col items-center text-red-500">
                 <span className="text-5xl mb-2">📄</span>
                 <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">PDF File</span>
              </div>
            ) : (
              <img src={path} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" />
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white text-gray-900 text-xs font-black px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                {isPdf ? 'Open PDF' : '🔍 View Large'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-300">
             <span className="text-4xl mb-2">🚫</span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Not Uploaded</span>
          </div>
        )}
      </div>
      <div className="text-center px-1 mt-3">
         <span className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

const InfoSection = ({ title, children }) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm w-full block">
    <h4 className="text-lg font-black text-gray-800 mb-5 border-b border-gray-200 pb-3 flex items-center gap-2">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-8">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p><p className="text-sm font-black text-gray-900 truncate">{value || 'N/A'}</p></div>
);

const Badge = ({ color, text }) => <span className={`text-[11px] font-black uppercase tracking-wide px-4 py-1.5 rounded-full border shadow-sm ${color==='red'?'bg-red-50 text-red-700 border-red-200':'bg-green-50 text-green-700 border-green-200'}`}>{text}</span>;

// SVG ICONS
const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadCloudIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className||"w-5 h-5 animate-spin"} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);