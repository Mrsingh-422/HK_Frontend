"use client";
import React, { useState, useRef } from "react";
// Icons
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiCamera,
    FiEdit2, FiCheck, FiX
} from "react-icons/fi";
import {
    HiOutlineCalendar, HiOutlineIdentification, HiPlus,
    HiOutlineTrash, HiOutlinePencilAlt, HiOutlineLocationMarker, HiX
} from "react-icons/hi";
import { MdVerified, MdOutlineAddLocationAlt } from "react-icons/md";

function MyAccount() {
    // --- 1. PROFILE STATE ---
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const fileInputRef = useRef(null);
    const [user, setUser] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "+91 9876543210",
        gender: "Male",
        dob: "1995-08-15",
        memberSince: "Oct 2023",
        profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
    });
    const [tempUser, setTempUser] = useState({ ...user });

    // --- 2. ADDRESSES STATE ---
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            tag: "Home",
            name: "John Doe",
            phone: "+91 9876543210",
            address: "TDI City, Sector 118, Mohali, Punjab",
            isDefault: true,
        },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressFormData, setAddressFormData] = useState({
        id: null, tag: "Home", name: "", phone: "", address: "", isDefault: false,
    });

    // --- PROFILE HANDLERS ---
    const handleProfileEditToggle = () => {
        setTempUser({ ...user });
        setIsEditingProfile(true);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setTempUser((prev) => ({ ...prev, [name]: value }));
    };

    const saveProfile = () => {
        setUser({ ...tempUser });
        setIsEditingProfile(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTempUser(p => ({ ...p, profilePic: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    // --- ADDRESS HANDLERS ---
    const openAddressModal = (addr = null) => {
        if (addr) {
            setAddressFormData(addr);
            setIsEditingAddress(true);
        } else {
            setAddressFormData({ id: null, tag: "Home", name: user.name, phone: user.phone, address: "", isDefault: false });
            setIsEditingAddress(false);
        }
        setIsModalOpen(true);
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (isEditingAddress) {
            setAddresses(addresses.map(a => a.id === addressFormData.id ? addressFormData : a));
        } else {
            setAddresses([...addresses, { ...addressFormData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const deleteAddress = (id) => {
        if (confirm("Delete this address?")) setAddresses(addresses.filter(a => a.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 md:py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* --- SECTION 1: PROFILE INFO --- */}
                <section>
                    <div className="flex flex-row justify-between items-center mb-6">
                        <div className="text-left">
                            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                                My Profile <MdVerified className="text-[#08b36a] shrink-0" />
                            </h1>
                            <p className="text-gray-500 text-xs md:text-sm">Account details and settings</p>
                        </div>
                        {!isEditingProfile && (
                            <button
                                onClick={handleProfileEditToggle}
                                className="flex items-center gap-2 bg-[#08b36a] text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md hover:bg-[#256f47] transition-all shrink-0"
                            >
                                <FiEdit2 /> <span className="hidden xs:inline">Edit Profile</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        {/* Banner & Avatar Left Aligned */}
                        <div className="h-24 md:h-28 bg-gradient-to-r from-[#08b36a] to-[#2f8f5b] relative">
                            <div className="absolute -bottom-10 left-6 md:left-12">
                                <div className={`relative group ${isEditingProfile ? "cursor-pointer" : ""}`} onClick={() => isEditingProfile && fileInputRef.current.click()}>
                                    <img
                                        src={isEditingProfile ? tempUser.profilePic : user.profilePic}
                                        alt="Profile"
                                        className="w-24 h-24 md:w-28 md:h-28 rounded-2xl md:rounded-3xl border-4 border-white object-cover shadow-lg"
                                    />
                                    {isEditingProfile && (
                                        <div className="absolute inset-0 bg-black/30 rounded-2xl md:rounded-3xl flex items-center justify-center text-white">
                                            <FiCamera size={24} />
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                </div>
                            </div>
                        </div>

                        {/* Form Fields - Left Aligned */}
                        <div className="pt-16 pb-8 px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-6">
                            {[
                                { label: "Full Name", name: "name", icon: <FiUser />, value: user.name, type: "text" },
                                { label: "Email Address", name: "email", icon: <FiMail />, value: user.email, type: "email" },
                                { label: "Phone Number", name: "phone", icon: <FiPhone />, value: user.phone, type: "tel" },
                                { label: "Date of Birth", name: "dob", icon: <HiOutlineCalendar />, value: user.dob, type: "date" },
                            ].map((field) => (
                                <div key={field.name} className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-[#08b36a]">{field.icon}</span> {field.label}
                                    </label>
                                    {isEditingProfile ? (
                                        <input
                                            name={field.name}
                                            type={field.type}
                                            value={tempUser[field.name]}
                                            onChange={handleProfileChange}
                                            className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-[#42b883] focus:bg-white rounded-xl outline-none text-sm font-bold transition-all"
                                        />
                                    ) : (
                                        <p className="text-gray-800 font-bold px-1 text-sm md:text-base">{field.value}</p>
                                    )}
                                </div>
                            ))}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <HiOutlineIdentification className="text-[#08b36a]" /> Gender
                                </label>
                                {isEditingProfile ? (
                                    <select name="gender" value={tempUser.gender} onChange={handleProfileChange} className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-[#42b883] focus:bg-white rounded-xl outline-none text-sm font-bold transition-all">
                                        <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-bold px-1 text-sm md:text-base">{user.gender}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <MdVerified className="text-[#08b36a]" /> Status
                                </label>
                                <p className="text-[#08b36a] font-bold px-1 text-xs uppercase pt-1">Active since {user.memberSince}</p>
                            </div>

                            {isEditingProfile && (
                                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                    <button onClick={saveProfile} className="w-full sm:flex-1 bg-[#08b36a] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#256f47] transition-all active:scale-[0.98] shadow-md shadow-green-100">
                                        <FiCheck size={18} /> Save Changes
                                    </button>
                                    <button onClick={() => setIsEditingProfile(false)} className="w-full sm:flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98]">
                                        <FiX size={18} /> Discard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* --- SECTION 2: SAVED ADDRESSES --- */}
                <section>
                    <div className="flex flex-row justify-between items-center mb-6">
                        <div className="text-left">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Saved Addresses</h2>
                            <p className="text-gray-500 text-xs md:text-sm">Manage your delivery locations</p>
                        </div>
                        <button
                            onClick={() => openAddressModal()}
                            className="flex items-center gap-2 bg-white border-2 border-[#08b36a] text-[#08b36a] px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-green-50 transition-all shadow-sm shrink-0 active:scale-[0.98]"
                        >
                            <HiPlus size={18} /> <span className="hidden xs:inline">Add New</span>
                        </button>
                    </div>

                    {addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${addr.isDefault ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {addr.tag} {addr.isDefault && "• Default"}
                                        </span>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openAddressModal(addr)} className="p-2 text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors"><HiOutlinePencilAlt size={16} /></button>
                                            <button onClick={() => deleteAddress(addr.id)} className="p-2 text-red-600 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors"><HiOutlineTrash size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 text-left">
                                        <div className="flex items-center gap-2.5 text-gray-800 font-bold text-sm">
                                            <FiUser className="text-[#08b36a] shrink-0" size={16} />
                                            <span className="truncate">{addr.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-gray-600 text-[13px] font-medium">
                                            <FiPhone className="text-[#08b36a] shrink-0" size={16} />
                                            {addr.phone}
                                        </div>
                                        <div className="flex items-start gap-2.5 text-gray-500 text-[13px] leading-relaxed pt-1 border-t border-gray-50">
                                            <HiOutlineLocationMarker className="text-[#08b36a] shrink-0 mt-0.5" size={18} />
                                            <span className="line-clamp-2">{addr.address}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-center py-10 px-6 bg-white rounded-[24px] border-2 border-dashed border-gray-100">
                            <MdOutlineAddLocationAlt size={40} className="text-gray-200 mb-3" />
                            <h3 className="text-gray-800 font-bold text-sm mb-1">No addresses saved</h3>
                            <p className="text-gray-400 text-xs mb-4">Add your home or office address for faster checkout.</p>
                            <button onClick={() => openAddressModal()} className="text-[#08b36a] font-bold text-sm underline flex items-center gap-1">Add your first address <HiPlus /></button>
                        </div>
                    )}
                </section>
            </div>

            {/* --- MOBILE-OPTIMIZED MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#08b36a] p-5 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{isEditingAddress ? "Edit Address" : "Add New Address"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><HiX size={24} /></button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAddressSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Save address as</label>
                                <div className="flex gap-2">
                                    {["Home", "Office", "Other"].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setAddressFormData({ ...addressFormData, tag: t })}
                                            className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-extrabold transition-all ${addressFormData.tag === t ? "border-[#08b36a] bg-green-50 text-[#08b36a]" : "border-gray-50 text-gray-400 hover:border-gray-100"}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <input required placeholder="Full Name" value={addressFormData.name} onChange={e => setAddressFormData({ ...addressFormData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#08b36a]/20 text-sm font-semibold transition-all border border-transparent focus:bg-white" />
                                </div>
                                <div className="group">
                                    <input required type="tel" placeholder="Phone Number" value={addressFormData.phone} onChange={e => setAddressFormData({ ...addressFormData, phone: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#08b36a]/20 text-sm font-semibold transition-all border border-transparent focus:bg-white" />
                                </div>
                                <div className="group">
                                    <textarea required rows="3" placeholder="Complete Address (Flat No, Street, Landmark...)" value={addressFormData.address} onChange={e => setAddressFormData({ ...addressFormData, address: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#08b36a]/20 text-sm font-semibold transition-all border border-transparent focus:bg-white resize-none" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                <input type="checkbox" checked={addressFormData.isDefault} onChange={e => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })} className="w-5 h-5 accent-[#08b36a] rounded-lg cursor-pointer transition-all" />
                                <span className="text-[13px] text-gray-500 font-bold group-hover:text-gray-700">Set as default address</span>
                            </label>

                            <button type="submit" className="w-full py-4 bg-[#08b36a] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-green-100 hover:bg-[#256f47] transition-all active:scale-[0.98]">
                                {isEditingAddress ? "Update Address" : "Save Address"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyAccount;