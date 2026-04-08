"use client";
import React, { useState, useRef, useEffect } from "react";
import { useUserContext } from "@/app/context/UserContext";
import {
    FaUser, FaEnvelope, FaPhoneAlt, FaCamera, FaEdit,
    FaCheck, FaTimes, FaSpinner, FaMapMarkerAlt, FaGlobeAmericas,
    FaBirthdayCake, FaVenusMars, FaWeightHanging, FaRulerVertical,
    FaCity, FaUserFriends, FaCheckCircle
} from "react-icons/fa";

import ViewMembers from "./components/ViewMembers";
import EmergencyContacts from "./components/EmergencyContacts";
import SavedAddresses from "./components/SavedAddresses";
import UserAPI from "@/app/services/UserAPI";
import UpdateUserInsurance from "./components/UpdateUserInsurance";
import WorkDetailUser from "./components/WorkDetailUser";
import ConditionAndAllergy from "./components/ConditionAndAllergy";

function MyAccount() {
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [userData, setUserData] = useState(null);
    const [tempProfile, setTempProfile] = useState({});
    const [imageFile, setImageFile] = useState(null);

    const fileInputRef = useRef(null);

    // Get Backend URL from env
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Helper to determine Profile Picture Source
    const getProfilePicSrc = () => {
        // 1. If currently editing and a new image was just picked (Base64)
        if (isEditingProfile && tempProfile.profilePic && tempProfile.profilePic.startsWith("data:")) {
            return tempProfile.profilePic;
        }

        // 2. If user has a profile pic in the database
        if (userData?.profilePic) {
            // If it's already a full URL or base64, return it
            if (userData.profilePic.startsWith("http") || userData.profilePic.startsWith("data:")) {
                return userData.profilePic;
            }
            // Otherwise, prepend the Backend URL
            return `${BACKEND_URL}${userData.profilePic}`;
        }

        // 3. Fallback placeholder
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s";
    };

    // ------------------ FETCH COUNTRIES ------------------
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await getAllCountries();
                setCountries(data || []);
            } catch {
                console.error("Failed to load countries");
            }
        };
        fetchCountries();
    }, [getAllCountries]);

    const fetchStates = async (countryId) => {
        try {
            const data = await getStatesByCountry(countryId);
            setStates(data || []);
            setCities([]);
        } catch {
            console.error("Failed to load states");
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const data = await getCitiesByState(stateId);
            setCities(data || []);
        } catch {
            console.error("Failed to load cities");
        }
    };

    // ------------------ FETCH USER DATA ------------------
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const res = await UserAPI.getProfile();
                const data = res.data;
                setUserData(data);
                setTempProfile(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // ------------------ UPDATE PROFILE ------------------
    // 2. Updated Save Handler
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // A. Get location names
            const selectedCountry = countries.find(c => c.id == tempProfile.country);
            const selectedState = states.find(s => s.id == tempProfile.state);
            const selectedCity = cities.find(c => c.id == tempProfile.city);

            // B. CLEAN THE DATA (Remove MongoDB internals that cause 500 errors)
            // We only send the fields the user can actually change
            const profileToSave = {
                name: tempProfile.name,
                fatherName: tempProfile.fatherName,
                email: tempProfile.email,
                phone: tempProfile.phone,
                countryCode: tempProfile.countryCode,
                dob: tempProfile.dob,
                gender: tempProfile.gender,
                weight: tempProfile.weight,
                height: tempProfile.height,
                country: selectedCountry?.name || tempProfile.country,
                state: selectedState?.name || tempProfile.state,
                city: selectedCity?.name || tempProfile.city,
            };

            // C. DECIDE SEND METHOD (FormData is safer for images)
            let payload;

            // If there's a new image file, use FormData to avoid "500 Payload Too Large"
            if (imageFile) {
                payload = new FormData();
                Object.keys(profileToSave).forEach(key => payload.append(key, profileToSave[key]));
                payload.append("profilePic", imageFile);
            } else {
                // If no new image, send as clean JSON
                payload = profileToSave;
            }

            // D. Call API
            await UserAPI.updateProfile(payload);

            alert("Profile updated successfully!");
            setIsEditingProfile(false);
            // window.location.reload();
        } catch (error) {
            console.error("Save failed:", error.response?.data || error.message);
            // Alert the specific error from the server if available
            alert(error.response?.data?.message || "Failed to update profile (Server Error 500).");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempProfile(prev => ({ ...prev, [name]: value }));

        if (name === "country") {
            fetchStates(value);
            setTempProfile(prev => ({ ...prev, state: "", city: "" }));
        }
        if (name === "state") {
            fetchCities(value);
            setTempProfile(prev => ({ ...prev, city: "" }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // Store the actual file for FormData
            const reader = new FileReader();
            reader.onloadend = () => setTempProfile(p => ({ ...p, profilePic: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <FaSpinner className="animate-spin text-[#08b36a]" size={40} />
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* PROFILE SECTION */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            My Profile <FaCheckCircle className="text-[#08b36a]" />
                        </h1>

                        {!isEditingProfile && (
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="flex items-center gap-2 bg-[#08b36a] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#256f47]"
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        {/* Banner */}
                        <div className="h-28 bg-gradient-to-r from-[#08b36a] to-[#2f8f5b] relative">
                            <div className="absolute -bottom-10 left-10">
                                <div
                                    className={`relative ${isEditingProfile ? "cursor-pointer" : ""}`}
                                    onClick={() => isEditingProfile && fileInputRef.current.click()}
                                >
                                    <img
                                        src={getProfilePicSrc()}
                                        alt="Profile"
                                        className="w-28 h-28 rounded-3xl border-4 border-white object-cover bg-white"
                                    />
                                    {isEditingProfile && (
                                        <div className="absolute inset-0 bg-black/30 rounded-3xl flex items-center justify-center text-white">
                                            <FaCamera size={24} />
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                </div>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="pt-16 pb-8 px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* FULL NAME */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaUser /></span> Full Name
                                </label>
                                {isEditingProfile ? (
                                    <input name="name" type="text" value={tempProfile.name || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">{userData.name || "—"}</p>
                                )}
                            </div>

                            {/* FATHER NAME */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaUserFriends /></span> Father's Name
                                </label>
                                {isEditingProfile ? (
                                    <input name="fatherName" type="text" value={tempProfile.fatherName || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">{userData.fatherName || "—"}</p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaEnvelope /></span> Email
                                </label>
                                {isEditingProfile ? (
                                    <input name="email" type="email" value={tempProfile.email || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">{userData.email || "—"}</p>
                                )}
                            </div>

                            {/* PHONE */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaPhoneAlt /></span> Phone
                                </label>
                                {isEditingProfile ? (
                                    <div className="flex gap-1">
                                        <input name="countryCode" type="text" placeholder="+91" value={tempProfile.countryCode || ""} onChange={handleInputChange} className="w-16 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                        <input name="phone" type="tel" value={tempProfile.phone || ""} onChange={handleInputChange} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                    </div>
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">
                                        {userData.countryCode} {userData.phone || "—"}
                                    </p>
                                )}
                            </div>

                            {/* DOB */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaBirthdayCake /></span> Date of Birth
                                </label>
                                {isEditingProfile ? (
                                    <input name="dob" type="date" value={tempProfile.dob || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">{userData.dob || "—"}</p>
                                )}
                            </div>

                            {/* GENDER */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaVenusMars /></span> Gender
                                </label>
                                {isEditingProfile ? (
                                    <select name="gender" value={tempProfile.gender || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{userData.gender || "—"}</p>
                                )}
                            </div>

                            {/* WEIGHT */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaWeightHanging /></span> Weight
                                </label>
                                {isEditingProfile ? (
                                    <input name="weight" type="text" placeholder="61 kg" value={tempProfile.weight || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">{userData.weight || "—"}</p>
                                )}
                            </div>

                            {/* HEIGHT */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaRulerVertical /></span> Height
                                </label>
                                {isEditingProfile ? (
                                    <input name="height" type="text" placeholder="5'9" value={tempProfile.height || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]" />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm truncate">{userData.height || "—"}</p>
                                )}
                            </div>

                            {/* COUNTRY */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaGlobeAmericas /></span> Country
                                </label>
                                {isEditingProfile ? (
                                    <select name="country" value={tempProfile.country || ""} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]">
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{userData.country || "—"}</p>
                                )}
                            </div>

                            {/* STATE */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaMapMarkerAlt /></span> State
                                </label>
                                {isEditingProfile ? (
                                    <select name="state" value={tempProfile.state || ""} onChange={handleInputChange} disabled={!tempProfile.country} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]">
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{userData.state || "—"}</p>
                                )}
                            </div>

                            {/* CITY */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaCity /></span> City
                                </label>
                                {isEditingProfile ? (
                                    <select name="city" value={tempProfile.city || ""} onChange={handleInputChange} disabled={!tempProfile.state} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]">
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{userData.city || "—"}</p>
                                )}
                            </div>

                            {isEditingProfile && (
                                <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4">
                                    <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 bg-[#08b36a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#256f47]">
                                        {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Changes
                                    </button>
                                    <button onClick={() => { setIsEditingProfile(false); setTempProfile(userData); }} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200">
                                        <FaTimes /> Discard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <SavedAddresses addresses={userData.userAddress || []} userPhone={userData.phone} />
                <ViewMembers members={userData.familyMember || []} />
                <UpdateUserInsurance insurance={userData.insuranceDetails || []} />
                <EmergencyContacts contacts={userData.emergencyContact || []} />
                <WorkDetailUser work={userData.workDetails || []} />
                <ConditionAndAllergy userMedicalData={userData.conditionStatus || []} />
            </div>
        </div>
    );
}

export default MyAccount;