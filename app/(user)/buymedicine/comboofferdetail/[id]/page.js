"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaChevronLeft,
    FaGift,
    FaStore,
    FaExclamationTriangle,
    FaFileMedical,
    FaClock,
    FaShieldAlt,
    FaTruck,
    FaMapPin,
    FaShoppingBag,
    FaCheck,
    FaMinus,
    FaPlus,
    FaTrashAlt,
    FaStar,
    FaLeaf
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import { useCart } from "@/app/context/CartContext";
import { toast } from "react-hot-toast";
import CostoumPopup from '@/lib/CostoumPopup';

const FALLBACK_MED_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop";

// Utility helper to map raw assets paths to your express server URL
const resolveAssetUrl = (path, fallback = FALLBACK_MED_IMAGE) => {
    if (!path) return fallback;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;

    // Check if the path is a simple image asset code (e.g., "img_56") without folders/extensions
    if (!path.includes("/") && !path.includes(".")) {
        return fallback;
    }

    // Strip "public/" prefix if present
    let cleanPath = path;
    if (path.startsWith("public/")) {
        cleanPath = path.substring(7); // Removes "public/"
    }

    return `http://192.168.1.26:5002/${cleanPath}`;
};

export default function ComboOfferDetailPage() {
    const params = useParams();
    const router = useRouter();

    // Context-driven pharmacy cart state hooks mapped strictly to your CartContext
    const {
        pharmacyCart,
        addPharmacyToCart,
        updatePharmacyCartQuantity,
        removePharmacyItem,
    } = useCart();

    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchaseQty, setPurchaseQty] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [showConflictModal, setShowConflictModal] = useState(false);

    // Fetch primary data details
    const fetchDetail = useCallback(async () => {
        if (!params?.id) return;
        setLoading(true);
        try {
            const res = await UserAPI.getComboOfferDetail(params.id);
            if (res && res.success) {
                setOffer(res.data);
            }
        } catch (error) {
            console.error("Failed to load combo offer details:", error);
            toast.error("Failed to load combo details");
        } finally {
            setLoading(false);
        }
    }, [params?.id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // Map properties from your API Response
    const med = offer?.medicineId;
    const store = offer?.pharmacyId;

    // Standardized variables mapping for addPharmacyToCart structure
    const vendor = { pharmacyId: store?._id };
    const id = med?._id;
    const quantity = purchaseQty;

    // Check if this specific medicine is already added to the global context cart
    const cartProduct = pharmacyCart?.items?.find(item =>
        id && (item.medicineId?._id === id || item.medicineId === id)
    );
    const isAdded = !!cartProduct;

    // Synchronize initial component quantities matching context state
    useEffect(() => {
        if (cartProduct) {
            setPurchaseQty(cartProduct.quantity);
        } else {
            setPurchaseQty(1);
        }
    }, [cartProduct]);

    // Update cart items quantities directly
    const handleUpdateQuantity = async (action) => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            toast.error("Please login to update cart quantity");
            router.push('/');
            return;
        }

        if (action === 'dec' && quantity <= 1) {
            if (isAdded) await handleCartAction();
            return;
        }

        if (!isAdded) {
            setPurchaseQty(prev => action === 'inc' ? prev + 1 : prev - 1);
            return;
        }

        try {
            setProcessing(true);
            await updatePharmacyCartQuantity(id, action);
        } catch (error) {
            toast.error("Failed to update quantity");
        } finally {
            setProcessing(false);
        }
    };

    // Main cart evaluation & addition flow
    const handleCartAction = async (e, selectedVendor = null) => {
        // Prevent event bubbling and default action conflicts
        if (e) {
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
            if (typeof e.preventDefault === 'function') e.preventDefault();
        }

        const token = localStorage.getItem('userToken');
        if (!token) {
            CostoumPopup("Please login to continue", "warning", 4000);
            router.push('/');
            return;
        }

        if (!vendor.pharmacyId) {
            CostoumPopup("No phamacy added to this product", "warning", 4000);
            return;
        }

        // Check if user is attempting to add items from another store
        if (!isAdded) {
            const currentPharmacyIdInCart = pharmacyCart?.items?.[0]?.pharmacyId?._id || pharmacyCart?.items?.[0]?.pharmacyId;

            if (currentPharmacyIdInCart && currentPharmacyIdInCart !== vendor.pharmacyId) {
                setShowConflictModal(true);
                return;
            }
        }

        try {
            setProcessing(true);
            if (isAdded) {
                await removePharmacyItem(id);
                CostoumPopup("BOGO deal removed from cart", "success", 3000);
            } else {
                // Passes parameters with specified isComboApplied and dynamic comboOfferId
                await addPharmacyToCart(
                    vendor.pharmacyId,
                    id,
                    quantity,
                    "Full Course",
                    false,       // forceReplace
                    true,        // isComboApplied (Explicitly true) [1]
                    offer?._id   // comboOfferId (Dynamic combo offer _id) [1]
                );
                CostoumPopup("BOGO deal added to cart", "success", 3000);
                router.push('/userscreens/usercart');
            }
        } catch (error) {
            console.error("Cart action failed:", error);
            toast.error("Failed to update cart");
        } finally {
            setProcessing(false);
        }
    };

    // Override existing cart from another pharmacy 
    const handleConfirmClearCart = async () => {
        if (!vendor.pharmacyId || !id) return;
        try {
            setProcessing(true);
            await addPharmacyToCart(
                vendor.pharmacyId,
                id,
                quantity,
                "Full Course",
                true,        // forceReplace set to true to bypass conflict checks on backend
                true,        // isComboApplied (Explicitly true) [1]
                offer?._id   // comboOfferId (Dynamic combo offer _id) [1]
            );
            toast.success(`Cart cleared and BOGO added from ${store?.name}`);
            setShowConflictModal(false);
        } catch (error) {
            toast.error("Failed to override cart");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-black uppercase text-slate-400 tracking-widest">Retrieving Promo Calculations...</p>
            </div>
        );
    }

    // --- FINANCIAL SAVINGS CALCULATIONS ---
    const rawMRP = parseFloat(med?.mrp || 0);
    const rawBestPrice = parseFloat(med?.best_price || 0);

    // Total physical packages received per individual BOGO set
    const unitsPerBundle = offer.buyQty + offer.getFreeQty;

    // Total cost if purchased at full MRP individually
    const totalMRPValue = rawMRP * unitsPerBundle * quantity;

    // Actual cost paid by client
    const actualPayable = rawBestPrice * offer.buyQty * quantity;

    // Total monetary savings
    const netSavings = totalMRPValue - actualPayable;
    const discountPercentage = Math.round((netSavings / totalMRPValue) * 100);

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-8 md:py-16">

            {/* Pharmacy Cart Conflict Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl border-none">
                        <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Replace cart items?</h3>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                            Your cart already contains items from another pharmacy. Adding this BOGO deal will clear your current selections.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="flex-1 py-3.5 text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all border-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearCart}
                                className="flex-1 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-rose-500 hover:bg-rose-600 rounded-2xl transition-all border-none cursor-pointer shadow-lg shadow-rose-200"
                            >
                                Clear & Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* --- HEADER NAVIGATION --- */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest mb-8 cursor-pointer border-none bg-transparent"
                >
                    <FaChevronLeft size={10} /> Back to Listings
                </button>

                {/* --- CORE SPLIT SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Visual Media & Savings Matrix */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Premium Image Container */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] relative overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                            {/* BOGO Sunset Banner */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                                    <FaGift size={12} /> Buy {offer.buyQty} Get {offer.getFreeQty} Free
                                </span>
                            </div>

                            <img
                                src={resolveAssetUrl(med?.image_url?.[0])}
                                alt={med?.name}
                                className="max-h-[260px] md:max-h-[320px] object-contain"
                                onError={(e) => { e.target.src = FALLBACK_MED_IMAGE; }}
                            />
                        </div>

                        {/* Interactive Bundle Savings Calculation Board */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[32px] p-6 md:p-8 shadow-xl">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Promotional Savings Ledger</h4>

                            <div className="space-y-4 border-b border-white/10 pb-6 mb-6 text-xs font-bold">
                                <div className="flex justify-between text-slate-400">
                                    <span>Total Packs Received</span>
                                    <span className="text-white">{unitsPerBundle * quantity} Packs ({offer.getFreeQty * quantity} Free)</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Regular Value (At MRP)</span>
                                    <span className="line-through text-slate-500">₹{totalMRPValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Your Combo Price</span>
                                    <span className="text-[#08B36A] font-black text-sm">₹{actualPayable.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Net Guaranteed Savings</p>
                                    <p className="text-2xl md:text-3xl font-black text-white">₹{netSavings.toFixed(2)}</p>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-[#08B36A] font-black text-xs px-3 py-2 rounded-xl flex flex-col items-center">
                                    <span>{discountPercentage}%</span>
                                    <span className="text-[7px] text-white uppercase tracking-wider">SAVED</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Medicine Monograph & Vendor Details */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Product Header Card */}
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] space-y-4">
                            <div>
                                <span className="bg-emerald-50 text-[#08B36A] text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-wider">
                                    Active Promotion
                                </span>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-2 uppercase tracking-tight">
                                    {med?.name}
                                </h1>
                                <p className="text-xs font-bold text-[#08B36A] mt-1">
                                    Composition: {med?.salt_composition}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2 text-xs">
                                <div className="bg-slate-50 px-3.5 py-2 rounded-xl font-bold text-slate-500">
                                    Packaging: <span className="text-slate-800">{med?.packaging || "N/A"}</span>
                                </div>
                                <div className="bg-slate-50 px-3.5 py-2 rounded-xl font-bold text-slate-500">
                                    Campaign ID: <span className="text-slate-800 font-mono">{offer.campaignDisplayName}</span>
                                </div>
                                {med?.prescription_required === "YES" && (
                                    <div className="bg-rose-50 text-rose-600 px-3.5 py-2 rounded-xl font-black flex items-center gap-1.5 border border-rose-100/30 animate-pulse">
                                        <FaExclamationTriangle size={12} /> Rx Prescription Required
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Tabbed Product Details Component */}
                        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] border-none">
                            <div className="flex border-b border-slate-100 bg-slate-50/50">
                                {['Overview', 'Usage', 'Safety Advice'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border-none bg-transparent ${activeTab === tab.toLowerCase()
                                            ? 'bg-white text-[#08B36A] border-b-2 border-[#08B36A]'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 md:p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2.5 tracking-wider">Introduction</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{med?.description || "No description provided."}</p>
                                        </div>
                                        {med?.benefits && (
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-wider">Key Benefits</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {med.benefits.split('.').map((benefit, i) => benefit.trim() && (
                                                        <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black">{i + 1}</div>
                                                            {benefit}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'usage' && (
                                    <div className="space-y-6">
                                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100/30">
                                            <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-2 tracking-wider">Active Functionality</h4>
                                            <p className="text-sm font-bold text-emerald-900 leading-relaxed italic">"{med?.benefits || "Active compound details unspecified."}"</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Storage Details</h4>
                                            <p className="text-xs text-slate-700 font-semibold">Store below 30°C. Protect from moisture and direct heat.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'safety advice' && (
                                    <div className="space-y-6">
                                        {med?.side_effect && (
                                            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100/30">
                                                <h4 className="text-[10px] font-black text-rose-700 uppercase mb-1 tracking-wider">Side Effects</h4>
                                                <p className="text-base font-black text-rose-900">{med.side_effect}</p>
                                            </div>
                                        )}
                                        {med?.safety_advise && (
                                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100/30">
                                                <h4 className="text-[10px] font-black text-blue-700 uppercase mb-2 tracking-wider">Safety Guidelines</h4>
                                                <p className="text-sm font-bold text-blue-900 leading-relaxed italic">{med.safety_advise}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pharmacy Vendor Information */}
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FaStore className="text-[#08B36A]" /> Fulfilling Pharmacy Vendor
                            </h4>

                            <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                                <img
                                    src={resolveAssetUrl(store?.profileImage, "/placeholder-store.png")}
                                    alt={store?.name}
                                    className="w-14 h-14 rounded-2xl object-cover bg-white shadow-sm"
                                    onError={(e) => { e.target.src = "/placeholder-store.png"; }}
                                />
                                <div>
                                    <h5 className="font-black text-slate-900 text-sm md:text-base uppercase leading-none">
                                        {store?.name || "Verified Store"}
                                    </h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1.5">
                                        <FaMapPin size={10} /> {store?.city}, {store?.state}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-xs font-bold text-slate-600">
                                <div className="flex items-center gap-3">
                                    <FaTruck className="text-slate-400" size={14} />
                                    <span>Home Delivery: {store?.isHomeDeliveryAvailable ? "Yes, Available" : "Self-pickup Only"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-slate-400" size={14} />
                                    <span>Operating Hours: {store?.is24x7 ? "24x7 Operation" : "Standard Hours"}</span>
                                </div>
                                <div className="flex items-center gap-3 md:col-span-2 bg-slate-50 p-3 rounded-2xl">
                                    <FaMapPin className="text-rose-500 shrink-0" size={14} />
                                    <span className="text-slate-500 font-semibold truncate leading-tight">{store?.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Multiplexer & Add to Cart Action */}
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity:</span>
                                <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                                    <button
                                        onClick={() => handleUpdateQuantity('dec')}
                                        disabled={processing}
                                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-200 text-slate-800 font-bold active:scale-90 select-none border-none cursor-pointer"
                                    >
                                        <FaMinus size={11} />
                                    </button>
                                    <span className="w-12 text-center text-sm font-black text-slate-900 select-none">{quantity} Set</span>
                                    <button
                                        onClick={() => handleUpdateQuantity('inc')}
                                        disabled={processing}
                                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-200 text-slate-800 font-bold active:scale-90 select-none border-none cursor-pointer"
                                    >
                                        <FaPlus size={11} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleCartAction(e)}
                                disabled={processing}
                                className={`w-full md:w-auto px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-none cursor-pointer transition-all duration-300 ${isAdded
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "bg-gradient-to-r from-[#08B36A] to-emerald-600 hover:from-slate-900 hover:to-slate-900 text-white shadow-lg shadow-emerald-500/10"
                                    }`}
                            >
                                {processing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : isAdded ? (
                                    <>
                                        <FaTrashAlt size={12} /> Remove Deal
                                    </>
                                ) : (
                                    <>
                                        <FaShoppingBag size={12} /> Claim BOGO Deal
                                    </>
                                )}
                            </button>
                        </div>

                    </div>

                </div>

            </div>

            {/* --- SEAMLESS TRUST BAR --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 border-t border-slate-200/50 pt-8">
                    <div className="flex items-center gap-2">
                        <FaLeaf size={12} className="text-[#08B36A]" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Automatic BOGO Applied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaStar size={12} className="text-[#08B36A]" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Direct Store Savings</span>
                    </div>
                </div>
            </div>
        </main>
    );
}

function InfoBlock({ title, content, icon }) {
    return (
        <div className="bg-slate-50/50 p-4 rounded-2xl flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100/50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h5>
                <p className="text-xs text-slate-700 font-bold mt-1">{content || "Not specified."}</p>
            </div>
        </div>
    );
}