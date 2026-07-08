"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    FaShieldAlt, FaFolderPlus, FaCloudUploadAlt, FaFolder, FaFileMedical,
    FaEdit, FaTrash, FaChevronRight, FaTimes, FaSpinner, FaEye, FaPlus, 
    FaCalendarAlt, FaUserMd, FaFileImage, FaSearch, FaArrowsAlt, FaLock, FaKey
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";

const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function HealthLocker() {
    // --- Auth & Security States ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasPin, setHasPin] = useState(false); // Check if PIN is already setup
    const [pin, setPin] = useState("");
    const [newPin, setNewPin] = useState(""); // For setup/change
    const [checkLoading, setCheckLoading] = useState(true);

    // --- Data States ---
    const [items, setItems] = useState([]);
    const [navigationStack, setNavigationStack] = useState([{ id: null, name: "Vault" }]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentParentId, setCurrentParentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // --- Modal & Form States ---
    const [modalMode, setModalMode] = useState(null); // 'folder', 'upload', 'details', 'rename', 'add-pages', 'setup-pin', 'move'
    const [activeItem, setActiveItem] = useState(null);
    const [formData, setFormData] = useState({ name: "", doctorName: "", notes: "", date: "" });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // 1. Initial PIN Status Check
    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        try {
            const res = await UserAPI.getLockerPinStatus();
            setHasPin(res.hasPin);
        } catch (err) {
            toast.error("Security check failed");
        } finally {
            setCheckLoading(false);
        }
    };

    // 2. PIN Actions
    const handleSetupPin = async () => {
        if (newPin.length < 4) return toast.error("PIN must be at least 4 digits");
        try {
            setIsLoading(true);
            await UserAPI.setupLockerPin(newPin);
            toast.success("Vault Secured!");
            setHasPin(true);
            setModalMode(null);
        } catch (err) {
            toast.error("Failed to setup PIN");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyVaultPin = async () => {
        if (pin.length < 4) return toast.error("Enter valid PIN");
        setIsLoading(true);
        try {
            const res = await UserAPI.verifyLockerPin(pin);
            if (res.success) {
                toast.success("Vault Unlocked");
                setIsAuthenticated(true);
                loadLockerContent(null);
            } else {
                toast.error("Incorrect PIN");
            }
        } catch (err) {
            toast.error("Error connecting to vault");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Load Content & Navigation
    const loadLockerContent = async (parentId = null) => {
        setIsLoading(true);
        setCurrentParentId(parentId);
        try {
            const res = await UserAPI.getLockerContent(parentId);
            setItems(res.data || []);
            
            // Sync breadcrumbs from API if folderId exists
            if (parentId) {
                const pathRes = await UserAPI.getFolderPath(parentId);
                const breadcrumbs = [{ id: null, name: "Vault" }, ...pathRes.data];
                setNavigationStack(breadcrumbs);
            } else {
                setNavigationStack([{ id: null, name: "Vault" }]);
            }
        } catch (err) {
            toast.error("Failed to load content");
        } finally {
            setIsLoading(false);
        }
    };

    const enterFolder = (id, name) => {
        loadLockerContent(id);
    };

    const jumpToPath = (index) => {
        const target = navigationStack[index];
        loadLockerContent(target.id);
    };

    // 4. Search Logic
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            setIsSearching(true);
            try {
                const res = await UserAPI.searchLocker(query);
                setItems(res.data);
            } catch (err) { console.error(err); }
            finally { setIsSearching(false); }
        } else if (query.length === 0) {
            loadLockerContent(currentParentId);
        }
    };

    // 5. CRUD Operations
    const handleCreateFolder = async () => {
        if (!formData.name) return toast.error("Folder name required");
        try {
            await UserAPI.createFolder({ name: formData.name, parentId: currentParentId });
            toast.success("Folder created");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Failed to create folder"); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return toast.error("Select at least one image");

        const fd = new FormData();
        fd.append('title', formData.name);
        fd.append('doctorName', formData.doctorName);
        fd.append('notes', formData.notes);
        if (formData.date) fd.append('date', formData.date);
        if (currentParentId) fd.append('parentId', currentParentId);

        selectedFiles.forEach((file) => fd.append('images', file));

        try {
            setIsLoading(true);
            await UserAPI.uploadLockerFile(fd);
            toast.success("Record uploaded successfully");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) {
            toast.error("Upload failed");
        } finally { setIsLoading(false); }
    };

    const handleRename = async () => {
        try {
            await UserAPI.renameLockerItem(activeItem._id, formData.name);
            toast.success("Renamed successfully");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Rename failed"); }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Delete this item? Folders will delete all contents inside.")) {
            try {
                await UserAPI.deleteLockerItem(id);
                toast.success("Deleted");
                loadLockerContent(currentParentId);
            } catch (err) { toast.error("Delete failed"); }
        }
    };

    const handleAddPages = async () => {
        if (selectedFiles.length === 0) return toast.error("Select images to add");
        const fd = new FormData();
        selectedFiles.forEach((file) => fd.append('images', file));

        try {
            setIsLoading(true);
            await UserAPI.addPagesToRecord(activeItem._id, fd);
            toast.success("Pages added to record");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Failed to add pages"); }
        finally { setIsLoading(false); }
    };

    const handleDeleteSinglePage = async (imageUrl) => {
        if (!window.confirm("Remove this page from report?")) return;
        try {
            await UserAPI.deleteLockerPage(activeItem._id, imageUrl);
            toast.success("Page removed");
            // Update UI locally
            const updatedImages = activeItem.images.filter(img => img !== imageUrl);
            setActiveItem({ ...activeItem, images: updatedImages });
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Failed to delete page"); }
    };

    const handleMoveItem = async (targetFolderId) => {
        try {
            await UserAPI.moveLockerItem(activeItem._id, targetFolderId);
            toast.success("Item moved");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Move failed"); }
    };

    const closeModal = () => {
        setModalMode(null);
        setActiveItem(null);
        setFormData({ name: "", doctorName: "", notes: "", date: "" });
        setSelectedFiles([]);
        setNewPin("");
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    // --- Loading Screen ---
    if (checkLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <FaSpinner className="animate-spin text-[#08b36a] text-5xl mb-4" />
                <p className="text-gray-400 font-bold animate-pulse">Initializing Secure Vault...</p>
            </div>
        );
    }

    // --- Lock Screen ---
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[75vh]">
                <Toaster />
                <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 max-w-md w-full text-center">
                    <div className="bg-green-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12">
                        <FaShieldAlt className="text-[#08b36a] text-5xl" />
                    </div>
                    
                    {!hasPin ? (
                        <>
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Setup Vault</h2>
                            <p className="text-gray-400 mb-10">Create a 4-digit PIN to secure your medical records</p>
                            <input
                                type="password" maxLength={4} value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                className="w-full text-center text-4xl tracking-[20px] py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-[#08b36a] outline-none mb-8"
                                placeholder="0000"
                            />
                            <button onClick={handleSetupPin} className="w-full bg-[#08b36a] text-white py-5 rounded-3xl font-black text-lg hover:bg-[#128a55] transition-all shadow-xl shadow-green-100">
                                {isLoading ? <FaSpinner className="animate-spin mx-auto" /> : "CREATE SECURITY PIN"}
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Vault Locked</h2>
                            <p className="text-gray-400 mb-10">Enter 4-digit security PIN</p>
                            <input
                                type="password" maxLength={4} value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full text-center text-4xl tracking-[20px] py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-[#08b36a] outline-none mb-8"
                                placeholder="••••"
                            />
                            <button onClick={verifyVaultPin} className="w-full bg-[#08b36a] text-white py-5 rounded-3xl font-black text-lg hover:bg-[#128a55] transition-all shadow-xl shadow-green-100">
                                {isLoading ? <FaSpinner className="animate-spin mx-auto" /> : "UNLOCK VAULT"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <Toaster />

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                        Health Locker <FaLock className="text-xs text-gray-300" />
                    </h1>
                    <nav className="flex items-center gap-3 mt-4 bg-gray-50 w-fit px-4 py-2 rounded-2xl border border-gray-100">
                        {navigationStack.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <span onClick={() => jumpToPath(idx)} className={`text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all ${idx === navigationStack.length - 1 ? 'text-[#08b36a]' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {step.name}
                                </span>
                                {idx !== navigationStack.length - 1 && <FaChevronRight className="text-gray-300 text-[10px]" />}
                            </React.Fragment>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group min-w-[250px]">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08b36a] transition-all" />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-6 py-4 bg-gray-100 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#08b36a]/20 outline-none transition-all"
                        />
                    </div>
                    <button onClick={() => setModalMode('folder')} className="flex items-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-3xl font-bold text-gray-700 hover:border-gray-300 transition-all">
                        <FaFolderPlus /> New Folder
                    </button>
                    <button onClick={() => setModalMode('upload')} className="flex items-center gap-2 bg-[#08b36a] text-white px-6 py-4 rounded-3xl font-bold shadow-xl shadow-green-100 hover:bg-[#128a55] transition-all">
                        <FaCloudUploadAlt /> Upload
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            {(isLoading || isSearching) && !modalMode ? (
                <div className="flex justify-center py-32"><FaSpinner className="animate-spin text-[#08b36a] text-5xl" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {items.length === 0 ? (
                        <div className="col-span-full text-center py-32 bg-gray-50/50 rounded-[50px] border-4 border-dashed border-gray-100">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaFolder className="text-gray-300 text-3xl" />
                            </div>
                            <p className="text-gray-400 font-bold italic">This folder is empty</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => item.type === 'folder' ? enterFolder(item._id, item.name) : (setActiveItem(item), setModalMode('details'))}
                                className="group bg-white p-8 rounded-[45px] border-2 border-gray-50 hover:border-[#08b36a] hover:shadow-2xl hover:shadow-green-50 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Item Actions */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 translate-x-10 group-hover:translate-x-0">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveItem(item); setFormData({ name: item.name }); setModalMode('rename'); }} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-[#08b36a] shadow-lg border border-gray-50">
                                        <FaEdit size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveItem(item); setModalMode('move'); }} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-blue-500 shadow-lg border border-gray-50">
                                        <FaArrowsAlt size={12} />
                                    </button>
                                    <button onClick={(e) => handleDelete(item._id, e)} className="p-3 bg-white rounded-2xl text-red-300 hover:text-red-500 shadow-lg border border-gray-50">
                                        <FaTrash size={12} />
                                    </button>
                                </div>

                                <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110 ${item.type === 'folder' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {item.type === 'folder' ? <FaFolder /> : <FaFileMedical />}
                                </div>
                                <h6 className="font-black text-gray-800 truncate text-lg" title={item.name}>{item.name}</h6>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-2 h-2 rounded-full ${item.type === 'folder' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {item.type === 'folder' ? `${item.childCount || 0} Items` : `Medical File`}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- ALL MODALS --- */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[50px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 flex justify-between items-center border-b border-gray-50">
                            <h3 className="font-black text-2xl text-gray-900">
                                {modalMode === 'folder' && "Create Folder"}
                                {modalMode === 'rename' && "Rename Item"}
                                {modalMode === 'upload' && "New Record"}
                                {modalMode === 'details' && activeItem?.name}
                                {modalMode === 'add-pages' && "Append Pages"}
                                {modalMode === 'move' && "Move Item"}
                            </h3>
                            <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><FaTimes /></button>
                        </div>

                        <div className="p-8 max-h-[75vh] overflow-y-auto">
                            {/* Rename / Create Folder */}
                            {(modalMode === 'folder' || modalMode === 'rename') && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Display Name</label>
                                        <input
                                            type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Blood Reports 2024"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 focus:border-[#08b36a] outline-none font-bold text-gray-700"
                                        />
                                    </div>
                                    <button onClick={modalMode === 'folder' ? handleCreateFolder : handleRename} className="w-full bg-[#08b36a] text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-green-100">
                                        {modalMode === 'folder' ? "CREATE FOLDER" : "UPDATE NAME"}
                                    </button>
                                </div>
                            )}

                            {/* Upload Form */}
                            {modalMode === 'upload' && (
                                <form onSubmit={handleUpload} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Record Title</label>
                                            <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none font-bold" placeholder="e.g. MRI Scan" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Consultant</label>
                                            <input value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none font-bold" placeholder="Dr. Smith" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Notes</label>
                                        <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none font-bold" placeholder="Additional details..."></textarea>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Attachment(s)</label>
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full p-4 bg-gray-50 border-2 border-dashed rounded-2xl font-bold text-gray-500" />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full bg-[#08b36a] text-white py-6 rounded-3xl font-black shadow-xl">
                                        {isLoading ? "PROCESSING..." : "SECURE TO VAULT"}
                                    </button>
                                </form>
                            )}

                            {/* Details View */}
                            {modalMode === 'details' && activeItem && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-6 rounded-3xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Doctor</p>
                                            <p className="font-bold text-gray-700">{activeItem.doctorName || "N/A"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Date</p>
                                            <p className="font-bold text-gray-700">{new Date(activeItem.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 p-6 rounded-3xl">
                                        <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Observations</p>
                                        <p className="text-sm font-medium text-amber-900">{activeItem.notes || "No notes available."}</p>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-black text-gray-800">Gallery ({activeItem.images?.length})</h4>
                                        <button onClick={() => setModalMode('add-pages')} className="text-[#08b36a] text-xs font-black uppercase flex items-center gap-1"><FaPlus /> Add Page</button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {activeItem.images?.map((img, i) => (
                                            <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-100">
                                                <img src={`${SERVER_URL}${img}`} className="w-full h-full object-cover" alt="report" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                                                    <button onClick={() => window.open(`${SERVER_URL}${img}`, '_blank')} className="bg-white p-3 rounded-xl text-gray-900"><FaEye /></button>
                                                    <button onClick={() => handleDeleteSinglePage(img)} className="bg-red-500 p-3 rounded-xl text-white"><FaTrash /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Move Modal */}
                            {modalMode === 'move' && (
                                <div className="space-y-6">
                                    <p className="text-gray-400 font-bold">Select destination folder:</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button onClick={() => handleMoveItem(null)} className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl hover:bg-green-50 hover:text-[#08b36a] font-bold transition-all text-left">
                                            <FaFolder className="text-gray-300" /> [ Root Vault ]
                                        </button>
                                        {items.filter(i => i.type === 'folder' && i._id !== activeItem?._id).map(folder => (
                                            <button key={folder._id} onClick={() => handleMoveItem(folder._id)} className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl hover:bg-green-50 hover:text-[#08b36a] font-bold transition-all text-left">
                                                <FaFolder /> {folder.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Pages */}
                            {modalMode === 'add-pages' && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-blue-50 rounded-3xl text-blue-700 font-bold text-sm">Adding images to: {activeItem.name}</div>
                                    <input type="file" multiple onChange={handleFileChange} className="w-full p-4 border-2 border-dashed rounded-3xl font-bold" />
                                    <div className="flex gap-4">
                                        <button onClick={() => setModalMode('details')} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">CANCEL</button>
                                        <button onClick={handleAddPages} className="flex-1 bg-[#08b36a] text-white py-4 rounded-2xl font-bold">UPLOAD</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HealthLocker;