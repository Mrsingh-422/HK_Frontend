"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiUser, FiMail, FiPhone, FiCamera, FiEdit2, FiCheck, FiX, FiLoader, FiMapPin } from "react-icons/fi";
import { HiOutlineCalendar, HiOutlineIdentification } from "react-icons/hi";
import { MdVerified, MdOutlineLocationCity, MdPublic } from "react-icons/md";

import ViewMembers from "./components/ViewMembers";
import EmergencyContacts from "./components/EmergencyContacts";
import SavedAddresses from "./components/SavedAddresses";

function MyAccount() {

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false); 

    const [userData, setUserData] = useState(null);
    const [tempProfile, setTempProfile] = useState({});

    const fileInputRef = useRef(null);

    // ------------------ FETCH USER DATA ------------------
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                /*
                const res = await axios.get("/api/user/getProfile");
                const data = res.data;
                */
                // ----- Dummy Data -----
                const data = {
                    name: "John Doe",
                    email: "johndoe@example.com",
                    phone: "+91 9876543210",
                    dob: "1995-08-15",
                    gender: "Male",
                    profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                    country: "India",
                    state: "Punjab",
                    city: "Mohali",
                    userAddress: [
                        {
                            id: 1,
                            addressType: "Home",
                            phone: "+91 9876543210",
                            pincode: "160055",
                            houseNo: "Flat 402",
                            sector: "Sector 118",
                            landmark: "Opp. Park",
                            city: "Mohali",
                            state: "Punjab",
                            country: "India",
                            isDefault: true
                        }
                    ],
                    familyMember: [
                        {
                            id: 1,
                            memberName: "Jane Doe",
                            relation: "Spouse",
                            age: 28,
                            phone: "+91 9876543211",
                            gender: "Female",
                            profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                        }
                    ],
                    emergencyContact: [
                        {
                            id: 1,
                            contactName: "Robert Fox",
                            phone: "+91 9988776655",
                            relation: "Brother"
                        }
                    ]
                };

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
            /*
            await axios.put("/api/user/updateProfile", {
                type: "profile",
                data: tempProfile
            });
            */
            setUserData(tempProfile);
            setIsEditingProfile(false);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // ------------------ GENERIC UPDATE ------------------
    const updateUserDataField = async (field, newData) => {
        try {
            /*
            await axios.put("/api/user/updateProfile", {
                type: field,
                data: newData
            });
            */

            setUserData(prev => ({
                ...prev,
                [field]: newData
            }));
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    // ------------------ GENERIC DELETE ------------------
    const deleteItem = async (type, id) => {
        try {
            /*
            await axios.delete("/api/user/delete", {
                data: {
                    type: type,
                    id: id
                }
            });
            */
            setUserData(prev => ({
                ...prev,
                [type]: prev[type].filter(item => item.id !== id)
            }));
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
                                        src={isEditingProfile ? tempProfile.profilePic : userData.profilePic}
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
                                { label: "City", name: "city", icon: <MdOutlineLocationCity />, type: "text" },
                                { label: "State", name: "state", icon: <FiMapPin />, type: "text" },
                                { label: "Country", name: "country", icon: <MdPublic />, type: "text" },
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
                    addresses={userData.userAddress}
                    onUpdate={(newList) => updateUserDataField("userAddress", newList)}
                    userName={userData.name}
                    userPhone={userData.phone}
                />

                <ViewMembers
                    members={userData.familyMember}
                    onUpdate={(newList) => updateUserDataField("familyMember", newList)}
                />

                <EmergencyContacts
                    contacts={userData.emergencyContact}
                    onUpdate={(newList) => updateUserDataField("emergencyContact", newList)}
                />

            </div>
        </div>
    );
}

export default MyAccount;