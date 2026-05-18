"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const ManageDoctors = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [doctors, setDoctors] = useState([]);
  const [specialitiesList, setSpecialitiesList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // ---------------------------------------------------------
  // Form State
  // ---------------------------------------------------------
  const initialFormState = {
    name: '', email: '', phone: '', password: '',
    qualification: '', speciality: '', licenseNumber: '', 
    councilNumber: '', councilName: '', about: '',
    country: '', state: '', city: '', address: '',
    isNormal: true, isEmergency: false
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // Files State
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [existingProfileImage, setExistingProfileImage] = useState(null);
  
  const [certificatesFiles, setCertificatesFiles] = useState([]); // Array of files

  // Image URL Helper
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^(public\/|\/)/, ''); 
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  // ---------------------------------------------------------
  // Init Fetch
  // ---------------------------------------------------------
  useEffect(() => {
    fetchDoctors();
    fetchMasterEnums();
  }, []);

  const fetchDoctors = async () => {
    setFetchLoading(true);
    try {
      const response = await HospitalAPI.getHospitalDoctors();
      if (response?.success) setDoctors(response.data);
    } catch (error) { console.error(error); } 
    finally { setFetchLoading(false); }
  };

  const fetchMasterEnums = async () => {
    try {
      const response = await HospitalAPI.getEnums();
      if (response?.success && response.data?.specialities) {
        // Based on backend: [{"name": "Cardiologist"}, ...]
        setSpecialitiesList(response.data.specialities.map(s => s.name));
      }
    } catch (error) { console.error(error); }
  };

  // ---------------------------------------------------------
  // Form Handlers
  // ---------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertificatesChange = (e) => {
    if (e.target.files) {
      setCertificatesFiles(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setProfileImageFile(null); setProfileImagePreview(null); setExistingProfileImage(null);
    setCertificatesFiles([]);
    setIsEditing(false); setEditId(null);
  };

  // ---------------------------------------------------------
  // SUBMIT (Add & Update)
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    // Append all text fields
    Object.keys(formData).forEach(key => {
      // Don't send empty password on edit
      if (key === 'password' && isEditing && !formData.password) return; 
      submitData.append(key, formData[key]);
    });

    // Append Files
    if (profileImageFile) {
      submitData.append('profileImage', profileImageFile);
    }
    
    if (certificatesFiles.length > 0) {
      certificatesFiles.forEach(file => {
        submitData.append('certificates', file);
      });
    }

    try {
      let response;
      if (isEditing) {
        response = await HospitalAPI.updateHospitalDoctor(editId, submitData);
      } else {
        response = await HospitalAPI.addHospitalDoctor(submitData);
      }

      if (response?.success) {
        alert(`Doctor ${isEditing ? 'updated' : 'added'} successfully!`);
        setShowForm(false);
        resetForm();
        fetchDoctors();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) { alert('Something went wrong!'); } 
    finally { setLoading(false); }
  };

  // ---------------------------------------------------------
  // EDIT & DELETE
  // ---------------------------------------------------------
  const handleEdit = (e, doc) => {
    e.stopPropagation();
    setFormData({
      name: doc.name || '', email: doc.email || '', phone: doc.phone || '', password: '',
      qualification: doc.qualification || '', speciality: doc.speciality || '', 
      licenseNumber: doc.licenseNumber || '', councilNumber: doc.councilNumber || '', 
      councilName: doc.councilName || '', about: doc.about || '',
      country: doc.country || '', state: doc.state || '', city: doc.city || '', address: doc.address || '',
      isNormal: doc.department?.isNormal ?? true, isEmergency: doc.department?.isEmergency ?? false
    });

    setExistingProfileImage(getFullUrl(doc.profileImage));
    setProfileImagePreview(getFullUrl(doc.profileImage));
    setCertificatesFiles([]); // Optionally, you can handle showing existing documents here

    setIsEditing(true); setEditId(doc._id); setShowForm(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this doctor?')) return;
    try {
      const response = await HospitalAPI.deleteHospitalDoctor(id);
      if (response?.success) {
        alert('Doctor removed successfully!');
        fetchDoctors();
      } else { alert('Failed: ' + response?.message); }
    } catch (error) { alert('Error removing doctor'); }
  };

  return (
    <div className="p-6 max-w-[90rem] mx-auto font-sans min-h-screen relative bg-gray-50/50">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Hospital Doctors</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage your registered doctors, their schedules, and profiles.</p>
        </div>
        <button 
          onClick={() => { if (showForm) resetForm(); setShowForm(!showForm); }}
          className={`mt-4 md:mt-0 px-8 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
            showForm ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-lg'
          }`}
        >
          {showForm ? <><CloseIcon className="w-5 h-5"/> Cancel & Go Back</> : <><span className="text-xl">+</span> Add New Doctor</>}
        </button>
      </div>

      {showForm ? (
        /* ---------------- ADD / EDIT FORM ---------------- */
        <div className="bg-white p-8 shadow-2xl rounded-3xl border border-gray-100 animate-fadeIn">
          <h3 className="text-2xl font-black mb-8 border-b pb-4 text-gray-800 flex items-center gap-2">
            {isEditing ? <EditIcon className="w-8 h-8 text-blue-500"/> : <span className="text-3xl">👨‍⚕️</span>}
            {isEditing ? 'Edit Doctor Profile' : 'Register New Doctor'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* 1. Basic Details */}
            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
              <h4 className="text-blue-900 font-bold border-b border-blue-100 pb-3 mb-5 uppercase tracking-wide text-sm flex items-center gap-2">👤 Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
                <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
                <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                <InputGroup label={isEditing ? "Update Password (Optional)" : "Login Password"} name="password" type="password" value={formData.password} onChange={handleInputChange} required={!isEditing} />
              </div>
            </div>

            {/* 2. Professional & Dept Details */}
            <div className="bg-green-50/30 p-6 rounded-2xl border border-green-50">
              <h4 className="text-green-900 font-bold border-b border-green-100 pb-3 mb-5 uppercase tracking-wide text-sm flex items-center gap-2">🩺 Professional Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                 <div className="space-y-1.5">
                    <label className="text-xs text-gray-700 font-bold uppercase tracking-wide">Speciality</label>
                    <select name="speciality" value={formData.speciality} onChange={handleInputChange} required className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-green-500 bg-white transition-colors">
                      <option value="">Select Speciality</option>
                      {specialitiesList.map((spec, i) => <option key={i} value={spec}>{spec}</option>)}
                    </select>
                 </div>
                 <InputGroup label="Highest Qualification" name="qualification" placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={handleInputChange} />
                 <InputGroup label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} />
                 <InputGroup label="Council Name" name="councilName" value={formData.councilName} onChange={handleInputChange} />
                 <InputGroup label="Council Number" name="councilNumber" value={formData.councilNumber} onChange={handleInputChange} />
                 <div className="flex gap-4">
                    <div className="flex-1"><ToggleSwitch label="Normal OPD" name="isNormal" checked={formData.isNormal} onChange={handleInputChange} color="blue" /></div>
                    <div className="flex-1"><ToggleSwitch label="Emergency Duty" name="isEmergency" checked={formData.isEmergency} onChange={handleInputChange} color="red" /></div>
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs text-gray-700 font-bold tracking-wide uppercase">About Doctor (Bio)</label>
                 <textarea name="about" rows="3" value={formData.about} onChange={handleInputChange} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 bg-white" placeholder="Write a short description..." />
              </div>
            </div>

            {/* 3. Location */}
            <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-50">
               <h4 className="text-orange-900 font-bold border-b border-orange-100 pb-3 mb-5 uppercase tracking-wide text-sm flex items-center gap-2">📍 Address / Location</h4>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <InputGroup label="Country" name="country" value={formData.country} onChange={handleInputChange} />
                  <InputGroup label="State" name="state" value={formData.state} onChange={handleInputChange} />
                  <InputGroup label="City" name="city" value={formData.city} onChange={handleInputChange} />
                  <InputGroup label="Full Address" name="address" value={formData.address} onChange={handleInputChange} />
               </div>
            </div>

            {/* 4. Document Uploads */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
               <h4 className="text-gray-800 font-bold border-b border-gray-200 pb-3 mb-5 uppercase tracking-wide text-sm flex items-center gap-2">📄 Documents & Images</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Profile Image */}
                  <div className="col-span-1">
                     <label className="text-xs text-gray-700 font-bold tracking-wide uppercase mb-2 block">Profile Photo</label>
                     <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-white overflow-hidden group hover:border-blue-500 transition-colors">
                        <input type="file" onChange={handleProfileImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        {profileImagePreview ? (
                           <>
                             <img src={profileImagePreview} className="w-full h-full object-cover z-0" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-all text-white font-bold text-sm">Replace Image</div>
                           </>
                        ) : (
                           <div className="text-center p-4">
                              <span className="text-4xl block mb-2 text-gray-300">📸</span>
                              <span className="text-xs font-bold text-gray-500">Click to Upload Photo</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Certificates (Multi) */}
                  <div className="col-span-1 md:col-span-2">
                     <label className="text-xs text-gray-700 font-bold tracking-wide uppercase mb-2 block">Certificates & Documents (Multiple)</label>
                     <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-white group hover:border-blue-500 transition-colors p-4">
                        <input type="file" multiple onChange={handleCertificatesChange} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        <div className="text-center z-10">
                           <span className="text-4xl block mb-2 text-gray-300">📑</span>
                           <span className="text-sm font-bold text-gray-700 block mb-1">Upload Required Documents</span>
                           <span className="text-[10px] text-gray-400 font-medium">Select multiple files (Images/PDFs)</span>
                        </div>
                        {certificatesFiles.length > 0 && (
                          <div className="absolute bottom-2 left-0 right-0 px-4 z-10 text-center">
                             <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">{certificatesFiles.length} files selected</span>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-14 rounded-xl transition-all shadow-xl shadow-blue-200 text-lg flex items-center justify-center gap-2">
                {loading ? <SpinnerIcon /> : null} {loading ? 'Processing...' : isEditing ? 'Save Updates' : 'Add New Doctor'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ---------------- LIST VIEW (GRID) ---------------- */
        <div>
          {fetchLoading ? (
            <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 text-blue-500 animate-spin" /></div>
          ) : doctors.length === 0 ? (
            <div className="text-center bg-white p-20 rounded-3xl shadow-sm border-2 border-dashed border-gray-300">
              <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner">👨‍⚕️</div>
              <p className="text-gray-700 text-2xl font-black">No Doctors Found</p>
              <p className="text-gray-500 mt-2">Add your first doctor to manage appointments and schedules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {doctors.map((doc) => {
                 const imageUrl = getFullUrl(doc.profileImage) || 'https://via.placeholder.com/150?text=No+Image';
                 return (
                  <div key={doc._id} onClick={() => setSelectedDoctor(doc)} className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 p-6 flex flex-col relative cursor-pointer group transform hover:-translate-y-1">
                    
                    {/* Top Badges */}
                    <div className="flex justify-between items-start mb-6">
                       <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border shadow-sm ${doc.dutyStatus === 'On Duty' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                         {doc.dutyStatus}
                       </span>
                       <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button onClick={(e) => handleEdit(e, doc)} className="bg-gray-50 border border-blue-100 hover:bg-blue-50 text-blue-600 p-2 rounded-full"><EditIcon className="w-4 h-4" /></button>
                          <button onClick={(e) => handleDelete(e, doc._id)} className="bg-gray-50 border border-red-100 hover:bg-red-50 text-red-600 p-2 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                       </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-center gap-5 mb-6">
                       <img src={imageUrl} alt="Doctor" className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />
                       <div>
                          <h3 className="text-xl font-black text-gray-800 truncate">Dr. {doc.name}</h3>
                          <p className="text-blue-600 font-bold text-xs uppercase tracking-wide mt-1">{doc.speciality || 'General'}</p>
                          <p className="text-gray-500 text-[10px] font-bold mt-1">🩺 Exp: {doc.experienceYears || 0} Yrs</p>
                       </div>
                    </div>

                    {/* Footer Info Box */}
                    <div className="mt-auto space-y-2 text-sm text-gray-700 bg-gray-50/80 border border-gray-100 p-4 rounded-2xl font-medium">
                      <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Phone</span> <span className="font-bold text-gray-800">{doc.phone}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Email</span> <span className="font-bold text-gray-800 truncate max-w-[150px]">{doc.email}</span></div>
                    </div>

                  </div>
                 )
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------
         FULL DETAILS MODAL (VIEW MODE)
      --------------------------------------------------------- */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-64 bg-gray-900/60 backdrop-blur-md transition-opacity animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative scrollbar-hide">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex justify-between items-center z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Doctor Details</h2>
               </div>
               <button onClick={() => setSelectedDoctor(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 hover:border-red-200 w-10 h-10 flex items-center justify-center rounded-full transition-all">
                 <CloseIcon className="w-5 h-5"/>
               </button>
            </div>

            <div className="p-8 space-y-8">
               <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                  <img src={getFullUrl(selectedDoctor.profileImage) || 'https://via.placeholder.com/150?text=No+Image'} alt="Profile" className="w-32 h-32 rounded-3xl object-cover shadow-md border-4 border-white" />
                  <div>
                     <h1 className="text-4xl font-black text-gray-900">Dr. {selectedDoctor.name}</h1>
                     <p className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-2">{selectedDoctor.speciality || 'General'}</p>
                     <div className="flex gap-3 mt-4">
                       <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{selectedDoctor.dutyStatus}</span>
                       <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">{selectedDoctor.profileStatus}</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoSection title="📞 Contact & Location">
                    <InfoItem label="Phone Number" value={selectedDoctor.phone} />
                    <InfoItem label="Email Address" value={selectedDoctor.email} />
                    <InfoItem label="City & State" value={`${selectedDoctor.city || 'N/A'}, ${selectedDoctor.state || 'N/A'}`} />
                    <InfoItem label="Full Address" value={selectedDoctor.address} />
                  </InfoSection>

                  <InfoSection title="🎓 Professional Info">
                    <InfoItem label="Qualification" value={selectedDoctor.qualification} />
                    <InfoItem label="License Number" value={selectedDoctor.licenseNumber} />
                    <InfoItem label="Council Name" value={selectedDoctor.councilName} />
                    <InfoItem label="Council Number" value={selectedDoctor.councilNumber} />
                  </InfoSection>
               </div>

               <InfoSection title="🏥 Departments & Settings">
                  <div className="flex gap-4">
                     {selectedDoctor.department?.isNormal ? <span className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold uppercase">✅ Normal OPD Dept</span> : null}
                     {selectedDoctor.department?.isEmergency ? <span className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold uppercase">🚨 Emergency Dept</span> : null}
                     {!selectedDoctor.department?.isNormal && !selectedDoctor.department?.isEmergency && <span className="text-gray-400 text-sm font-bold">No Departments Assigned</span>}
                  </div>
               </InfoSection>

               {selectedDoctor.documents && selectedDoctor.documents.length > 0 && (
                  <InfoSection title="📑 Uploaded Documents">
                     <div className="flex gap-4 flex-wrap mt-2">
                        {selectedDoctor.documents.map((docPath, idx) => (
                           <a key={idx} href={getFullUrl(docPath)} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 px-4 py-3 rounded-2xl transition-all shadow-sm">
                              <span className="text-2xl">📄</span>
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-gray-800">Document {idx + 1}</span>
                                 <span className="text-[10px] text-blue-500 font-medium hover:underline">Click to View</span>
                              </div>
                           </a>
                        ))}
                     </div>
                  </InfoSection>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageDoctors;

// ---------------------------------------------------------
// REUSABLE COMPONENTS & ICONS
// ---------------------------------------------------------
const InputGroup = ({ label, name, type = 'text', placeholder, value, onChange, required = false }) => (
  <div className="space-y-1.5"><label className="text-xs text-gray-700 font-bold tracking-wide uppercase">{label}</label><input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required} className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 bg-white transition-colors" /></div>
);

const ToggleSwitch = ({ label, name, checked, onChange, color='green' }) => {
  const bgColors = { blue: 'peer-checked:bg-blue-500', red: 'peer-checked:bg-red-500', green: 'peer-checked:bg-green-500' };
  return (
    <div className="flex items-center justify-between bg-white p-3 border-2 border-gray-100 rounded-xl h-[52px]">
      <span className="text-xs text-gray-800 font-bold tracking-wide uppercase">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${bgColors[color]}`}></div>
      </label>
    </div>
  )
};

const InfoSection = ({ title, children }) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm w-full block">
    <h4 className="text-lg font-black text-gray-800 mb-5 border-b border-gray-200 pb-3 flex items-center gap-2">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p><p className="text-sm font-black text-gray-900 truncate">{value || 'N/A'}</p></div>
);

const EditIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = ({className}) => (<svg className={className || "w-5 h-5 animate-spin"} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);