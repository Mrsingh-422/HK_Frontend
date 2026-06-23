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
import CostoumPopup from '@/lib/CostoumPopup';

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

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
        const token = localStorage.getItem('userToken');
        if (!token) {
            CostoumPopup("Please Login To Continue", "warning", 4000);
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
                // toast.success(`Added to cart from ${vendor.name}`);
                CostoumPopup("Test added to cart", "success", 3000);
                router.push("/userscreens/usercart");

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
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Medicine Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-bold">Go Back</button>
        </div>
    );

    const currentPrice = vendors[selectedVendorIndex]?.price || product.best_price;
    const currentMrp = vendors[selectedVendorIndex]?.mrp || product.mrp;
    const savings = parseInt(currentMrp) - parseInt(currentPrice);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Conflict Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Replace cart items?</h3>
                        <p className="text-slate-500 text-sm mb-6">Your cart has items from another pharmacy. Adding this will clear your current cart.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConflictModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl">Cancel</button>
                            <button onClick={handleConfirmClearCart} className="flex-1 py-3 text-sm font-bold text-white bg-emerald-500 rounded-xl">Clear & Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-400 overflow-x-auto no-scrollbar">
                        <button onClick={() => router.push('/buymedicine')} className="hover:text-emerald-500">Shop</button>
                        <ChevronRight size={12} />
                        <span className="truncate">{product.bread_crumb?.split('>')[0].trim()}</span>
                        <ChevronRight size={12} />
                        <span className="text-emerald-600 font-bold truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Product Image */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-8 sticky top-20">
                            <div className="relative aspect-square bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                                <img
                                    src={FALLBACK_IMAGE}
                                    alt={product.name}
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="w-4/5 h-4/5 object-contain cursor-zoom-in transition-opacity hover:opacity-90"
                                />
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {product.prescription_required === "YES" && (
                                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                                            <ShieldAlert size={12} /> Rx Required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info & Pricing */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8">
                            <div className="mb-6">
                                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">{product.manufacturers}</span>
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 mt-1">{product.name}</h1>
                                <p className="text-slate-400 text-xs mt-1">{product.packaging}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-600">
                                    <FlaskRound size={14} className="text-emerald-500" /> {product.salt_composition}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-600">
                                    <ThermometerSnowflake size={14} className="text-blue-400" /> {product.storage}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-100">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-slate-900">₹{currentPrice}</span>
                                        <span className="text-slate-400 line-through text-sm">MRP ₹{currentMrp}</span>
                                        {savings > 0 && <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">Save ₹{savings}</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Inclusive of all taxes</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                        <button onClick={() => handleUpdateQuantity('dec')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all" disabled={processingId === id}>
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                                        <button onClick={() => handleUpdateQuantity('inc')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all" disabled={processingId === id}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleCartAction()}
                                        disabled={processingId === id}
                                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isAdded ? "bg-slate-900 text-white" : "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                                            }`}
                                    >
                                        {processingId === id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isAdded ? <><Trash2 size={16} /> Remove</> : <><ShoppingCart size={16} /> Add to Cart</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sellers Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold flex items-center gap-2"><Store size={16} className="text-emerald-500" /> Available Sellers</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{vendors.length} Near You</span>
                            </div>

                            <div className="space-y-3">
                                {vendors.map((vendor, index) => {
                                    const isSelected = selectedVendorIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedVendorIndex(index)}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-emerald-200"}`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={getImageUrl(vendor.image)} className="w-10 h-10 rounded-lg object-cover border border-slate-200" alt="" onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/822/822143.png"} />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{vendor.name}</p>
                                                        <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={10} className="text-emerald-500" /> {vendor.distance} km • {vendor.address}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">₹{vendor.price}</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold">{vendor.discount}% OFF</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                        {['Overview', 'Usage', 'Safety Advice'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.toLowerCase() ? 'bg-white text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-10">
                        {activeTab === 'overview' && (
                            <div className="max-w-3xl space-y-8">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Introduction</h4>
                                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">{product.introduction}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Key Benefits</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {product.benefits?.split('.').map((b, i) => b.trim() && (
                                            <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium text-slate-700">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">{i + 1}</div>
                                                {b}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'usage' && (
                            <div className="max-w-3xl space-y-8">
                                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                                    <h4 className="text-xs font-bold text-emerald-700 uppercase mb-2">How it works</h4>
                                    <p className="text-sm font-medium text-emerald-900 leading-relaxed italic">"{product.how_works}"</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Usage Guide</h4>
                                        <p className="text-sm text-slate-700 font-medium">{product.how_to_use}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Missed Dose</h4>
                                        <p className="text-sm text-slate-700 font-medium">{product.if_miss}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'safety advice' && (
                            <div className="max-w-3xl space-y-6">
                                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                    <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Safety Advice</h4>
                                    <p className="text-slate-600 leading-relaxed text-sm">{product.safety_advice || "Please consult your doctor before using this medicine."}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* LIGHTBOX / FULL SCREEN MODAL */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={FALLBACK_IMAGE}
                            className="max-w-full max-h-full object-contain rounded-2xl animate-in zoom-in-95 duration-200 cursor-default"
                            alt={product.name}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function TrustCard({ icon, title, desc }) {
    return (
        <div className="flex gap-3">
            <div className="shrink-0 w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">{icon}</div>
            <div>
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{title}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}

export default ProductDetailPage;