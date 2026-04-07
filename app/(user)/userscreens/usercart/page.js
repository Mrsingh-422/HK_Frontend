"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaTrashAlt, FaPlus, FaMinus, FaShoppingCart,
    FaChevronLeft, FaShieldAlt, FaPrescriptionBottleAlt,
    FaTag, FaPercent, FaTimes, FaCheckCircle, FaInfoCircle
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';

// --- Professional Medical Coupons ---
const AVAILABLE_COUPONS = [
    { id: 1, code: "KANGAROO20", discount: 20, type: "percent", desc: "20% OFF on all tests", minOrder: 1000 },
    { id: 2, code: "SAVE100", discount: 100, type: "fixed", desc: "Flat ₹100 OFF", minOrder: 1500 },
    { id: 3, code: "FIRSTBOOK", discount: 15, type: "percent", desc: "15% New User Discount", minOrder: 500 },
];

const CartPage = () => {
    const router = useRouter();
    const { cart, updateQuantity, removeItem, loading } = useCart();

    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null); 
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!loading && cart) setInitialLoadDone(true);
    }, [loading, cart]);

    // --- Dynamic Calculations ---
    const totals = useMemo(() => {
        if (!cart || !cart.items) return { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 };

        const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        let discount = 0;
        if (appliedCoupon) {
            // Logic: Auto-remove if quantity change drops subtotal below limit
            if (subtotal < appliedCoupon.minOrder) {
                setAppliedCoupon(null);
                toast.error(`Coupon removed: ₹${appliedCoupon.minOrder} min order required`);
            } else {
                discount = appliedCoupon.type === "percent" 
                    ? (subtotal * appliedCoupon.discount) / 100 
                    : appliedCoupon.discount;
            }
        }
        
        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = taxableAmount * 0.05; 
        const shipping = (subtotal > 500 || subtotal === 0) ? 0 : 50;
        const total = taxableAmount + tax + shipping;

        return { subtotal, tax, shipping, discount, total };
    }, [cart, appliedCoupon]);

    const handleApply = (coupon) => {
        if (totals.subtotal < coupon.minOrder) {
            return toast.error(`Add ₹${coupon.minOrder - totals.subtotal} more to use this code`);
        }
        setIsApplying(true);
        setTimeout(() => {
            setAppliedCoupon(coupon);
            setCouponCode(coupon.code);
            setIsApplying(false);
            toast.success(`Code ${coupon.code} applied!`);
        }, 500);
    };

    if (loading && !initialLoadDone) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const cartItems = cart?.items || [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32 md:pb-10">
            {/* Mobile Nav */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 text-slate-600"><FaChevronLeft size={20} /></button>
                    <h1 className="text-lg font-bold text-slate-800">Review Cart</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-10">
                <div className="hidden md:flex items-center gap-4 mb-10">
                    <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200"><FaShoppingCart size={24} /></div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
                        <FaPrescriptionBottleAlt size={60} className="text-slate-200 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800">Your basket is empty</h2>
                        <p className="text-slate-400 mt-2">Looks like you haven't added any diagnostics yet.</p>
                        <button onClick={() => router.push('/')} className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-slate-900 transition-all">Explore Tests</button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        
                        {/* LEFT: ITEM LIST */}
                        <div className="flex-1 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item._id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 text-3xl">
                                        <FaPrescriptionBottleAlt />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-base md:text-lg line-clamp-1">{item.name}</h3>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                    {item.productType === 'LabTest' ? 'Test' : 'Package'}
                                                </span>
                                            </div>
                                            <button onClick={() => removeItem(item.itemId._id)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                                                <FaTrashAlt size={16}/>
                                            </button>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-bold">Item Total</span>
                                                <span className="text-xl font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                <button onClick={() => item.quantity > 1 && updateQuantity(item.itemId._id, 'dec')} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"><FaMinus size={12}/></button>
                                                <span className="w-10 text-center font-black text-slate-800">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.itemId._id, 'inc')} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"><FaPlus size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT: BILLING & COUPONS */}
                        <div className="w-full lg:w-[420px] sticky top-10 space-y-6">
                            
                            {/* COUPON WIDGET */}
                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <FaTag className="text-emerald-600" /> Apply Promo Code
                                </h3>

                                {!appliedCoupon ? (
                                    <div className="relative mb-6">
                                        <input 
                                            type="text" 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter Code"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase"
                                        />
                                        <button 
                                            onClick={() => {
                                                const c = AVAILABLE_COUPONS.find(x => x.code === couponCode);
                                                if(c) handleApply(c); else toast.error("Invalid Code");
                                            }}
                                            className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl text-xs font-black hover:bg-emerald-600 transition-colors"
                                        >
                                            APPLY
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-600 text-white p-4 rounded-2xl mb-6 flex justify-between items-center animate-in zoom-in duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/20 p-2 rounded-lg"><FaPercent size={14}/></div>
                                            <div>
                                                <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Applied & Saved ₹{Math.round(totals.discount)}</p>
                                                <p className="font-black text-base">{appliedCoupon.code}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setAppliedCoupon(null)} className="hover:rotate-90 transition-transform p-2"><FaTimes/></button>
                                    </div>
                                )}

                                {/* AVAILABLE OFFERS SCROLLER */}
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Suggested for you</p>
                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                    {AVAILABLE_COUPONS.map((coupon) => {
                                        const isSelected = appliedCoupon?.code === coupon.code;
                                        const isDisabled = totals.subtotal < coupon.minOrder;
                                        
                                        return (
                                            <div 
                                                key={coupon.id}
                                                onClick={() => !isSelected && !isDisabled && handleApply(coupon)}
                                                className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                                                    isSelected ? "border-emerald-600 bg-emerald-50" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                                } ${isDisabled ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-black text-slate-800 text-sm">{coupon.code}</span>
                                                    {isSelected ? <FaCheckCircle className="text-emerald-600"/> : <span className="text-[10px] font-black text-emerald-600">APPLY</span>}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium">{coupon.desc}</p>
                                                {isDisabled && <p className="text-[9px] text-rose-500 font-bold mt-1">Add ₹{coupon.minOrder - totals.subtotal} more</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BILLING SUMMARY */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Payment Summary</h3>
                                
                                <div className="space-y-4 mb-8 border-b border-slate-50 pb-8">
                                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                                        <span>Order Subtotal</span>
                                        <span className="text-slate-900 font-bold">₹{totals.subtotal.toLocaleString()}</span>
                                    </div>
                                    
                                    {totals.discount > 0 && (
                                        <div className="flex justify-between text-emerald-600 text-sm font-bold bg-emerald-50 p-2 rounded-lg">
                                            <span className="flex items-center gap-2"><FaTag size={12}/> Promo Discount</span>
                                            <span>-₹{Math.round(totals.discount).toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                                        <span className="flex items-center gap-1">Medical Tax (5%) <FaInfoCircle size={10} className="text-slate-300 cursor-help"/></span>
                                        <span className="text-slate-900 font-bold">₹{Math.round(totals.tax).toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                                        <span>Home Collection Charge</span>
                                        <span className={totals.shipping === 0 ? "text-emerald-600 font-bold" : "text-slate-900 font-bold"}>
                                            {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payable</p>
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{Math.round(totals.total).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-emerald-600 font-black px-2 py-1 bg-emerald-50 rounded-lg">SAFE & SECURE</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => router.push('/checkout')} 
                                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    Proceed to Checkout <FaShieldAlt size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MOBILE STICKY BAR */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-5 md:hidden z-30 shadow-[0_-15px_30px_rgba(0,0,0,0.08)] rounded-t-[2.5rem] border-t border-slate-50">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Total to pay</p>
                            <p className="text-2xl font-black text-slate-900">₹{Math.round(totals.total).toLocaleString()}</p>
                        </div>
                        {totals.discount > 0 ? (
                            <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black animate-bounce-subtle">SAVED ₹{Math.round(totals.discount)}</span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">Incl. all taxes</span>
                        )}
                    </div>
                    <button onClick={() => router.push('/checkout')} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100">
                        Checkout Now
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;