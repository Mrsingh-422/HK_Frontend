"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronRight,
    ShoppingCart,
    ShieldCheck,
    Truck,
    RotateCcw,
    AlertCircle,
    Plus,
    Minus,
    ThermometerSnowflake,
    ShieldAlert,
    FlaskRound,
    MapPin,
    CheckCircle2,
    Trash2,
    Store,
    Info,
    X,
    BadgeCheck,
    ArrowRight
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';
import { useCart } from '@/app/context/CartContext';
import { toast } from 'react-hot-toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop";

function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const {
        pharmacyCart,
        addPharmacyToCart,
        updatePharmacyCartQuantity,
        removePharmacyItem,
        clearFullCart,
    } = useCart();

    const [product, setProduct] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [selectedVendorIndex, setSelectedVendorIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('overview');
    const [processingId, setProcessingId] = useState(null);

    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingVendor, setPendingVendor] = useState(null);

    const cartProduct = pharmacyCart?.items?.find(item =>
        (item.medicineId?._id === id || item.medicineId === id)
    );
    const isAdded = !!cartProduct;

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const storedCoords = localStorage.getItem('userCoords');
                let params = {};

                if (storedCoords) {
                    try {
                        const parsedCoords = JSON.parse(storedCoords);
                        if (parsedCoords.lat && parsedCoords.lng) {
                            params = { lat: parsedCoords.lat, lng: parsedCoords.lng };
                        }
                    } catch (e) {
                        console.error("Error parsing userCoords", e);
                    }
                }

                const res = await UserAPI.pharmacyProductDetail(id, params);

                if (res && res.success) {
                    setProduct(res.data.medicineDetails);
                    setVendors(res.data.availableInPharmacies || []);
                }
            } catch (err) {
                console.error("Error fetching product details", err);
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    useEffect(() => {
        if (cartProduct) {
            setQuantity(cartProduct.quantity);
        } else {
            setQuantity(1);
        }
    }, [cartProduct]);

    const handleUpdateQuantity = async (action) => {
        // --- AUTH CHECK ---
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
            setQuantity(prev => action === 'inc' ? prev + 1 : prev - 1);
            return;
        }

        try {
            setProcessingId(id);
            await updatePharmacyCartQuantity(id, action);
        } catch (error) {
            toast.error("Failed to update quantity");
        } finally {
            setProcessingId(null);
        }
    };

    const handleCartAction = async (selectedVendor = null) => {
        // --- AUTH CHECK ---
        const token = localStorage.getItem('userToken');
        if (!token) {
            toast.error("Please login to add items to cart");
            router.push('/');
            return;
        }

        const vendor = selectedVendor || vendors[selectedVendorIndex] || vendors[0];

        if (!vendor) {
            toast.error("No pharmacy available for this product");
            return;
        }

        if (!isAdded || selectedVendor) {
            const currentPharmacyIdInCart = pharmacyCart?.items?.[0]?.pharmacyId?._id || pharmacyCart?.items?.[0]?.pharmacyId;

            if (currentPharmacyIdInCart && currentPharmacyIdInCart !== vendor.pharmacyId) {
                setPendingVendor(vendor);
                setShowConflictModal(true);
                return;
            }
        }

        try {
            setProcessingId(id);

            if (isAdded && !selectedVendor) {
                await removePharmacyItem(id);
                toast.success("Removed from cart");
            } else {
                await addPharmacyToCart(
                    vendor.pharmacyId,
                    id,
                    quantity,
                    "Full Course"
                );
                toast.success(`Added to cart from ${vendor.name}`);
            }
        } catch (error) {
            console.error("Cart Error:", error);
            toast.error("Something went wrong");
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmClearCart = async () => {
        if (!pendingVendor) return;
        try {
            setProcessingId(id);
            await clearFullCart();
            await addPharmacyToCart(
                pendingVendor.pharmacyId,
                id,
                quantity,
                "Full Course"
            );
            toast.success(`Cart cleared and added from ${pendingVendor.name}`);
            setShowConflictModal(false);
            setPendingVendor(null);
        } catch (error) {
            toast.error("Failed to update cart");
        } finally {
            setProcessingId(null);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return FALLBACK_IMAGE;
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}/${path.replace('public/', '')}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-100 animate-pulse" />
                    <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-t-emerald-500 border-transparent animate-spin" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Loading Details</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-xs">The medicine you are looking for might have been moved or is currently unavailable.</p>
            <button onClick={() => router.back()} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200">
                Go Back
            </button>
        </div>
    );

    const currentPrice = vendors[selectedVendorIndex]?.price || product.best_price;
    const currentMrp = vendors[selectedVendorIndex]?.mrp || product.mrp;
    const savings = parseInt(currentMrp) - parseInt(currentPrice);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
            {showConflictModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all">
                    <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 md:p-10 text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                <AlertCircle size={32} className="text-amber-500 transform -rotate-12 md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">Replace cart items?</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Your cart contains items from another pharmacy. Adding this will clear your current cart. Do you want to continue?
                            </p>
                        </div>
                        <div className="flex p-4 md:p-6 gap-3">
                            <button
                                onClick={() => { setShowConflictModal(false); setPendingVendor(null); }}
                                className="flex-1 px-4 py-3 md:px-6 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearCart}
                                className="flex-1 px-4 py-3 md:px-6 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-slate-900 rounded-2xl transition-all shadow-lg shadow-emerald-100"
                            >
                                Clear & Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <nav className="flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <button onClick={() => router.push('/buymedicine')} className="hover:text-emerald-500 transition-colors">Home</button>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-500">{product.bread_crumb?.split('>')[0].trim()}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-emerald-600 truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">

                    {/* --- LEFT: PRODUCT IMAGE --- */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-4 md:p-10 sticky top-28 shadow-sm group">
                            <div className="relative aspect-square flex items-center justify-center bg-slate-50 rounded-2xl md:rounded-[2rem] overflow-hidden">
                                <img
                                    src={FALLBACK_IMAGE}
                                    alt={product.name}
                                    className="w-full h-full object-contain mix-blend-multiply p-4 md:p-8 transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 md:top-6 left-4 md:left-6 flex flex-col gap-2 md:gap-3">
                                    {product.prescription_required === "YES" && (
                                        <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg shadow-red-100 flex items-center gap-1.5 uppercase tracking-wider">
                                            <ShieldAlert size={10} className="md:w-3 md:h-3" /> Rx Required
                                        </span>
                                    )}
                                    {(vendors[selectedVendorIndex]?.discount || parseInt(product.discont_percent)) > 0 && (
                                        <span className="bg-amber-400 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg shadow-amber-100 uppercase tracking-wider">
                                            {vendors[selectedVendorIndex]?.discount || product.discont_percent} OFF
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6">
                                    <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-100 p-1.5 md:p-2 rounded-xl md:rounded-2xl">
                                        <BadgeCheck className="text-emerald-500 md:w-6 md:h-6" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: HEADER & PRICING --- */}
                    <div className="lg:col-span-7 space-y-6 md:space-y-8">
                        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-12 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                            <div className="relative pb-6 md:pb-8 border-b border-slate-50">
                                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                    <span className="text-emerald-500 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] bg-emerald-50 px-2 md:px-3 py-0.5 md:py-1 rounded-lg">{product.manufacturers}</span>
                                    <span className="text-slate-300 text-[9px] md:text-[11px] font-bold uppercase tracking-widest">{product.packaging}</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 md:mb-6 leading-tight tracking-tight">{product.name}</h1>

                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-slate-100 text-[10px] md:text-xs font-bold">
                                        <FlaskRound size={14} className="text-emerald-500 md:w-4 md:h-4" /> {product.salt_composition}
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-slate-100 text-[10px] md:text-xs font-bold">
                                        <ThermometerSnowflake size={14} className="text-blue-400 md:w-4 md:h-4" /> {product.storage}
                                    </div>
                                </div>
                            </div>

                            <div className="py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                                <div>
                                    <div className="flex items-baseline gap-2 md:gap-3">
                                        <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">₹{currentPrice}</span>
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 line-through text-sm md:text-base font-bold">MRP ₹{currentMrp}</span>
                                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded mt-1 w-fit">Save ₹{savings}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] text-slate-400 font-bold mt-3 md:mt-4 uppercase tracking-[0.1em]">Price per unit inclusive of all taxes</p>
                                </div>

                                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1 md:p-1.5 h-14 md:h-16 shrink-0">
                                        <button
                                            onClick={() => handleUpdateQuantity('dec')}
                                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl hover:bg-white hover:text-red-500 transition-all text-slate-400 disabled:opacity-20"
                                            disabled={processingId === id}
                                        >
                                            <Minus size={16} className="md:w-[18px]" />
                                        </button>
                                        <span className="w-10 md:w-12 text-center font-black text-lg md:text-xl text-slate-800">{quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity('inc')}
                                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl hover:bg-white hover:text-emerald-500 transition-all text-slate-400 disabled:opacity-20"
                                            disabled={processingId === id}
                                        >
                                            <Plus size={16} className="md:w-[18px]" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleCartAction()}
                                        disabled={processingId === id}
                                        className={`flex-1 px-4 md:px-12 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 transition-all shadow-xl h-14 md:h-16 ${isAdded
                                            ? "bg-slate-900 text-white hover:bg-red-500"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100"
                                            }`}
                                    >
                                        {processingId === id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : isAdded ? (
                                            <><Trash2 size={18} className="md:w-5 md:h-5" /> Remove</>
                                        ) : (
                                            <><ShoppingCart size={18} className="md:w-5 md:h-5" /> Add to Cart</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-slate-50">
                                <QuickInfo label="Primary Use" value={product.primary_use} />
                                <QuickInfo label="Total Sellers" value={`${product.totalSellers || vendors.length} Near You`} />
                                <QuickInfo label="Category" value={product.bread_crumb?.split('>')[1]?.trim() || 'General'} />
                            </div>
                        </div>

                        {/* --- SELLERS --- */}
                        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-5 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
                                        <Store size={18} className="text-emerald-600 md:w-5 md:h-5" />
                                    </div>
                                    <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-wider">Available Near You</h3>
                                </div>
                                <span className="text-[8px] md:text-[10px] font-black text-slate-400 bg-slate-50 px-2 md:px-3 py-1 rounded-full uppercase tracking-widest">{vendors.length} Stores</span>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                {vendors.map((vendor, index) => {
                                    const isSelected = selectedVendorIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedVendorIndex(index)}
                                            className={`p-4 md:p-6 border rounded-2xl md:rounded-[1.5rem] transition-all duration-300 group cursor-pointer ${isSelected ? "bg-emerald-50/40 border-emerald-500 shadow-md translate-x-1" : "bg-white border-slate-100 hover:border-emerald-200"}`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                                                <div className="flex-1 flex gap-3 md:gap-5">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50 p-1">
                                                        <img
                                                            src={getImageUrl(vendor.image)}
                                                            className="w-full h-full object-cover rounded-lg md:rounded-xl"
                                                            alt={vendor.name}
                                                            onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/822/822143.png"}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                                            <p className={`font-black text-sm md:text-base transition-colors ${isSelected ? "text-emerald-600" : "text-slate-800"}`}>{vendor.name}</p>
                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${vendor.isOpen.includes("Open") ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                                                {vendor.isOpen}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-3 md:gap-x-5 gap-y-1">
                                                            <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 font-semibold">
                                                                <MapPin size={12} className="text-emerald-500 md:w-3.5 md:h-3.5" /> {vendor.distance} km • {vendor.address}
                                                            </div>
                                                            {vendor.isHomeDelivery && (
                                                                <div className="flex items-center gap-1 text-[10px] md:text-xs text-blue-600 font-bold">
                                                                    <Truck size={12} className="md:w-3.5 md:h-3.5" /> Free Delivery
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                                                    <div className="md:text-right">
                                                        <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">₹{vendor.price}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] md:text-xs text-slate-400 line-through">₹{vendor.mrp}</span>
                                                            {vendor.discount > 0 && <span className="text-[10px] md:text-xs text-emerald-600 font-black">{vendor.discount}% OFF</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCartAction(vendor);
                                                        }}
                                                        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl transition-all shadow-sm ${isSelected ? "bg-slate-900 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"}`}
                                                    >
                                                        <ShoppingCart size={16} className="md:w-[18px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- DETAILS SECTION --- */}
                <div className="mt-12 md:mt-16 bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex overflow-x-auto bg-slate-50/50 p-1.5 md:p-2 border-b border-slate-100 no-scrollbar">
                        {['Overview', 'Usage', 'Safety Advice'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-5 text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all rounded-xl md:rounded-[2rem] whitespace-nowrap ${activeTab === tab.toLowerCase()
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-8 p-6 md:p-16">
                            {activeTab === 'overview' && (
                                <div className="space-y-10 md:space-y-12">
                                    <section className="animate-in slide-in-from-bottom-2 duration-500">
                                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                            <div className="w-1 h-5 md:w-1.5 md:h-6 bg-emerald-500 rounded-full" />
                                            Introduction
                                        </h2>
                                        <p className="text-slate-600 leading-relaxed text-sm md:text-lg font-medium opacity-90">{product.introduction}</p>
                                    </section>
                                    <section className="animate-in slide-in-from-bottom-4 duration-500">
                                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                            <div className="w-1 h-5 md:w-1.5 md:h-6 bg-emerald-500 rounded-full" />
                                            Benefits & Therapeutic Uses
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                            {product.benefits?.split('.').map((b, i) => b.trim() && (
                                                <div key={i} className="flex gap-3 md:gap-4 text-[12px] md:text-sm text-slate-700 bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border border-slate-100 font-bold group hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
                                                    <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] md:text-[10px] shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    {b}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'usage' && (
                                <div className="space-y-10 md:space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                                    <section>
                                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-widest mb-4 md:mb-6">Mechanism of Action</h2>
                                        <div className="text-emerald-800 leading-relaxed text-base md:text-lg bg-emerald-50/50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] font-bold relative italic border border-emerald-100/50">
                                            <span className="absolute top-2 left-3 md:top-4 md:left-6 text-4xl md:text-6xl text-emerald-200 font-serif opacity-50">“</span>
                                            {product.how_works}
                                            <span className="absolute bottom-0 right-3 md:right-6 text-4xl md:text-6xl text-emerald-200 font-serif opacity-50 translate-y-2 md:translate-y-4">”</span>
                                        </div>
                                    </section>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                        <div className="p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 bg-slate-50/50">
                                            <h3 className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 md:mb-4">Instructions</h3>
                                            <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed">{product.how_to_use}</p>
                                        </div>
                                        <div className="p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 bg-slate-50/50">
                                            <h3 className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 md:mb-4">Missed Dose Guide</h3>
                                            <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed">{product.if_miss}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'safety advice' && (
                                <div className="space-y-10 md:space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                                    <section className="bg-red-50/50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-red-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 md:opacity-10">
                                            <AlertCircle size={60} className="text-red-600 md:w-[100px] md:h-[100px]" />
                                        </div>
                                        <h2 className="text-base md:text-lg font-black text-red-700 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                            <ShieldAlert size={20} className="md:w-6 md:h-6" /> Reported Side Effects
                                        </h2>
                                        <p className="text-xl md:text-2xl text-red-900 font-black mb-4 tracking-tight">{product.side_effect}</p>
                                        <div className="bg-white/60 p-3 md:p-4 rounded-xl md:rounded-2xl border border-red-100 inline-block">
                                            <p className="text-[12px] md:text-sm text-red-700 font-bold italic">Management: {product.how_crop_side_effects}</p>
                                        </div>
                                    </section>
                                    <section>
                                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-widest mb-4 md:mb-6">Clinical Safety Advice</h2>
                                        <div className="bg-blue-50/50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-blue-100 text-blue-900 text-sm md:text-lg leading-relaxed font-bold italic">
                                            {product.safety_advise}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>

                        {/* --- SIDEBAR --- */}
                        <div className="lg:col-span-4 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 md:p-16 space-y-8 md:space-y-10">
                            <TrustCard icon={<Truck size={20} className="text-emerald-500 md:w-6 md:h-6" />} title="Fast Shipping" desc="Hygienic packing & delivery within 24-48 hrs." />
                            <TrustCard icon={<ShieldCheck size={20} className="text-emerald-500 md:w-6 md:h-6" />} title="Genuine Product" desc="100% authentic medical supplies direct from partners." />
                            <TrustCard icon={<RotateCcw size={20} className="text-emerald-500 md:w-6 md:h-6" />} title="7-Day Returns" desc="Easy returns for unopened & damaged products." />

                            <div className="pt-8 md:pt-10 border-t border-slate-200">
                                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Manufacturer Details</p>
                                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase mb-2">{product.manufacturers}</p>
                                    <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-medium mb-6">{product.manufaturer_address}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase">Product ID</span>
                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400">#{product.Id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function QuickInfo({ label, value }) {
    return (
        <div className="space-y-1 md:space-y-1.5">
            <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[12px] md:text-sm font-black text-slate-800 truncate">{value || 'N/A'}</p>
        </div>
    );
}

function TrustCard({ icon, title, desc }) {
    return (
        <div className="flex gap-4 md:gap-5 group">
            <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <div>
                <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest mb-1 md:mb-1.5">{title}</h4>
                <p className="text-[11px] md:text-[12px] text-slate-500 leading-relaxed font-semibold opacity-80">{desc}</p>
            </div>
        </div>
    );
}

export default ProductDetailPage;