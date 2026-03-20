'use client'
import React, { useState } from 'react'
import { 
    FaUserNurse, FaPlus, FaCheckCircle, FaTimesCircle, 
    FaEdit, FaTrashAlt, FaInfoCircle, FaEye, FaMoneyBillWave, FaStethoscope, FaListUl,
    FaCloudUploadAlt, FaPlusCircle, FaBoxOpen
} from 'react-icons/fa'

export default function MyServicesPage() {
    const [activeMainTab, setActiveMainTab] = useState('Daily Nursing');
    const [activeStatusTab, setActiveStatusTab] = useState('Approved');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // --- VIEW MODAL STATE ---
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // --- MOCK DATA ---
    const dailyNursingData = [
        {
            id: 1,
            category: 'Home Nursing Care',
            count: 'Name: 2',
            description: 'Specialized nursing care for cancer patients including chemotherapy support and pain management.',
            totalPrice: '10358.91',
            oneTime: '100',
            multipleTime: '100',
            perHour: '100',
            status: 'Approved',
            consumables: 'Syringes, Injections, Spirit, Cotton',
            procedure: 'Vital monitoring, IV fluid administration, dressing',
            serviceOffered: 'NURSING CARE'
        },
        {
            id: 2,
            category: 'Home Personal Care',
            count: 'Name: 2',
            description: 'Assistance with daily living activities and personal hygiene for elderly patients.',
            totalPrice: '10358.91',
            oneTime: '100',
            multipleTime: '100',
            perHour: '100',
            status: 'Approved',
            consumables: 'Gloves, Bed sheets, Sanitizer',
            procedure: 'Bathing, Feeding, Mobility assistance',
            serviceOffered: 'PERSONAL CARE'
        },
        {
            id: 3,
            category: 'Home Nursing Care',
            count: 'Name: cancer care',
            description: 'Personalized attention. Feeding Tubes, Hoyer Lift, Catheter, Tracheotomy. Private rooms.',
            totalPrice: '0',
            oneTime: '0',
            multipleTime: '0',
            perHour: '0',
            status: 'Pending',
            consumables: 'N/A',
            procedure: 'N/A',
            serviceOffered: 'NURSING CARE'
        },
        {
            id: 4,
            category: 'Home Personal Care',
            count: 'Name: patient care nurse',
            description: 'Personalized attention. Feeding Tubes, Hoyer Lift, Catheter, Tracheotomy.',
            totalPrice: '0',
            oneTime: '0',
            multipleTime: '0',
            perHour: '0',
            status: 'Pending',
            consumables: 'N/A',
            procedure: 'N/A',
            serviceOffered: 'PERSONAL CARE'
        },
        {
            id: 5,
            category: 'Home Personal Care',
            count: 'Name: skin care nurse',
            description: 'Affordable Senior Home Care. Call For a Free, No Obligation Consult.',
            totalPrice: '1200',
            oneTime: '400',
            multipleTime: '800',
            perHour: '150',
            status: 'Pending',
            consumables: 'N/A',
            procedure: 'N/A',
            serviceOffered: 'PERSONAL CARE'
        },
        {
            id: 6,
            category: 'Home Personal Care',
            count: 'Name: 2',
            description: 'cancer care',
            totalPrice: '10358.91',
            oneTime: '500',
            multipleTime: '1000',
            perHour: '200',
            status: 'Rejected',
            consumables: 'N/A',
            procedure: 'N/A',
            serviceOffered: 'PERSONAL CARE'
        },
        {
            id: 7,
            category: 'Home Personal Care',
            count: 'Name: skin care nurse',
            description: 'Affordable Senior Home Care. Call For a Free, No Obligation Consult. Giving people the help they need to live in the place.',
            totalPrice: '540.531',
            oneTime: '200',
            multipleTime: '400',
            perHour: '100',
            status: 'Rejected',
            consumables: 'N/A',
            procedure: 'N/A',
            serviceOffered: 'PERSONAL CARE'
        }
    ];

    // --- PACKAGE MOCK DATA ---
    const myPackagesData = [
        { id: 101, category: 'Elderly Care', name: 'Nitish', description: 'Comprehensive monthly checkup package.', totalPrice: '12', status: 'Approved', type: 'Package' },
        { id: 102, category: 'Dermatology', name: 'Skin', description: '100 daily skin monitoring and care.', totalPrice: '100', status: 'Approved', type: 'Package' },
        { id: 103, category: 'Nursing', name: 'New nurse pac', description: 'Post-surgery recovery package.', totalPrice: '1200', status: 'Approved', type: 'Package' },
        { id: 104, category: 'Personal Care', name: 'Nitish', description: 'Daily assistance with basic tasks.', totalPrice: '1200', status: 'Approved', type: 'Package' },
        { id: 105, category: 'Special Needs', name: 'kuchhbhi', description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...", totalPrice: '600', status: 'Approved', type: 'Package' }
    ];

    // Filter logic
    const filteredData = dailyNursingData.filter(item => item.status === activeStatusTab);
    const filteredPackages = myPackagesData.filter(item => item.status === activeStatusTab);

    // --- HANDLERS ---
    const handleViewDetails = (item) => {
        setSelectedService(item);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedService(null);
    };

    return (
        <div className=" bg-[#F9FAFB] min-h-screen font-sans">
            
            {/* --- TOP HEADER --- */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-[#1e5a91]">My Services</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#08B36A] hover:bg-[#069a5a] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all"
                >
                    <FaPlus size={12} /> {activeMainTab === 'Daily Nursing' ? 'Add Service' : 'Add Package'}
                </button>
            </div>

            {/* --- MAIN TABS --- */}
            <div className="flex gap-3 mb-6">
                {['Daily Nursing', 'My Packages'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveMainTab(tab); setActiveStatusTab('Approved'); }}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                            activeMainTab === tab ? 'bg-[#32B97D] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="space-y-4">
                {/* Status Tabs */}
                <div className="flex gap-2 mb-4">
                    {['Approved', 'Pending', 'Rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveStatusTab(status)}
                            className={`px-5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                activeStatusTab === status ? 'bg-[#32B97D] text-white border-[#32B97D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#32B97D]'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">
                                        {activeMainTab === 'Daily Nursing' ? 'Service Name' : 'Package Name'}
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">Pricing</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(activeMainTab === 'Daily Nursing' ? filteredData : filteredPackages).length > 0 ? (
                                    (activeMainTab === 'Daily Nursing' ? filteredData : filteredPackages).map((item) => (
                                        <tr 
                                            key={item.id} 
                                            onClick={() => handleViewDetails(item)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activeMainTab === 'Daily Nursing' ? 'bg-green-50 text-[#32B97D]' : 'bg-blue-50 text-blue-500'}`}>
                                                        {activeMainTab === 'Daily Nursing' ? <FaUserNurse size={16} /> : <FaBoxOpen size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800 text-sm group-hover:text-[#08B36A] transition-colors">
                                                            {activeMainTab === 'Daily Nursing' ? item.category : `Name: ${item.name}`}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            {activeMainTab === 'Daily Nursing' ? item.serviceOffered : item.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-gray-800 text-sm font-mono tracking-tighter">₹{item.totalPrice}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${
                                                    item.status === 'Approved' ? 'bg-green-50 text-[#32B97D] border-green-100' :
                                                    item.status === 'Pending' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                                                    'bg-red-50 text-red-500 border-red-100'
                                                }`}>
                                                    {item.status === 'Approved' ? <FaCheckCircle size={8}/> : <FaInfoCircle size={8}/>} {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleViewDetails(item)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all" title="View Detail">
                                                        <FaEye size={14} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-all">
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <FaTrashAlt size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="py-12 text-center text-gray-400 text-sm">No {activeStatusTab} Data Found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Add Button for Packages (per image) */}
                {activeMainTab === 'My Packages' && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#1D8348] hover:bg-[#196F3D] text-white px-20 py-2 rounded-lg text-sm font-bold shadow-md transition-all"
                        >
                            Add
                        </button>
                    </div>
                )}
            </div>

          {/* --- ADD MODAL (Switches between Service and Package based on Tab) --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* Width switches: max-w-4xl for detailed Service form, max-w-lg for Package form */}
                    <div className={`bg-white w-full ${activeMainTab === 'Daily Nursing' ? 'max-w-4xl' : 'max-w-lg'} rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300`}>
                        
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeMainTab === 'Daily Nursing' ? 'Add New Service' : 'Add New Packages'}
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-8 max-h-[80vh] overflow-y-auto bg-[#FAFBFC]">
                            {activeMainTab === 'Daily Nursing' ? (
                                /* --- ADD NEW SERVICE FORM --- */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-600">Category</label>
                                        <select className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] text-sm bg-white">
                                            <option>Select Category</option>
                                            <option>Home Nursing Care</option>
                                            <option>Home Personal Care</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-600">Name</label>
                                        <select className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] text-sm bg-white">
                                            <option>Select subCategory</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-600">Nursing Service Photo</label>
                                        <div className="flex items-center gap-3">
                                            <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                                                Choose File
                                                <input type="file" className="hidden" />
                                            </label>
                                            <span className="text-xs text-gray-400">No file chosen</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex items-center gap-6 py-2">
                                        <label className="text-[13px] font-bold text-gray-600">Prescription Required ?</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input type="radio" name="prescription" className="accent-[#08B36A]" /> yes
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input type="radio" name="prescription" className="accent-[#08B36A]" /> Not Required
                                            </label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-600">Nursing Service Description</label>
                                        <textarea placeholder="Lorem Ipsum is simply dummy text of the..." className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] text-sm h-24 resize-none shadow-sm"></textarea>
                                    </div>

                                    {[
                                        { label: "Nursing Service Price", placeholder: "Enter price" },
                                        { label: "Consumables Used", placeholder: "e.g. Injections, Spirit" },
                                        { label: "Procedure Included", placeholder: "e.g. done professionally" },
                                        { label: "Service Offered", placeholder: "NURSING CARE" },
                                        { label: "For one day one time price", placeholder: "0.00" },
                                        { label: "For Multiple days price", placeholder: "0.00" },
                                        { label: "For per Hours price", placeholder: "0.00" },
                                    ].map((field, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <label className="text-[13px] font-bold text-gray-600">{field.label}</label>
                                            <input type="text" placeholder={field.placeholder} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] text-sm shadow-sm" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* --- ADD NEW PACKAGE FORM (MATCHING SCREENSHOT) --- */
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Services</label>
                                        <select className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm">
                                            <option>Select Category</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Package name</label>
                                        <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm outline-none" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 block">Nursing Service Photo</label>
                                        <div className="flex items-center gap-2">
                                            <label className="px-3 py-1 border border-gray-400 bg-gray-100 rounded text-xs cursor-pointer hover:bg-gray-200">
                                                Choose File
                                                <input type="file" className="hidden" />
                                            </label>
                                            <span className="text-xs text-gray-500">No file chosen</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-gray-700">Prescription Required ?</label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="pkg_presc" /> yes</label>
                                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="pkg_presc" /> Not Required</label>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Nursing Service Description</label>
                                        <input type="text" placeholder="Type.........." className="w-full p-2 border border-gray-300 rounded text-sm outline-none" />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Nursing service price</label>
                                        <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm outline-none" />
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex justify-start">
                                <button className="bg-[#32B97D] hover:bg-[#28a36d] text-white font-bold px-12 py-3 rounded-lg text-sm transition-all shadow-md active:scale-95 uppercase tracking-wider">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

             {/* --- VIEW DETAILS MODAL --- */}
            {isViewModalOpen && selectedService && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        
                        <div className="bg-[#08B36A] p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FaUserNurse size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold leading-none">
                                        {activeMainTab === 'Daily Nursing' ? selectedService.category : selectedService.name}
                                    </h2>
                                    <p className="text-xs text-green-50 mt-1 uppercase tracking-widest">
                                        {activeMainTab === 'Daily Nursing' ? selectedService.serviceOffered : 'PACKAGE DETAILS'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeViewModal} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-[#08B36A] font-bold text-sm">
                                        <FaMoneyBillWave /> PRICING BREAKDOWN
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between bg-green-50/50 p-3 rounded-xl border border-green-50">
                                            <span className="text-xs text-gray-500 font-bold">Total Price</span>
                                            <span className="text-sm font-black text-[#08B36A]">₹{selectedService.totalPrice || selectedService.price}</span>
                                        </div>
                                        {activeMainTab === 'Daily Nursing' && (
                                            <div className="space-y-2 px-1">
                                                <div className="flex justify-between text-xs"><span className="text-gray-400">One Time</span> <span className="font-bold text-gray-700">₹{selectedService.oneTime}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-400">Multiple Time</span> <span className="font-bold text-gray-700">₹{selectedService.multipleTime}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-400">Per Hour</span> <span className="font-bold text-gray-700">₹{selectedService.perHour}</span></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-[#08B36A] font-bold text-sm">
                                        <FaStethoscope /> DETAILS
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {activeMainTab === 'Daily Nursing' ? 'Consumables Used' : 'Category'}
                                            </label>
                                            <p className="text-xs text-gray-600 mt-1 italic leading-relaxed">
                                                {activeMainTab === 'Daily Nursing' ? selectedService.consumables : selectedService.category}
                                            </p>
                                        </div>
                                        {activeMainTab === 'Daily Nursing' && (
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Procedure Included</label>
                                                <p className="text-xs text-gray-600 mt-1 italic leading-relaxed">{selectedService.procedure}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-xs uppercase tracking-wider">
                                        <FaListUl className="text-[#08B36A]" /> Description
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        {selectedService.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end">
                            <button 
                                onClick={closeViewModal} 
                                className="px-10 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-300 transition-all uppercase tracking-widest"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {/* --- VIEW DETAILS MODAL --- */}
            {isViewModalOpen && selectedService && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        
                        <div className="bg-[#08B36A] p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FaUserNurse size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold leading-none">{selectedService.category}</h2>
                                    <p className="text-xs text-green-50 mt-1 uppercase tracking-widest">{selectedService.serviceOffered}</p>
                                </div>
                            </div>
                            <button onClick={closeViewModal} className="text-white hover:rotate-90 transition-transform duration-200">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-[#08B36A] font-bold text-sm">
                                        <FaMoneyBillWave /> PRICING BREAKDOWN
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between bg-green-50/50 p-3 rounded-xl border border-green-50">
                                            <span className="text-xs text-gray-500 font-bold">Total List Price</span>
                                            <span className="text-sm font-black text-[#08B36A]">₹{selectedService.totalPrice}</span>
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <div className="flex justify-between text-xs"><span className="text-gray-400">One Time</span> <span className="font-bold text-gray-700">₹{selectedService.oneTime}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-gray-400">Multiple Time</span> <span className="font-bold text-gray-700">₹{selectedService.multipleTime}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-gray-400">Per Hour</span> <span className="font-bold text-gray-700">₹{selectedService.perHour}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-[#08B36A] font-bold text-sm">
                                        <FaStethoscope /> CLINICAL DETAILS
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consumables Used</label>
                                            <p className="text-xs text-gray-600 mt-1 italic leading-relaxed">{selectedService.consumables}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Procedure Included</label>
                                            <p className="text-xs text-gray-600 mt-1 italic leading-relaxed">{selectedService.procedure}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-xs uppercase tracking-wider">
                                        <FaListUl className="text-[#08B36A]" /> Service Description
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        {selectedService.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end">
                            <button 
                                onClick={closeViewModal} 
                                className="px-10 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-300 transition-all uppercase tracking-widest"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}