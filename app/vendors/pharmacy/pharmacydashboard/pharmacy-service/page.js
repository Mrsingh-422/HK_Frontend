'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaPills, FaPlus, FaTimes, FaEdit, FaTrash, 
    FaFileCsv, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle,
    FaRupeeSign, FaInfoCircle, FaDownload
} from 'react-icons/fa';

// ==========================================
// 🌟 INITIAL DUMMY DATA FOR MEDICINES
// ==========================================
const initialMedicines =[
    {
        id: 'MED-1001',
        name: 'Paracetamol 500mg',
        brand: 'Crocin',
        category: 'Fever & Pain',
        price: '35.00',
        stock: 150,
        description: 'Used for mild to moderate pain relief and fever reduction. It is a common painkiller and is also used to treat headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
        status: 'In Stock'
    },
    {
        id: 'MED-1002',
        name: 'Amoxicillin 250mg',
        brand: 'Mox',
        category: 'Antibiotics',
        price: '110.00',
        stock: 12,
        description: 'Penicillin antibiotic used to treat bacterial infections such as pneumonia, bronchitis, and infections of the ear, nose, throat, urinary tract, and skin.',
        status: 'Low Stock'
    },
    {
        id: 'MED-1003',
        name: 'Cough Syrup 100ml',
        brand: 'Benadryl',
        category: 'Cough & Cold',
        price: '145.00',
        stock: 0,
        description: 'Provides quick relief from cough, runny nose, sneezing, itching, and watery eyes caused by allergies, the common cold, or the flu.',
        status: 'Out of Stock'
    },
    {
        id: 'MED-1004',
        name: 'Vitamin C + Zinc',
        brand: 'Limcee',
        category: 'Supplements',
        price: '65.00',
        stock: 300,
        description: 'Immunity booster chewable tablets. Helps in the prevention of Vitamin C deficiency and provides antioxidant support for overall health and well-being.',
        status: 'In Stock'
    }
];

export default function PharmacyMedicinesPage() {
    // 🌟 States
    const[medicines, setMedicines] = useState(initialMedicines);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Info Modal
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const[isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Add / Edit Modal
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const[isEditMode, setIsEditMode] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'csv'
    const [csvFile, setCsvFile] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        id: '', name: '', brand: '', category: 'Fever & Pain', price: '', stock: '', description: ''
    });

    // --- Search Filter ---
    const filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        med.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Info Modal Handlers ---
    const openInfoModal = (med) => {
        setSelectedMedicine(med);
        setIsInfoModalOpen(true);
    };

    const closeInfoModal = () => {
        setIsInfoModalOpen(false);
        setTimeout(() => setSelectedMedicine(null), 200);
    };

    // --- Add/Edit Form Handlers ---
    const handleAddNew = () => {
        setIsEditMode(false);
        setUploadMethod('manual');
        setFormData({ id: '', name: '', brand: '', category: 'Fever & Pain', price: '', stock: '', description: '' });
        setIsFormModalOpen(true);
    };

    const handleEdit = (e, med) => {
        e.stopPropagation();
        setIsEditMode(true);
        setUploadMethod('manual'); // Edit is always manual
        setFormData({ ...med });
        setIsFormModalOpen(true);
    };

    const handleDelete = (e, id, name) => {
        e.stopPropagation();
        if(window.confirm(`Are you sure you want to delete ${name}?`)) {
            setMedicines(medicines.filter(m => m.id !== id));
            alert(`${name} has been deleted.`);
        }
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setCsvFile(null);
    };

    // --- Submit Logic (Manual or CSV) ---
    const handleSubmit = (e) => {
        e.preventDefault();

        if (uploadMethod === 'manual') {
            // Edit Logic
            if (isEditMode) {
                setMedicines(medicines.map(m => (m.id === formData.id ? { ...formData, status: getStockStatus(formData.stock) } : m)));
                alert("Medicine updated successfully!");
            } 
            // Add New Manual Logic
            else {
                const newMed = {
                    ...formData,
                    id: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
                    status: getStockStatus(formData.stock)
                };
                setMedicines([newMed, ...medicines]);
                alert("New medicine added successfully!");
            }
        } 
        // Add CSV Logic (Dummy Simulation)
        else {
            if(!csvFile) { alert("Please upload a CSV file first."); return; }
            alert(`File "${csvFile.name}" processed successfully! \n(Dummy: 50 records added)`);
        }

        closeFormModal();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCsvFile(e.target.files[0]);
        }
    };

    const getStockStatus = (stock) => {
        const s = parseInt(stock);
        if (s <= 0) return 'Out of Stock';
        if (s < 20) return 'Low Stock';
        return 'In Stock';
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FaPills size={20} /></div>
                        Medicine Inventory
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Upload, edit and manage pharmacy medicines.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Medicine..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200 shrink-0"
                    >
                        <FaPlus size={12}/> Upload Medicine
                    </button>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Medicine Details</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Price & Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMedicines.length > 0 ? (
                                filteredMedicines.map((med) => (
                                    <tr 
                                        key={med.id} 
                                        onClick={() => openInfoModal(med)} 
                                        className="hover:bg-emerald-50/50 transition-all duration-200 group cursor-pointer"
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shrink-0">
                                                    <FaPills size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{med.name}</span>
                                                    <span className="text-[11px] text-gray-500 font-medium">Brand: {med.brand} | ID: {med.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold border border-gray-200 whitespace-nowrap">
                                                {med.category}
                                            </span>
                                        </td>

                                        {/* 🌟 Description Column with Truncate (Dots) */}
                                        <td className="p-4">
                                            <p className="text-xs text-gray-500 max-w-[180px] sm:max-w-[220px] truncate" title={med.description}>
                                                {med.description ? med.description : "No description available"}
                                            </p>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-800 flex items-center">
                                                    <FaRupeeSign size={11} className="text-gray-500 mt-0.5"/> {med.price}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">Qty: {med.stock}</span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                {med.status === 'In Stock' && <FaCheckCircle className="text-emerald-500" size={14}/>}
                                                {med.status === 'Low Stock' && <FaExclamationTriangle className="text-amber-500" size={14}/>}
                                                {med.status === 'Out of Stock' && <FaTimes className="text-red-500 bg-red-100 rounded-full" size={14}/>}
                                                
                                                <span className={`text-xs font-bold ${
                                                    med.status === 'In Stock' ? 'text-emerald-600' : 
                                                    med.status === 'Low Stock' ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                    {med.status}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4 pr-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={(e) => handleEdit(e, med)} 
                                                    className="p-2 bg-gray-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all border border-gray-200"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDelete(e, med.id, med.name)} 
                                                    className="p-2 bg-gray-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-gray-200"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No medicines found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 1. INFO MODAL (SHOWS FULL DETAILS)      */}
            {/* ========================================== */}
            {isInfoModalOpen && selectedMedicine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FaInfoCircle className="text-emerald-500" /> Medicine Details
                            </h2>
                            <button onClick={closeInfoModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                                    <FaPills size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{selectedMedicine.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedMedicine.brand} | {selectedMedicine.category}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Price</p>
                                    <p className="font-bold text-gray-800 text-lg flex items-center"><FaRupeeSign size={14}/> {selectedMedicine.price}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Current Stock</p>
                                    <p className={`font-bold text-lg ${selectedMedicine.stock > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                                        {selectedMedicine.stock} Units
                                    </p>
                                </div>
                            </div>

                            {/* Full Description Shown Here */}
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Description</p>
                                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                                    {selectedMedicine.description ? selectedMedicine.description : "No additional description is provided for this medicine."}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={closeInfoModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* 🌟 2. ADD / EDIT MEDICINE MODAL (FORM)     */}
            {/* ========================================== */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                {isEditMode ? <><FaEdit className="text-blue-500" /> Edit Medicine</> : <><FaPlus className="text-emerald-500" /> Upload New Medicine</>}
                            </h2>
                            <button onClick={closeFormModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* TABS (Only show if Adding New) */}
                        {!isEditMode && (
                            <div className="flex border-b border-gray-200">
                                <button 
                                    onClick={() => setUploadMethod('manual')}
                                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${uploadMethod === 'manual' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <FaPills /> Manual Entry
                                </button>
                                <button 
                                    onClick={() => setUploadMethod('csv')}
                                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${uploadMethod === 'csv' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <FaFileCsv size={16} /> Bulk CSV Upload
                                </button>
                            </div>
                        )}

                        {/* Form Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                
                                {/* 🔴 TAB 1: MANUAL UPLOAD 🔴 */}
                                {uploadMethod === 'manual' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Medicine Name <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" required placeholder="E.g. Paracetamol 500mg" 
                                                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                                                <input 
                                                    type="text" placeholder="E.g. Crocin" 
                                                    value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                                <select 
                                                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                >
                                                    <option>Fever & Pain</option>
                                                    <option>Antibiotics</option>
                                                    <option>Cough & Cold</option>
                                                    <option>Supplements</option>
                                                    <option>Diabetes</option>
                                                    <option>First Aid</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="number" required placeholder="0.00" min="0" step="0.01"
                                                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Stock Qty <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="number" required placeholder="0" min="0"
                                                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                            <textarea 
                                                rows="3" placeholder="Brief details about the medicine..."
                                                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* 🔴 TAB 2: CSV UPLOAD 🔴 */}
                                {uploadMethod === 'csv' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-blue-800">Download Sample Format</p>
                                                <p className="text-xs text-blue-600 mt-0.5">Please use the exact columns provided.</p>
                                            </div>
                                            <button type="button" className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">
                                                <FaDownload size={14} />
                                            </button>
                                        </div>

                                        <div className="relative border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 text-center hover:bg-gray-100 hover:border-emerald-400 transition-all cursor-pointer">
                                            <input 
                                                type="file" accept=".csv" onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <FaCloudUploadAlt size={48} className="text-gray-400 mx-auto mb-3" />
                                            {csvFile ? (
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-600">{csvFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Ready to upload</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700">Click to browse or drag CSV file here</p>
                                                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Action Buttons */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button type="button" onClick={closeFormModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200">
                                    {uploadMethod === 'csv' ? 'Upload CSV' : isEditMode ? 'Save Changes' : 'Add Medicine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}