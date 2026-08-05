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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";
const FALLBACK_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/043/987/887/small/medicine-3d-icon-png.png";

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

    // Substitutes State
    const [substitutes, setSubstitutes] = useState([]);
    const [loadingSubstitutes, setLoadingSubstitutes] = useState(false);

    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingVendor, setPendingVendor] = useState(null);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Tracking which alternative brand is currently being queried
    const [searchingBrand, setSearchingBrand] = useState(null);

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

    // Fetch substitutes with the same chemical composition
    useEffect(() => {
        const fetchSubstitutes = async () => {
            if (!id) return;
            try {
                setLoadingSubstitutes(true);
                const res = await UserAPI.getSameCompositionMedicine(id);
                if (res && res.success) {
                    setSubstitutes(res.data || []);
                }
            } catch (err) {
                console.error("Error fetching composition substitutes:", err);
            } finally {
                setLoadingSubstitutes(false);
            }
        };
        fetchSubstitutes();
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
            CostoumPopup("No pharmacy available for this product", "warning", 3000);
            return;
        }

        // Normalize the target pharmacy ID cleanly to handle both string and object shapes
        const targetPharmacyId = vendor.pharmacyId?._id || (typeof vendor.pharmacyId === 'string' ? vendor.pharmacyId : null) || vendor.vendorId || vendor._id;

        if (!isAdded || selectedVendor) {
            const currentPharmacyIdInCart = pharmacyCart?.items?.[0]?.pharmacyId?._id || pharmacyCart?.items?.[0]?.pharmacyId;

            if (currentPharmacyIdInCart && currentPharmacyIdInCart !== targetPharmacyId) {
                setPendingVendor(vendor);
                setShowConflictModal(true);
                return;
            }
        }

        try {
            setProcessingId(id);

            if (isAdded && !selectedVendor) {
                await removePharmacyItem(id);
                CostoumPopup("Product removed from cart", "success", 3000);
            } else {
                await addPharmacyToCart(
                    targetPharmacyId,
                    id,
                    quantity,
                    "Full Course"
                );
                CostoumPopup("Product added to cart", "success", 3000);
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

        // Normalize the target pharmacy ID safely
        const targetPharmacyId = pendingVendor.pharmacyId?._id || (typeof pendingVendor.pharmacyId === 'string' ? pendingVendor.pharmacyId : null) || pendingVendor.vendorId || pendingVendor._id;

        try {
            setProcessingId(id);
            await clearFullCart();
            await addPharmacyToCart(
                targetPharmacyId,
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

    // Queries alternate brand information and redirects on success
    const handleAlternativeBrandClick = async (name) => {
        if (!name) return;
        setSearchingBrand(name);
        try {
            const res = await UserAPI.searchAlternativeBrand(name);
            if (res && res.success) {
                router.push(`/buymedicine/singleproductdetail/${res.data.details._id}`);
            } else {
                toast.error("Medicine details not found for this alternative");
            }
        } catch (error) {
            console.error("Error navigating to alternative brand:", error);
            toast.error("Failed to load alternative brand details");
        } finally {
            setSearchingBrand(null);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return FALLBACK_IMAGE;
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}/${path.replace('public/', '')}`;
    };

    // Helper to safely parse pipe-separated alternative brands from the response
    const parseAlternateBrands = (altString) => {
        if (!altString) return [];
        return altString.split('|').map(item => {
            const parts = item.split('::').map(p => p.trim());
            return {
                name: parts[0] || '',
                manufacturer: parts[1] || '',
                priceInfo: parts[2] || '',
                savingsInfo: parts[3] || ''
            };
        }).filter(brand => brand.name);
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

    // Dynamic Image Determination
    const displayImage = product.image_url && product.image_url.length > 0
        ? getImageUrl(product.image_url[0])
        : FALLBACK_IMAGE;

    const alternateBrandsList = parseAlternateBrands(product.alternate_brand);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100">
            {/* Conflict Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 md:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert className="text-rose-500" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Replace cart items?</h3>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">Your cart has items from another pharmacy. Adding this will clear your current cart.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="flex-1 py-3 text-xs md:text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearCart}
                                className="flex-1 py-3 text-xs md:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-100"
                            >
                                Clear & Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <div className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all">
                <div className="max-w-6xl mx-auto px-4 py-3.5">
                    <nav className="flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-400 overflow-x-auto no-scrollbar">
                        <button onClick={() => router.push('/buymedicine')} className="hover:text-emerald-500 transition-colors uppercase tracking-wider">Shop</button>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span className="truncate max-w-[150px] md:max-w-xs">{product.bread_crumb?.split('>')[0].trim()}</span>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span className="text-emerald-600 font-bold truncate max-w-[200px] md:max-w-sm">{product.name}</span>
                    </nav>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Product Image */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] p-6 md:p-10 sticky top-24 transition-all hover:shadow-[0_8px_40px_rgba(0,0,0,0.03)] group">
                            <div className="relative aspect-square bg-[#F8FAFC] rounded-2xl flex items-center justify-center overflow-hidden border border-slate-50">
                                <img
                                    src={displayImage}
                                    alt={product.name}
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="w-4/5 h-4/5 object-contain cursor-zoom-in transition-all duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {product.prescription_required === "YES" && (
                                        <span className="bg-rose-50/90 backdrop-blur-sm text-rose-600 text-[9px] md:text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1 shadow-sm">
                                            <ShieldAlert size={12} /> Rx Required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info & Pricing */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] p-6 md:p-8 space-y-6">
                            <div>
                                <span className="text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest">{product.manufacturers}</span>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 leading-tight tracking-tight">{product.name}</h1>
                                <p className="text-slate-400 text-xs md:text-sm font-medium mt-1.5">{product.packaging}</p>
                            </div>

                            {/* Tags and Metadata Grid */}
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/50 text-[11px] font-medium text-slate-600">
                                    <FlaskRound size={13} className="text-emerald-500 shrink-0" />
                                    <span><strong className="text-slate-800 font-semibold mr-1">Composition:</strong> {product.salt_composition}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/50 text-[11px] font-medium text-slate-600">
                                    <ThermometerSnowflake size={13} className="text-blue-400 shrink-0" />
                                    <span>{product.storage}</span>
                                </div>
                                {product.primary_use && (
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/50 text-[11px] font-medium text-slate-600">
                                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                        <span>{product.primary_use}</span>
                                    </div>
                                )}
                            </div>

                            {/* Brief Description Block */}
                            {product.description && (
                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-slate-50">
                                    {product.description}
                                </p>
                            )}

                            {/* Pricing Card Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-100">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl md:text-4xl font-black text-slate-950">₹{currentPrice}</span>
                                        <span className="text-slate-400 line-through text-xs md:text-sm font-medium">MRP ₹{currentMrp}</span>
                                        {savings > 0 && (
                                            <span className="text-emerald-700 text-[11px] font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                                Save {product.discont_percent || `${Math.round((savings / currentMrp) * 100)}%`}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Inclusive of all taxes</p>
                                </div>

                                {/* Cart Management Controls */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/50">
                                        <button
                                            onClick={() => handleUpdateQuantity('dec')}
                                            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 active:scale-95 text-slate-700 rounded-lg shadow-sm transition-all"
                                            disabled={processingId === id}
                                        >
                                            <Minus size={12} strokeWidth={2.5} />
                                        </button>
                                        <span className="w-10 text-center font-extrabold text-sm text-slate-800">{quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity('inc')}
                                            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 active:scale-95 text-slate-700 rounded-lg shadow-sm transition-all"
                                            disabled={processingId === id}
                                        >
                                            <Plus size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleCartAction()}
                                        disabled={processingId === id}
                                        className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${isAdded
                                                ? "bg-slate-900 text-white hover:bg-slate-850 active:scale-98 shadow-md"
                                                : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-98 shadow-lg shadow-emerald-100"
                                            }`}
                                    >
                                        {processingId === id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : isAdded ? (
                                            <><Trash2 size={14} /> Remove</>
                                        ) : (
                                            <><ShoppingCart size={14} /> Add to Cart</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sellers Section */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Store size={15} className="text-emerald-500" /> Available Sellers
                                </h3>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{vendors.length} Near You</span>
                            </div>

                            <div className="space-y-3">
                                {vendors.map((vendor, index) => {
                                    const isSelected = selectedVendorIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedVendorIndex(index)}
                                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${isSelected
                                                    ? "border-emerald-500 bg-emerald-50/20 shadow-[0_4px_20px_rgba(16,185,129,0.04)]"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(vendor.image)}
                                                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                        alt=""
                                                        onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/822/822143.png"; }}
                                                    />
                                                    <div>
                                                        <p className="text-xs md:text-sm font-bold text-slate-800">{vendor.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} className="text-emerald-500 shrink-0" />
                                                            {vendor.distance} km • {vendor.address}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-extrabold text-slate-900">₹{vendor.price}</p>
                                                    <p className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50/60 px-1.5 py-0.5 rounded-md mt-0.5">
                                                        {vendor.discount}% OFF
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section (Tabs) */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] overflow-hidden">
                    {/* Modern Segments Navigation */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1.5">
                        {['Overview', 'Usage', 'Safety Advice'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`px-5 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === tab.toLowerCase()
                                        ? 'bg-white text-emerald-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100/50'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'overview' && (
                            <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Introduction</h4>
                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">{product.introduction}</p>
                                </div>
                                {product.benefits && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Benefits</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            {product.benefits?.split('.').map((b, i) => b.trim() && (
                                                <div key={i} className="flex gap-3.5 p-4 bg-slate-50/70 rounded-2xl border border-slate-100/40 text-xs font-medium text-slate-700">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold flex items-center justify-center shrink-0 text-[10px]">{i + 1}</div>
                                                    <span className="leading-relaxed">{b}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {product.side_effect && (
                                    <div className="border-t border-slate-100 pt-6 space-y-3">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Side Effects</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {product.side_effect.split('|').map((effect, idx) => (
                                                <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] px-3 py-1.5 rounded-full font-bold">
                                                    {effect.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {product.how_crop_side_effects && (
                                    <div className="bg-amber-50/40 border border-amber-100/80 p-5 rounded-2xl">
                                        <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-2">How to Manage Side Effects</h4>
                                        <p className="text-xs text-amber-900/90 leading-relaxed font-semibold">{product.how_crop_side_effects}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'usage' && (
                            <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                                {product.how_works && (
                                    <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100/60">
                                        <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">How it works</h4>
                                        <p className="text-xs md:text-sm font-semibold text-emerald-900 leading-relaxed italic">"{product.how_works}"</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {product.how_to_use && (
                                        <div className="p-5 rounded-2xl border border-slate-100">
                                            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Usage Guide</h4>
                                            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">{product.how_to_use}</p>
                                        </div>
                                    )}
                                    {product.if_miss && (
                                        <div className="p-5 rounded-2xl border border-slate-100">
                                            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Missed Dose</h4>
                                            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">{product.if_miss}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'safety advice' && (
                            <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
                                <div className="bg-rose-50/40 p-6 rounded-2xl border border-rose-100/80">
                                    <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mb-2">Safety Advice</h4>
                                    <p className="text-rose-900/90 leading-relaxed text-xs md:text-sm font-medium">
                                        {product.safety_advise || product.safety_advice || "Please consult your doctor before using this medicine."}
                                    </p>
                                </div>
                                {product.manufaturer_address && (
                                    <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-1.5">
                                        <h4 className="font-bold text-slate-700 uppercase tracking-widest text-[9px] mb-2">Manufacturer Address</h4>
                                        <p className="font-semibold text-slate-600">{product.manufacturers}</p>
                                        <p className="leading-relaxed text-slate-400">{product.manufaturer_address}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Same Composition Substitutes Section */}
                {substitutes.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] p-6 md:p-8">
                        <div className="border-b border-slate-100 pb-4 mb-6">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Same Composition Substitutes</h3>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Other brands with identical active ingredients</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {substitutes.map((sub) => {
                                const hasDiscount = sub.discount > 0;
                                return (
                                    <div
                                        key={sub.medicineId}
                                        onClick={() => router.push(`/buymedicine/singleproductdetail/${sub.medicineId}`)}
                                        className="group bg-white border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_12px_30px_rgba(16,185,129,0.06)] rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                                    >
                                        <div>
                                            {/* Card Image */}
                                            <div className="relative aspect-square w-full bg-[#F8FAFC] rounded-xl flex items-center justify-center overflow-hidden mb-3.5 border border-slate-50">
                                                <img
                                                    src={getImageUrl(sub.image)}
                                                    alt={sub.name}
                                                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                                    className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {sub.prescriptionRequired === "YES" && (
                                                    <span className="absolute top-2 left-2 bg-rose-50/90 text-rose-600 text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-rose-100/60 shadow-sm">
                                                        Rx
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <h4 className="font-extrabold text-xs md:text-sm text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{sub.name}</h4>
                                            <p className="text-[9px] md:text-[10px] text-slate-400 mt-1 truncate font-medium">{sub.salt}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5 font-semibold">{sub.packaging}</p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xs md:text-sm font-black text-slate-900">₹{sub.bestPrice}</span>
                                                {sub.mrp > sub.bestPrice && (
                                                    <span className="text-slate-300 line-through text-[9px] md:text-[10px]">₹{sub.mrp}</span>
                                                )}
                                            </div>
                                            {hasDiscount && (
                                                <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded">
                                                    {sub.discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Alternative Brands Section at Bottom */}
                {alternateBrandsList.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Alternative Brands
                                </h3>
                                <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">Other medications with equivalent therapeutic effects</p>
                            </div>
                            <span className="self-start md:self-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50 uppercase tracking-wider">
                                {alternateBrandsList.length} Options
                            </span>
                        </div>

                        {/* Interactive List Wrapper */}
                        <div className="divide-y divide-slate-100">
                            {alternateBrandsList.map((brand, index) => {
                                const isSearchingThis = searchingBrand === brand.name;
                                const isCostlier = brand.savingsInfo?.toLowerCase().includes('costlier');

                                return (
                                    <div
                                        key={index}
                                        onClick={() => !searchingBrand && handleAlternativeBrandClick(brand.name)}
                                        className={`group relative py-4 px-3 -mx-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:bg-slate-50/80
                                            ${searchingBrand && !isSearchingThis ? 'opacity-40 pointer-events-none' : ''}`}
                                    >
                                        {/* Left Side: Product Information */}
                                        <div className="flex items-start gap-3">
                                            {/* Micro-Icon */}
                                            <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-emerald-100/60 transition-colors">
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-extrabold text-sm md:text-base text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                                                    {brand.name}
                                                </h4>
                                                <p className="text-[10px] md:text-xs text-slate-400 font-semibold flex items-center gap-1">
                                                    by <span className="text-slate-600 font-bold">{brand.manufacturer}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side: Price, Badges, & Action Trigger */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                                            <div className="text-left sm:text-right space-y-1">
                                                <p className="text-xs md:text-sm font-black text-slate-900">{brand.priceInfo}</p>
                                                {brand.savingsInfo && (
                                                    <div className="flex items-center sm:justify-end">
                                                        <span className={`inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm border ${isCostlier
                                                                ? 'text-rose-600 bg-rose-50/60 border-rose-100/50'
                                                                : 'text-emerald-700 bg-emerald-50/80 border-emerald-100/50'
                                                            }`}>
                                                            <span className={`w-1 h-1 rounded-full ${isCostlier ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                            {brand.savingsInfo}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Indicator */}
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all shrink-0">
                                                {isSearchingThis ? (
                                                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <svg
                                                        className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-all transform group-hover:translate-x-0.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* LIGHTBOX / FULL SCREEN MODAL */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={displayImage}
                            className="max-w-full max-h-full object-contain rounded-2xl animate-in zoom-in-95 duration-200 cursor-default shadow-2xl"
                            alt={product.name}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailPage;