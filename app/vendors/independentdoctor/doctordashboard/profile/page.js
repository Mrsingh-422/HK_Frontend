'use client'
import React, { useState, useEffect, useRef } from 'react'
import { 
  FaUser, FaCamera, FaStethoscope, FaLanguage, FaWallet, 
  FaInfoCircle, FaSave, FaSyncAlt, FaPlus, FaTrash, FaUserMd,
  FaGraduationCap, FaIdCard, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaClock, FaCheckCircle, FaVideo, FaHospital, FaHome, FaChevronDown,
  FaAward, FaMicroscope
} from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import DoctorAPI from '@/app/services/DoctorAPI';

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [travelCharges, setTravelCharges] = useState(0); // Added state for travel expenses
  const [qualificationsList, setQualificationsList] = useState([]); // State for qualifications dropdown
  const [specialitiesList, setSpecialitiesList] = useState([]); // State for specialities dropdown
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    about: '',
    experienceYears: '',
    qualification: [], // Initialized as an array for managing tags
    speciality: '',
    licenseNumber: '',
    councilNumber: '',
    councilName: '',
    country: '',
    state: '',
    city: '',
    address: '',
    slotDuration: 30,
    languages: ['English'],
    fees: { online: 0, clinic: 0, home: 0 },
    consultationStatus: { online: false, clinic: false, home: false },
    profileImage: null,
    profileStatus: '',
    dutyStatus: '',
    // NEW FIELDS FROM RESPONSE
    competencies: [],
    treatedConditions: [],
    location: { lat: 0, lng: 0 }
  });

  const [newLang, setNewLang] = useState('');
  const [newCompetency, setNewCompetency] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      setFetching(true);
      
      // Fetch Profile, Visit Charges, Qualifications, and Specializations concurrently
      const [profileRes, chargesRes, qualificationsRes, specialitiesRes] = await Promise.all([
        DoctorAPI.getProfile(),
        DoctorAPI.getMyVisitCharges(),
        DoctorAPI.getQualifications().catch(err => {
          console.error("Qualifications load error:", err);
          return null;
        }),
        DoctorAPI.getSpecializations().catch(err => {
          console.error("Specializations load error:", err);
          return null;
        })
      ]);
      
      // Handle Qualifications dropdown list mapping
      if (qualificationsRes && qualificationsRes.success && Array.isArray(qualificationsRes.data)) {
        const quals = qualificationsRes.data.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.name || item.title || '';
          }
          return item;
        }).filter(Boolean);
        setQualificationsList(quals);
      } else if (qualificationsRes && Array.isArray(qualificationsRes)) {
        setQualificationsList(qualificationsRes);
      }

      // Handle Specialities dropdown list mapping
      if (specialitiesRes && specialitiesRes.success && Array.isArray(specialitiesRes.data)) {
        const specs = specialitiesRes.data.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.name || item.title || '';
          }
          return item;
        }).filter(Boolean);
        setSpecialitiesList(specs);
      } else if (specialitiesRes && Array.isArray(specialitiesRes)) {
        setSpecialitiesList(specialitiesRes);
      }
      
      // Handle Profile Data
      if (profileRes && profileRes.success && profileRes.data) {
        const d = profileRes.data;
        
        // Safely parse the incoming qualification field (handles strings, commas, or arrays)
        let parsedQualifications = [];
        if (d.qualification) {
          if (Array.isArray(d.qualification)) {
            parsedQualifications = d.qualification;
          } else {
            parsedQualifications = d.qualification.split(',').map(q => q.trim()).filter(Boolean);
          }
        }

        setProfileData({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          about: d.about || '',
          experienceYears: d.experienceYears || 0,
          qualification: parsedQualifications,
          speciality: d.speciality || '',
          licenseNumber: d.licenseNumber || '',
          councilNumber: d.councilNumber || '',
          councilName: d.councilName || '',
          country: d.country || '',
          state: d.state || '',
          city: d.city || '',
          address: d.address || '',
          slotDuration: d.slotDuration || 30,
          languages: Array.isArray(d.languages) && d.languages.length > 0 ? d.languages : ['English'],
          fees: {
            online: d.fees?.online ?? 0,
            clinic: d.fees?.clinic ?? 0,
            home: d.fees?.home ?? 0
          },
          consultationStatus: {
            online: d.consultationStatus?.online ?? false,
            clinic: d.consultationStatus?.clinic ?? false,
            home: d.consultationStatus?.home ?? false
          },
          profileImage: null,
          profileStatus: d.profileStatus || 'Pending',
          dutyStatus: d.dutyStatus || 'Off Duty',
          competencies: d.competencies || [],
          treatedConditions: d.treatedConditions || [],
          location: {
            lat: d.location?.lat || 0,
            lng: d.location?.lng || 0
          }
        });

        if (d.profileImage) {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
          if (d.profileImage.startsWith('http')) {
            setPreviewImage(d.profileImage);
          } else {
            let cleanPath = d.profileImage.replace(/\\/g, '/');
            if (cleanPath.startsWith('public/')) {
              cleanPath = cleanPath.replace('public/', '');
            }
            cleanPath = cleanPath.replace(/^\/+/, '');
            const cleanBase = backendUrl.replace(/\/+$/, '');
            setPreviewImage(`${cleanBase}/${cleanPath}`);
          }
        } else {
          setPreviewImage(null);
        }
      }

      // Handle Travel Charges Data
      if (chargesRes && chargesRes.success && chargesRes.data) {
          setTravelCharges(chargesRes.data.fixedPrice || 0);
      }

    } catch (error) {
      console.error("Profile Load Error:", error);
      toast.error("Failed to load profile data");
    } finally {
      setFetching(false);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value }
    }));
  };

  const handleFeeChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      fees: { ...prev.fees, [name]: value }
    }));
  };

  const handleStatusToggle = async (type) => {
    const newStatusValue = !profileData.consultationStatus[type];
    const updatedConsultationStatus = {
      ...profileData.consultationStatus,
      [type]: newStatusValue
    };

    setProfileData(prev => ({
      ...prev,
      consultationStatus: updatedConsultationStatus
    }));

    try {
      const res = await DoctorAPI.updateSettings({
        consultationStatus: updatedConsultationStatus
      });

      if (res && res.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} status updated!`);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Toggle update error:", error);
      toast.error("Failed to update status. Rolling back.");
      setProfileData(prev => ({
        ...prev,
        consultationStatus: {
          ...prev.consultationStatus,
          [type]: !newStatusValue
        }
      }));
    }
  };

  const toggleDutyStatus = async () => {
    const nextStatus = profileData.dutyStatus === 'On Duty' ? 'Off Duty' : 'On Duty';
    try {
      const formData = new FormData();
      formData.append('dutyStatus', nextStatus);
      
      const res = await DoctorAPI.updateProfile(formData);
      if (res) {
        toast.success(`Duty status changed to ${nextStatus}`);
        setProfileData(prev => ({ ...prev, dutyStatus: nextStatus }));
      }
    } catch (error) {
      console.error("Duty status update error:", error);
      try {
        const resSettings = await DoctorAPI.updateSettings({ dutyStatus: nextStatus });
        if (resSettings) {
          toast.success(`Duty status changed to ${nextStatus}`);
          setProfileData(prev => ({ ...prev, dutyStatus: nextStatus }));
          return;
        }
      } catch (innerError) {
        console.error("Duty status fallback error:", innerError);
      }
      toast.error("Failed to update duty status");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profileImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Helper functions for Array tags
  const addLanguage = () => {
    if (newLang.trim() && !profileData.languages.includes(newLang.trim())) {
      setProfileData(prev => ({ ...prev, languages: [...prev.languages, newLang.trim()] }));
      setNewLang('');
    }
  };
  const removeLanguage = (lang) => {
    setProfileData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
  };

  const addCompetency = () => {
    if (newCompetency.trim() && !profileData.competencies.includes(newCompetency.trim())) {
      setProfileData(prev => ({ ...prev, competencies: [...prev.competencies, newCompetency.trim()] }));
      setNewCompetency('');
    }
  };
  const removeCompetency = (item) => {
    setProfileData(prev => ({ ...prev, competencies: prev.competencies.filter(i => i !== item) }));
  };

  const addCondition = () => {
    if (newCondition.trim() && !profileData.treatedConditions.includes(newCondition.trim())) {
      setProfileData(prev => ({ ...prev, treatedConditions: [...prev.treatedConditions, newCondition.trim()] }));
      setNewCondition('');
    }
  };
  const removeCondition = (item) => {
    setProfileData(prev => ({ ...prev, treatedConditions: prev.treatedConditions.filter(i => i !== item) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      
      if (profileData.profileImage instanceof File) {
        formData.append('profileImage', profileData.profileImage);
      }
      
      Object.keys(profileData).forEach(key => {
        if (key === 'fees') {
            formData.append('fees[online]', String(profileData.fees.online || 0));
            formData.append('fees[clinic]', String(profileData.fees.clinic || 0));
            formData.append('fees[home]', String(profileData.fees.home || 0));
        } else if (key === 'consultationStatus') {
            formData.append('consultationStatus[online]', String(profileData.consultationStatus.online));
            formData.append('consultationStatus[clinic]', String(profileData.consultationStatus.clinic));
            formData.append('consultationStatus[home]', String(profileData.consultationStatus.home));
        } else if (key === 'location') {
            formData.append('location[lat]', String(profileData.location.lat));
            formData.append('location[lng]', String(profileData.location.lng));
        } else if (key === 'languages') {
            profileData.languages.forEach((lang, index) => {
                formData.append(`languages[${index}]`, lang);
            });
        } else if (key === 'competencies') {
            profileData.competencies.forEach((item, index) => {
                formData.append(`competencies[${index}]`, item);
            });
        } else if (key === 'treatedConditions') {
            profileData.treatedConditions.forEach((item, index) => {
                formData.append(`treatedConditions[${index}]`, item);
            });
        } else if (key === 'qualification') {
            // Converts array back to a comma-separated string format for backend column compatibility
            formData.append('qualification', profileData.qualification.join(', '));
        } else if (key !== 'profileImage' && key !== 'profileStatus') {
            formData.append(key, profileData[key]);
        }
      });

      const res = await DoctorAPI.updateProfile(formData);
      if (res) {
        toast.success("Profile Updated Successfully!");
        await loadCurrentProfile();
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FaSyncAlt className="animate-spin text-[#08B36A] text-4xl mb-4"/>
        <p className="text-gray-500 font-bold uppercase tracking-tighter">Syncing Profile Data...</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-4">
      <Toaster position="top-right" />
      
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-[#08B36A] text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
            <FaUserMd size={32}/>
        </div>
        <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase leading-none">Doctor Profile</h1>
        <div className="flex gap-3 mt-3 items-center">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${profileData.profileStatus === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {profileData.profileStatus}
            </span>
            <button
                type="button"
                onClick={toggleDutyStatus}
                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                    profileData.dutyStatus === 'On Duty' 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
                title="Click to toggle Duty Status"
            >
                <span className={`w-1.5 h-1.5 rounded-full ${profileData.dutyStatus === 'On Duty' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {profileData.dutyStatus || 'Off Duty'}
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
            {/* Photo Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-lg transition-shadow">
                <div className="relative">
                    <div className="w-64 h-64 rounded-[3.5rem] border-4 border-white shadow-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                        {previewImage ? (
                            <img src={previewImage} alt="Doctor" className="w-full h-full object-cover" onError={(e) => {e.target.style.display = 'none';}} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200"><FaUser size={100} /></div>
                        )}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 p-4 bg-[#08B36A] text-white rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95">
                        <FaCamera size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                </div>
                <h3 className="mt-6 font-black text-gray-900 uppercase tracking-tighter">Profile Photo</h3>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><FaLanguage/></div>
                    <h2 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tighter">Languages</h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.languages.map((lang, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs border border-gray-100">
                            {lang} <button type="button" onClick={() => removeLanguage(lang)} className="text-red-400 hover:text-red-600"><FaTrash size={10}/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="Add lang" className="input-style !py-3" />
                    <button type="button" onClick={addLanguage} className="px-4 bg-purple-600 text-white rounded-xl active:scale-95 font-bold">+</button>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pink-50 text-pink-600 rounded-xl"><FaPhone/></div>
                    <h2 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tighter">Contact Info</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="label-style">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute right-4 top-5 text-gray-300"/>
                            <input name="email" value={profileData.email} disabled className="input-style pl-12 bg-gray-50 opacity-70 cursor-not-allowed" />
                        </div>
                    </div>
                    <div>
                        <label className="label-style">Phone Number</label>
                        <div className="relative">
                            <FaPhone className="absolute right-4 top-5 text-gray-300 rotate-90"/>
                            <input name="phone" value={profileData.phone} onChange={handleTextChange} className="input-style pl-12" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FaInfoCircle/></div>
                    <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">Basic Info</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="label-style">Professional Name</label>
                        <input name="name" value={profileData.name} onChange={handleTextChange} placeholder="Dr. Mudabir Kowsar" className="input-style" required />
                    </div>
                    <div className="space-y-2">
                        <label className="label-style">Experience (Years)</label>
                        <div className="relative">
                            <FaStethoscope className="absolute right-4 top-5 text-gray-300"/>
                            <input name="experienceYears" value={profileData.experienceYears} onChange={handleTextChange} type="number" className="input-style" required />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="label-style">About Biography</label>
                        <textarea name="about" value={profileData.about} onChange={handleTextChange} rows="3" className="input-style resize-none" required />
                    </div>
                </div>
            </div>

            {/* Professional Credentials */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><FaGraduationCap/></div>
                    <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">Professional Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Dropdown Select Field for Qualification */}
                    <div className="space-y-2">
                        <label className="label-style">Qualification</label>
                        <div className="relative">
                            <select 
                                name="qualification" 
                                value="" 
                                onChange={(e) => {
                                    const selectedVal = e.target.value;
                                    if (selectedVal && !profileData.qualification.includes(selectedVal)) {
                                        setProfileData(prev => ({
                                            ...prev,
                                            qualification: [...(Array.isArray(prev.qualification) ? prev.qualification : []), selectedVal]
                                        }));
                                    }
                                }} 
                                className="input-style appearance-none bg-white pr-10"
                            >
                                <option value="">Select Qualification</option>
                                {qualificationsList.map((qual, idx) => (
                                    <option key={idx} value={qual}>{qual}</option>
                                ))}
                            </select>
                            <FaChevronDown className="absolute right-4 top-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Dropdown Select Field for Speciality */}
                    <div className="space-y-2">
                        <label className="label-style">Speciality</label>
                        <div className="relative">
                            <select 
                                name="speciality" 
                                value={profileData.speciality} 
                                onChange={handleTextChange} 
                                className="input-style appearance-none bg-white pr-10"
                            >
                                <option value="">Select Speciality</option>
                                {specialitiesList.map((spec, idx) => (
                                    <option key={idx} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <FaChevronDown className="absolute right-4 top-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Selected Qualifications Field (Removable Tags Container) */}
                    {Array.isArray(profileData.qualification) && profileData.qualification.length > 0 && (
                        <div className="md:col-span-2 space-y-2">
                            <label className="label-style">Selected Qualifications</label>
                            <div className="flex flex-wrap gap-2">
                                {profileData.qualification.map((qual, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-xs border border-blue-100">
                                        {qual} 
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setProfileData(prev => ({
                                                    ...prev,
                                                    qualification: prev.qualification.filter(item => item !== qual)
                                                }));
                                            }} 
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <FaTrash size={10}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="label-style">License Number</label>
                        <div className="relative">
                            <FaIdCard className="absolute right-4 top-5 text-gray-300"/>
                            <input name="licenseNumber" value={profileData.licenseNumber} onChange={handleTextChange} className="input-style" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="label-style">Default Slot (Mins)</label>
                        <div className="relative">
                            <FaClock className="absolute right-4 top-5 text-gray-300"/>
                            <input name="slotDuration" type="number" value={profileData.slotDuration} onChange={handleTextChange} className="input-style" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><FaAward/></div>
                        <h2 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tighter">Key Competencies</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {profileData.competencies.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-bold text-xs border border-yellow-100">
                                {item} <button type="button" onClick={() => removeCompetency(item)} className="text-red-400 hover:text-red-600"><FaTrash size={10}/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newCompetency} onChange={(e) => setNewCompetency(e.target.value)} placeholder="e.g. Surgery Specialist" className="input-style !py-3" />
                        <button type="button" onClick={addCompetency} className="px-6 bg-yellow-600 text-white rounded-xl active:scale-95 font-bold uppercase text-xs">Add</button>
                    </div>
                </div>
            </div>

            {/* Treated Conditions Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 text-red-600 rounded-xl"><FaMicroscope/></div>
                    <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">Conditions Treated</h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.treatedConditions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold text-xs border border-red-100">
                            {item} <button type="button" onClick={() => removeCondition(item)} className="text-red-400 hover:text-red-600"><FaTrash size={10}/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={newCondition} onChange={(e) => setNewCondition(e.target.value)} placeholder="e.g. Fever, Diabetes" className="input-style !py-3" />
                    <button type="button" onClick={addCondition} className="px-6 bg-red-600 text-white rounded-xl active:scale-95 font-bold uppercase text-xs">Add</button>
                </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FaMapMarkerAlt/></div>
                    <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">Location & Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="label-style">Country</label>
                        <input name="country" value={profileData.country} onChange={handleTextChange} className="input-style" />
                    </div>
                    <div className="space-y-2">
                        <label className="label-style">State</label>
                        <input name="state" value={profileData.state} onChange={handleTextChange} className="input-style" />
                    </div>
                    <div className="space-y-2">
                        <label className="label-style">City</label>
                        <input name="city" value={profileData.city} onChange={handleTextChange} className="input-style" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="label-style">Full Clinic Address</label>
                        <textarea name="address" value={profileData.address} onChange={handleTextChange} rows="2" className="input-style resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="label-style">Latitude</label>
                            <input name="lat" type="number" step="any" value={profileData.location.lat} onChange={handleLocationChange} className="input-style" />
                        </div>
                        <div className="space-y-2">
                            <label className="label-style">Longitude</label>
                            <input name="lng" type="number" step="any" value={profileData.location.lng} onChange={handleLocationChange} className="input-style" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Fees Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><FaWallet/></div>
                    <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">Consultation Fees</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {/* Video Consultation Card */}
                    <div className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaVideo size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-[#1e3a8a] uppercase tracking-tighter text-lg">Video Consultation</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Virtual Session</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-32">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Base Fee</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black">₹</span>
                                        <input name="online" value={profileData.fees.online} onChange={handleFeeChange} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-8 pr-3 font-black text-gray-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="w-32">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Duration</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="slotDuration" 
                                            value={profileData.slotDuration} 
                                            onChange={handleTextChange} 
                                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-4 pr-10 font-black text-gray-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
                                            placeholder="30"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase">Min</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={profileData.consultationStatus.online} 
                                        onChange={() => handleStatusToggle('online')} 
                                    />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Clinic Visit Card */}
                    <div className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaHospital size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-[#1e3a8a] uppercase tracking-tighter text-lg">Clinic Visit</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">In-Person Appointment</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-48">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Consultation Fee</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">₹</span>
                                        <input name="clinic" value={profileData.fees.clinic} onChange={handleFeeChange} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-8 pr-3 font-black text-gray-700 focus:ring-2 focus:ring-emerald-100 outline-none" />
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={profileData.consultationStatus.clinic} 
                                        onChange={() => handleStatusToggle('clinic')} 
                                    />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Home Visit Card - UPDATED WITH TRAVEL EXPENSES */}
                    <div className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaHome size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-[#1e3a8a] uppercase tracking-tighter text-lg">Home Visit</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Doctor at Doorstep</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-end gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-32">
                                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Visit Fee</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-black">₹</span>
                                            <input name="home" value={profileData.fees.home} onChange={handleFeeChange} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-8 pr-3 font-black text-gray-700 focus:ring-2 focus:ring-orange-100 outline-none" />
                                        </div>
                                    </div>
                                    <div className="w-40">
                                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Travel Expenses</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                                            <input 
                                                value={travelCharges} 
                                                readOnly 
                                                disabled
                                                className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-8 pr-3 font-black text-gray-500 outline-none cursor-not-allowed" 
                                            />
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-2 mt-4">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={profileData.consultationStatus.home} 
                                            onChange={() => handleStatusToggle('home')} 
                                        />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="flex items-center gap-4 px-12 py-6 bg-[#08B36A] hover:bg-green-600 text-white font-black rounded-[2rem] shadow-2xl shadow-green-200 transition-all active:scale-95 uppercase tracking-tighter">
                    {loading ? <FaSyncAlt className="animate-spin" /> : <><FaSave size={20}/> Save All Changes</>}
                </button>
            </div>
        </div>
      </form>

      <style jsx>{`
        .label-style { display: block; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; font-size: 0.65rem; color: #9ca3af; margin-bottom: 0.5rem; margin-left: 0.5rem; }
        .input-style { width: 100%; padding: 16px 20px; background-color: #f8fafc; border-radius: 1.5rem; border: 1px solid #f1f5f9; font-weight: 800; color: #1e293b; font-size: 0.95rem; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .input-style:focus { background-color: white; border-color: #08B36A; box-shadow: 0 15px 30px -10px rgba(8, 179, 106, 0.15); transform: translateY(-2px); }
        .input-style:disabled { cursor: not-allowed; opacity: 0.7; }
      `}</style>
    </div>
  )
}