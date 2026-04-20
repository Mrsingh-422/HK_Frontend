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
    Info
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';
import { useCart } from '@/app/context/CartContext';
import { toast } from 'react-hot-toast';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop";

function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { cartItems, cartItemIds, refreshCart } = useCart();

    const [product, setProduct] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('overview');
    const [processingId, setProcessingId] = useState(null);

    // Find if current product is in cart and get its quantity
    const cartProduct = cartItems?.find(item =>
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
                    setProduct(res.medicineData);
                    setVendors(res.vendors || []);

                    // If product is already in cart, sync the local quantity state
                    if (cartProduct) {
                        setQuantity(cartProduct.quantity);
                    }
                }
            } catch (err) {
                console.error("Error fetching product details", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id, cartProduct]);

    // --- QUANTITY UPDATE LOGIC ---
    const handleUpdateQuantity = async (newQty) => {
        if (newQty < 1) return;

        // If not in cart yet, just update local state
        if (!isAdded) {
            setQuantity(newQty);
            return;
        }

        // If already in cart, call the Update API
        try {
            setProcessingId(id);
            const res = await UserAPI.updatePharmacyCartQuantity({
                medicineId: id,
                quantity: newQty
            });
            if (res.success) {
                setQuantity(newQty);
                if (refreshCart) refreshCart();
            }
        } catch (error) {
            toast.error("Failed to update quantity");
        } finally {
            setProcessingId(null);
        }
    };

    // --- ADD / REMOVE LOGIC ---
    const handleCartAction = async (selectedVendor = null, forceReplace = false) => {
        const vendor = selectedVendor || vendors[0];

        if (!vendor) {
            toast.error("No pharmacy available for this product");
            return;
        }

        try {
            setProcessingId(id);

            if (isAdded && !forceReplace && !selectedVendor) {
                // REMOVE LOGIC
                const res = await UserAPI.removeCartItem(id);
                if (res.success) {
                    toast.success("Removed from cart");
                    setQuantity(1);
                }
            } else {
                // ADD LOGIC (Matches your Controller)
                const cartData = {
                    pharmacyId: vendor.pharmacyId,
                    medicineId: id,
                    quantity: quantity,
                    duration: "Full Course",
                    forceReplace: forceReplace
                };

                const res = await UserAPI.addPharmacyToCart(cartData);

                // Handle the "Clear existing pharmacy items?" logic from your controller
                if (!res.success && res.canReplace) {
                    const confirmReplace = window.confirm("Your cart contains items from another pharmacy. Clear cart and add this item?");
                    if (confirmReplace) {
                        await handleCartAction(vendor, true);
                    }
                    return;
                }

                if (res.success) {
                    toast.success(forceReplace ? "Cart replaced & added" : "Added to cart");
                } else {
                    toast.error(res.message || "Failed to add");
                }
            }
            if (refreshCart) refreshCart();
        } catch (error) {
            console.error("Cart Error:", error);
            toast.error("Something went wrong");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-t-[#08B36A] border-gray-100 animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Details</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <h2 className="text-lg font-bold text-gray-800">Product Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-[#08B36A] text-white rounded-lg font-bold text-sm">
                Go Back
            </button>
        </div>
    );

    const savings = parseInt(product.mrp) - parseInt(product.best_price);

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased text-slate-900">
            {/* --- BREADCRUMB --- */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5">
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <button onClick={() => router.push('/buymedicine')} className="hover:text-[#08B36A]">Home</button>
                        <ChevronRight size={12} className="text-gray-300" />
                        <span>{product.bread_crumb?.split('>')[0].trim()}</span>
                        <ChevronRight size={12} className="text-gray-300" />
                        <span className="text-gray-900 truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT: PRODUCT IMAGE --- */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 sticky top-6">
                            <div className="relative aspect-square flex items-center justify-center bg-[#FDFDFD] rounded-xl overflow-hidden">
                                <img
                                    src={FALLBACK_IMAGE}
                                    alt={product.name}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                />
                                <div className="absolute top-0 left-0 flex flex-col gap-2">
                                    {product.prescription_required === "YES" && (
                                        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                                            <ShieldAlert size={12} /> Rx Required
                                        </span>
                                    )}
                                    {product.discont_percent && (
                                        <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase">
                                            {product.discont_percent} OFF
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: HEADER & PRICING --- */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                            <div className="pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[#08B36A] text-[10px] font-black uppercase tracking-[2px]">{product.manufacturers}</span>
                                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{product.packaging}</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>

                                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                                        <FlaskRound size={14} /> {product.salt_composition}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <ThermometerSnowflake size={14} /> {product.storage}
                                    </div>
                                </div>
                            </div>

                            <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black text-slate-900">₹{product.best_price}</span>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 line-through text-sm font-bold">MRP ₹{product.mrp}</span>
                                            <span className="text-[#08B36A] text-[10px] font-black uppercase tracking-tighter italic">Save ₹{savings}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Inclusive of all taxes</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-12">
                                        <button
                                            onClick={() => handleUpdateQuantity(quantity - 1)}
                                            className="px-4 hover:bg-white hover:text-[#08B36A] transition-colors h-full disabled:opacity-30"
                                            disabled={processingId === id}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center font-black text-slate-800">{quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(quantity + 1)}
                                            className="px-4 hover:bg-white hover:text-[#08B36A] transition-colors h-full disabled:opacity-30"
                                            disabled={processingId === id}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleCartAction()}
                                        disabled={processingId === id}
                                        className={`flex-1 md:flex-none px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-[1px] flex items-center justify-center gap-2 transition-all shadow-lg h-12 ${isAdded
                                            ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-red-50"
                                            : "bg-[#08B36A] text-white hover:bg-slate-900 shadow-emerald-100"
                                            }`}
                                    >
                                        {processingId === id ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : isAdded ? (
                                            <><Trash2 size={18} /> Remove</>
                                        ) : (
                                            <><ShoppingCart size={18} /> Add to Cart</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                                <QuickInfo label="Primary Use" value={product.primary_use} />
                                <QuickInfo label="Total Sellers" value={`${product.vendorCount} Vendors`} />
                                <QuickInfo label="Synonym" value={product.salt_synonmys} />
                            </div>
                        </div>

                        {/* --- SELLERS --- */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Store size={18} className="text-[#08B36A]" /> Sellers Near You
                                </h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{vendors.length} Pharmacies Found</span>
                            </div>

                            <div className="space-y-3">
                                {vendors.map((vendor, index) => {
                                    return (
                                        <div key={index} className="p-4 bg-[#FBFBFB] border border-gray-100 rounded-xl hover:border-[#08B36A]/30 transition-all group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-slate-800 text-sm group-hover:text-[#08B36A] transition-colors">{vendor.pharmacyName}</p>
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${vendor.isOpen === "Open Now" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                            {vendor.isOpen}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                                            <MapPin size={12} className="text-[#08B36A]" /> {vendor.distance} km • {vendor.city}
                                                        </div>
                                                        {vendor.isHomeDelivery && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                                                                <Truck size={12} /> Home Delivery
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-slate-900">₹{vendor.price}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-400 line-through">₹{vendor.mrp}</span>
                                                            <span className="text-[10px] text-orange-600 font-black">{vendor.discount}% OFF</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCartAction(vendor)}
                                                        className="bg-white border border-gray-200 text-gray-700 p-2 rounded-lg hover:bg-[#08B36A] hover:text-white transition-all shadow-sm"
                                                    >
                                                        <ShoppingCart size={16} />
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
                <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-gray-100 no-scrollbar">
                        {['Overview', 'Usage', 'Safety Advice'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${activeTab === tab.toLowerCase()
                                    ? 'border-[#08B36A] text-[#08B36A] bg-emerald-50/20'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-8 p-8 md:p-12">
                            {activeTab === 'overview' && (
                                <div className="space-y-10">
                                    <section>
                                        <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Info size={16} className="text-[#08B36A]" /> Introduction</h2>
                                        <p className="text-slate-600 leading-relaxed text-[15px]">{product.introduction}</p>
                                    </section>
                                    <section>
                                        <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#08B36A]" /> Benefits & Use Cases</h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {product.benefits?.split('.').map((b, i) => b.trim() && (
                                                <div key={i} className="flex gap-3 text-sm text-slate-600 bg-gray-50 p-4 rounded-xl border border-gray-100 font-medium">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#08B36A] mt-2 shrink-0" />
                                                    {b}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'usage' && (
                                <div className="space-y-10">
                                    <section>
                                        <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4">How it works</h2>
                                        <p className="text-slate-600 leading-relaxed text-[15px] bg-[#F1F5F9] p-6 rounded-2xl italic">"{product.how_works}"</p>
                                    </section>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <section>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Instructions</h3>
                                            <p className="text-sm font-bold text-slate-700">{product.how_to_use}</p>
                                        </section>
                                        <section>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Missed Dose</h3>
                                            <p className="text-sm font-bold text-slate-700">{product.if_miss}</p>
                                        </section>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'safety advice' && (
                                <div className="space-y-10">
                                    <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <h2 className="text-base font-black text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <AlertCircle size={20} /> Reported Side Effects
                                        </h2>
                                        <p className="text-red-700 font-bold text-lg mb-2">{product.side_effect}</p>
                                        <p className="text-xs text-red-600 font-medium">How to manage: {product.how_crop_side_effects}</p>
                                    </section>
                                    <section>
                                        <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4">Clinical Safety Advice</h2>
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 text-[15px] leading-relaxed font-medium italic">
                                            {product.safety_advise}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>

                        {/* --- SIDEBAR --- */}
                        <div className="lg:col-span-4 bg-[#FAFAFA] border-l border-gray-100 p-8 md:p-12 space-y-8">
                            <TrustCard icon={<Truck className="text-[#08B36A]" />} title="Fast Shipping" desc="Hygienic packing & delivery within 24-48 hrs." />
                            <TrustCard icon={<ShieldCheck className="text-[#08B36A]" />} title="Genuine Product" desc="100% authentic medical supplies direct from partners." />
                            <TrustCard icon={<RotateCcw className="text-[#08B36A]" />} title="7-Day Returns" desc="Easy returns for unopened & damaged products." />

                            <div className="pt-8 border-t border-gray-200">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Info</p>
                                <p className="text-xs font-bold text-slate-800 uppercase">{product.manufacturers}</p>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{product.manufaturer_address}</p>
                                <p className="text-[10px] text-gray-400 mt-4 italic">Product ID: {product.Id}</p>
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
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
            <p className="text-xs font-bold text-slate-800 truncate">{value || 'N/A'}</p>
        </div>
    );
}

function TrustCard({ icon, title, desc }) {
    return (
        <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">{icon}</div>
            <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">{title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal font-medium">{desc}</p>
            </div>
        </div>
    );
}

export default ProductDetailPage;