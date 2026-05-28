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
  const [zoomImage, setZoomImage] = useState(null);

  // ---------------------------------------------------------
  // Form State (kept for Add/Edit functionality)
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
  const [files, setFiles] = useState({ drivingLicenseFile: null, rcFile: null, insuranceFile: null, fitnessCertificate: null, ambulancePermit: null });
  const [previews, setPreviews] = useState({});
  const [existingFiles, setExistingFiles] = useState({});

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
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fileType]: file }));
      setPreviews((prev) => ({ ...prev, [fileType]: URL.createObjectURL(file) }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFiles({});
    setPreviews({});
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    
    try {
      let res = isEditing ? await HospitalAPI.updateAmbulance(editId, submitData) : await HospitalAPI.addAmbulance(submitData);
      if (res.success) {
        setShowForm(false);
        resetForm();
        fetchAmbulances();
      }
    } catch (err) { alert("Error saving data"); }
    finally { setLoading(false); }
  };

  const handleEdit = (e, amb) => {
    e.stopPropagation();
    setFormData({ 
        ...formData, 
        name: amb.ambulanceCode || amb.name, 
        vehicleType: amb.type || amb.vehicleType, 
        ambulanceNumber: amb.vehicleNumber || amb.ambulanceNumber,
        contactNumber: amb.contactNumber || amb.phone
    });
    setEditId(amb._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this ambulance?')) return;
    await HospitalAPI.deleteAmbulance(id);
    fetchAmbulances();
  };

  const getFullUrl = (path) => path ? (path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`) : null;

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Ambulance Fleet Management</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Monitor live status, drivers, and maintenance schedules.</p>
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
        /* FORM VIEW */
        <div className="bg-white p-8 shadow-2xl rounded-3xl border border-gray-100">
             <h3 className="text-2xl font-black mb-8 border-b pb-4 text-gray-800">
                {isEditing ? 'Edit Vehicle' : 'New Registration'}
             </h3>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputGroup label="Ambulance Code (Tag Name)" name="name" value={formData.name} onChange={handleInputChange} required />
                    <InputGroup label="Vehicle Number" name="ambulanceNumber" value={formData.ambulanceNumber} onChange={handleInputChange} required />
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-700 font-bold uppercase">Vehicle Type</label>
                        <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#08B36A] bg-white outline-none">
                            <option value="Mini Van">Mini Van</option>
                            <option value="BLS">BLS</option>
                            <option value="ALS">ALS</option>
                            <option value="ICU">ICU Ambulance</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="bg-[#08B36A] text-white px-10 py-3 rounded-xl font-bold">{loading ? "Processing..." : "Save Details"}</button>
             </form>
        </div>
      ) : (
        /* TABLE LIST VIEW - MATCHED PARAMS */
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ambulance Code</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Vehicle Number</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Driver Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">ETA / Distance</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchLoading ? (
                  <tr><td colSpan="7" className="py-20 text-center"><SpinnerIcon className="w-10 h-10 text-[#08B36A] mx-auto animate-spin" /></td></tr>
                ) : ambulances.map((amb) => (
                  <tr 
                    key={amb._id} 
                    onClick={() => setSelectedAmbulance(amb)}
                    className="hover:bg-[#08B36A]/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <span className="font-black text-gray-800 text-xs">
                        {amb.ambulanceCode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 text-xs uppercase">
                        {amb.vehicleNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-bold text-xs uppercase">
                          {amb.driverName?.charAt(0) || 'D'}
                        </div>
                        <span className={`font-bold text-sm ${amb.driverName === 'Not Assigned' ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                            {amb.driverName || 'Not Assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider bg-[#08B36A]/10 px-2 py-1 rounded">
                        {amb.type || amb.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${amb.status === 'Maintenance' ? 'bg-amber-500' : 'bg-[#08B36A]'}`}></div>
                        <span className={`text-xs font-bold ${amb.status === 'Maintenance' ? 'text-amber-600' : 'text-[#08B36A]'}`}>
                          {amb.status || 'Available'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-xs text-gray-800 font-bold">{amb.eta || 'Stationary'}</span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{amb.distance || 'At Base'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={(e) => handleToggleMaintenance(e, amb._id, amb.status)}
                          title="Toggle Maintenance"
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg border border-transparent hover:border-amber-100 transition-all"
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(e, amb)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, amb._id)}
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

      {/* DETAIL MODAL - MATCHED PARAMS */}
      {selectedAmbulance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative scrollbar-hide">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedAmbulance.ambulanceCode}</h2>
                  <p className="text-[#08B36A] font-bold text-xs uppercase tracking-[0.2em] mt-1">Full Vehicle Diagnostics</p>
               </div>
               <button onClick={() => setSelectedAmbulance(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 w-10 h-10 flex items-center justify-center rounded-full transition-all border border-gray-200">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            <div className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-lg font-black text-gray-800">{selectedAmbulance.status || 'Available'}</p>
                  </div>
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Vehicle No</p>
                    <p className="text-lg font-black text-gray-800 uppercase">{selectedAmbulance.vehicleNumber}</p>
                  </div>
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">ETA</p>
                    <p className="text-lg font-black text-gray-800">{selectedAmbulance.eta || 'N/A'}</p>
                  </div>
                  <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10">
                    <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest mb-1">Live Lat/Lng</p>
                    <p className="text-sm font-black text-gray-800 truncate">{selectedAmbulance.liveLocation?.lat}, {selectedAmbulance.liveLocation?.lng}</p>
                  </div>
               </div>

               <InfoSection title="👤 Crew Information">
                  <InfoItem label="Primary Driver" value={selectedAmbulance.driverName} />
                  <InfoItem label="Contact Number" value={selectedAmbulance.contactNumber || 'N/A'} />
                  <InfoItem label="Distance from Hub" value={selectedAmbulance.distance || 'At Base'} />
               </InfoSection>

               <InfoSection title="🚑 Specs & Compliance">
                  <InfoItem label="Vehicle Type" value={selectedAmbulance.type} />
                  <InfoSection title="📄 Documentation View">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                     <DocSmall label="RC Book" path={getFullUrl(selectedAmbulance.documents?.rcFile)} />
                     <DocSmall label="Insurance" path={getFullUrl(selectedAmbulance.documents?.insuranceFile)} />
                     <DocSmall label="Permit" path={getFullUrl(selectedAmbulance.documents?.ambulancePermit)} />
                  </div>
               </InfoSection>
               </InfoSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const InputGroup = ({ label, name, type = 'text', value, onChange, required }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-gray-700 font-bold tracking-wide uppercase">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-[#08B36A] transition-all bg-white" />
  </div>
);

const InfoSection = ({ title, children }) => (
  <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
    <h4 className="text-sm font-black text-[#08B36A] uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</p>
    <p className="text-sm font-black text-gray-800">{value || 'N/A'}</p>
  </div>
);

const DocSmall = ({ label, path }) => (
  <div onClick={() => path && window.open(path, '_blank')} className="cursor-pointer group">
    <div className="h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 group-hover:border-[#08B36A] transition-all">
      <span className="text-2xl">📄</span>
    </div>
    <p className="text-[10px] text-center mt-1 font-bold text-gray-500 uppercase">{label}</p>
  </div>
);

// ICONS
const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>);
const SettingsIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

export default ManageAmbulance;