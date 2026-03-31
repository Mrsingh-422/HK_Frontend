"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "@/app/context/UserContext";
import { FiUser, FiMail, FiPhone, FiCamera, FiEdit2, FiCheck, FiX, FiLoader, FiMapPin } from "react-icons/fi";
import { HiOutlineCalendar, HiOutlineIdentification } from "react-icons/hi";
import { MdVerified, MdOutlineLocationCity, MdPublic } from "react-icons/md";

import ViewMembers from "./components/ViewMembers";
import EmergencyContacts from "./components/EmergencyContacts";
import SavedAddresses from "./components/SavedAddresses";
import UserAPI from "@/app/services/UserAPI";

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

    const fileInputRef = useRef(null);

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
    }, []);

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
                /*
                const res = await axios.get("/api/user/getProfile");
                const data = res.data;
                */
                // ----- Dummy Data -----
                // const data = {
                //     name: "John Doe",
                //     email: "johndoe@example.com",
                //     phone: "+91 9876543210",
                //     dob: "1995-08-15",
                //     gender: "Male",
                //     profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                //     country: "India",
                //     state: "Punjab",
                //     city: "Mohali",
                //     userAddress: [
                //         {
                //             id: 1,
                //             addressType: "Home",
                //             phone: "+91 9876543210",
                //             pincode: "160055",
                //             houseNo: "Flat 402",
                //             sector: "Sector 118",
                //             landmark: "Opp. Park",
                //             city: "Mohali",
                //             state: "Punjab",
                //             country: "India",
                //             isDefault: true
                //         }
                //     ],
                //     familyMember: [
                //         {
                //             id: 1,
                //             memberName: "Jane Doe",
                //             relation: "Spouse",
                //             age: 28,
                //             phone: "+91 9876543211",
                //             gender: "Female",
                //             profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                //         }
                //     ],
                //     emergencyContact: [
                //         {
                //             id: 1,
                //             contactName: "Robert Fox",
                //             phone: "+91 9988776655",
                //             relation: "Brother"
                //         }
                //     ]
                // };

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
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {

            const selectedCountry = countries.find(c => c.id == tempProfile.country);
            const selectedState = states.find(s => s.id == tempProfile.state);
            const selectedCity = cities.find(c => c.id == tempProfile.city);

            const finalData = {
                ...tempProfile,
                country: selectedCountry?.name || tempProfile.country,
                state: selectedState?.name || tempProfile.state,
                city: selectedCity?.name || tempProfile.city
            };

            await UserAPI.updateProfile(finalData);

            /*
            await axios.put("/api/user/updateProfile", {
                type: "profile",
                data: finalData
            });
            */

            setUserData(finalData);
            setTempProfile(finalData);
            setIsEditingProfile(false);

        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const updateUserDataField = async (fieldType, itemId, singleItemData) => {
        try {
            // Map the field names to the "type" expected by your backend route
            const typeMapping = {
                userAddress: "address",
                familyMember: "family",
                emergencyContact: "emergency"
            };

            const backendType = typeMapping[fieldType];

            // If itemId exists, it's an EDIT. If not, it's an ADD.
            // Note: If your backend route ONLY handles edits, 
            // you might still use the general updateProfile for new additions.

            if (itemId) {
                // Call the specific sub-item edit API
                const res = await UserAPI.updateSubItem(backendType, itemId, singleItemData);
                // The server usually returns the full updated user profile
                setUserData(res.data);
                setTempProfile(res.data);
            } else {
                // If it's a new item without an ID, use the general update
                // This sends the whole array including the new item
                const payload = { [fieldType]: [...userData[fieldType], singleItemData] };
                const res = await UserAPI.updateProfile(payload);
                setUserData(res.data);
                setTempProfile(res.data);
            }

            alert("Updated successfully");
        } catch (error) {
            console.error("Update failed", error);
            alert("Error updating item");
        }
    };

    // ------------------ UPDATED DELETE ------------------
    const deleteItem = async (fieldType, itemId) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        try {
            // Filter the item out locally first for the payload
            const updatedList = userData[fieldType].filter(item => (item._id !== itemId && item.id !== itemId));

            // Send the updated array to the general update API
            const res = await UserAPI.updateProfile({ [fieldType]: updatedList });

            setUserData(res.data);
            setTempProfile(res.data);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };


    // ------------------ INPUT HANDLERS ------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setTempProfile(prev => ({
            ...prev,
            [name]: value
        }));

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
            const reader = new FileReader();
            reader.onloadend = () =>
                setTempProfile(p => ({
                    ...p,
                    profilePic: reader.result
                }));
            reader.readAsDataURL(file);
        }
    };

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <FiLoader className="animate-spin text-[#08b36a]" size={40} />
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">

            <div className="max-w-4xl mx-auto space-y-10">

                {/* PROFILE SECTION */}

                <section>

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            My Profile <MdVerified className="text-[#08b36a]" />
                        </h1>

                        {!isEditingProfile && (

                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="flex items-center gap-2 bg-[#08b36a] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#256f47]"
                            >
                                <FiEdit2 /> Edit Profile
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
                                        // src={isEditingProfile ? tempProfile.profilePic : userData.profilePic}
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s"
                                        alt="Profile"
                                        className="w-28 h-28 rounded-3xl border-4 border-white object-cover bg-white"
                                    />

                                    {isEditingProfile && (

                                        <div className="absolute inset-0 bg-black/30 rounded-3xl flex items-center justify-center text-white">
                                            <FiCamera size={24} />
                                        </div>

                                    )}

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />

                                </div>

                            </div>

                        </div>

                        {/* Fields */}

                        <div className="pt-16 pb-8 px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {[
                                { label: "Full Name", name: "name", icon: <FiUser />, type: "text" },
                                { label: "Email", name: "email", icon: <FiMail />, type: "email" },
                                { label: "Phone", name: "phone", icon: <FiPhone />, type: "tel" },
                                { label: "DOB", name: "dob", icon: <HiOutlineCalendar />, type: "date" },
                            ].map((field) => (

                                <div key={field.name} className="space-y-1">

                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-[#08b36a]">{field.icon}</span> {field.label}
                                    </label>

                                    {isEditingProfile ? (

                                        <input
                                            name={field.name}
                                            type={field.type}
                                            value={tempProfile[field.name] || ""}
                                            onChange={handleInputChange}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                                        />

                                    ) : (

                                        <p className="text-gray-800 font-bold text-sm truncate">
                                            {userData[field.name] || "—"}
                                        </p>

                                    )}

                                </div>

                            ))}

                            {/* COUNTRY */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><MdPublic /></span> Country
                                </label>

                                {isEditingProfile ? (

                                    <select
                                        name="country"
                                        value={tempProfile.country || ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                                    >
                                        <option value="">Country</option>
                                        {countries.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>

                                ) : (

                                    <p className="text-gray-800 font-bold text-sm">{userData.country}</p>

                                )}
                            </div>

                            {/* STATE */}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FiMapPin /></span> State
                                </label>

                                {isEditingProfile ? (

                                    <select
                                        name="state"
                                        value={tempProfile.state || ""}
                                        onChange={handleInputChange}
                                        disabled={!tempProfile.country}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                                    >
                                        <option value="">State</option>
                                        {states.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>

                                ) : (

                                    <p className="text-gray-800 font-bold text-sm">{userData.state}</p>

                                )}
                            </div>


                            {/* city  */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><MdOutlineLocationCity /></span> City
                                </label>

                                {isEditingProfile ? (

                                    <select
                                        name="city"
                                        value={tempProfile.city || ""}
                                        onChange={handleInputChange}
                                        disabled={!tempProfile.state}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                                    >
                                        <option value="">City</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>

                                ) : (

                                    <p className="text-gray-800 font-bold text-sm">{userData.city}</p>

                                )}
                            </div>

                            {/* GENDER */}

                            <div className="space-y-1">

                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <HiOutlineIdentification className="text-[#08b36a]" /> Gender
                                </label>

                                {isEditingProfile ? (

                                    <select
                                        name="gender"
                                        value={tempProfile.gender}
                                        onChange={handleInputChange}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>

                                ) : (

                                    <p className="text-gray-800 font-bold text-sm">{userData.gender}</p>

                                )}

                            </div>

                            {isEditingProfile && (

                                <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4">

                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="flex-1 bg-[#08b36a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <FiLoader className="animate-spin" /> : <FiCheck />} Save
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setTempProfile(userData);
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                    >
                                        <FiX /> Discard
                                    </button>

                                </div>

                            )}

                        </div>
                    </div>
                </section>

                <SavedAddresses
                    addresses={userData.userAddress || []}
                    onUpdate={(itemId, data) => updateUserDataField("userAddress", itemId, data)}
                    onDelete={(itemId) => deleteItem("userAddress", itemId)}
                    userPhone={userData.phone}
                />

                <ViewMembers
                    members={userData.familyMember || []}
                    onUpdate={(itemId, data) => updateUserDataField("familyMember", itemId, data)}
                    onDelete={(itemId) => deleteItem("familyMember", itemId)}
                />

                <EmergencyContacts
                    contacts={userData.emergencyContact || []}
                    onUpdate={(itemId, data) => updateUserDataField("emergencyContact", itemId, data)}
                    onDelete={(itemId) => deleteItem("emergencyContact", itemId)}
                />
            </div>
        </div>
    );
}

export default MyAccount;