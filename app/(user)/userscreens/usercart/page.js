"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaTrashAlt,
    FaPlus,
    FaMinus,
    FaShoppingCart,
    FaCloudUploadAlt,
    FaInfoCircle,
    FaChevronLeft,
    FaShieldAlt,
    FaPrescriptionBottleAlt
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext'; // Ensure the path is correct

const CartPage = () => {
    const router = useRouter();
    const { cart, updateQuantity, removeItem, loading } = useCart();

    // --- Dynamic Calculations ---
    const totals = useMemo(() => {
        if (!cart || !cart.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };

        // Note: cart.items from backend usually has i.price and i.quantity
        const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05; // 5% Medical Tax
        const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50; // Free over ₹500
        const total = subtotal + tax + shipping;

        return { subtotal, tax, shipping, total };
    }, [cart]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F7F5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08b36a]"></div>
            </div>
        );
    }

    const cartItems = cart?.items || [];

    return (
        <div className="min-h-screen bg-[#F3F7F5] pb-32 md:pb-10">

            {/* --- MOBILE STICKY HEADER --- */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600">
                        <FaChevronLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">My Cart ({cartItems.length})</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-10">

                {/* --- DESKTOP HEADER --- */}
                <div className="hidden md:flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#08b36a] p-3 rounded-2xl text-white shadow-lg shadow-[#08b36a]/20">
                            <FaShoppingCart size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Shopping Cart</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-[#08b36a] font-bold hover:bg-[#08b36a]/5 px-4 py-2 rounded-xl transition-colors"
                    >
                        <FaChevronLeft size={14} /> Back to Shop
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaPrescriptionBottleAlt size={40} className="text-slate-200" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700">Your basket is empty</h2>
                        <p className="text-slate-400 text-sm mt-2">Looks like you haven't added any diagnostics yet.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 bg-[#08b36a] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#08b36a]/20"
                        >
                            Browse Services
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* --- ITEM LIST --- */}
                        <div className="flex-1 space-y-3">
                            {cartItems.map((item) => (
                                <div key={item._id} className="bg-white p-3 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 md:gap-6 relative group">
                                    {/* Item Image (Defaults to Category Icon if missing) */}
                                    <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <FaPrescriptionBottleAlt className="text-slate-200 text-3xl" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start pr-2">
                                                <h3 className="font-bold text-slate-800 text-sm md:text-lg leading-tight line-clamp-1">
                                                    {item.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeItem(item.itemId._id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <FaTrashAlt size={16} />
                                                </button>
                                            </div>
                                            <p className="text-[11px] md:text-sm text-slate-400 font-medium uppercase tracking-wider">
                                                {item.productType === 'LabTest' ? 'Diagnostic Test' : 'Health Package'}
                                            </p>

                                            {/* Logic for Prescription Required (if applicable) */}
                                            {item.requiresPrescription && (
                                                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
                                                    <FaInfoCircle size={10} /> RX Required
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-end justify-between mt-2">
                                            <span className="text-lg md:text-xl font-black text-[#08b36a]">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </span>

                                            {/* Quantity Controls - Context Linked */}
                                            <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100 scale-90 md:scale-100 origin-right">
                                                <button
                                                    onClick={() => updateQuantity(item.itemId._id, 'dec')}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#08b36a]"
                                                >
                                                    <FaMinus size={12} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-slate-700">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.itemId._id, 'inc')}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#08b36a]"
                                                >
                                                    <FaPlus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Prescription Helper UI (Dynamic) */}
                            {cartItems.some(i => i.requiresPrescription) && (
                                <div className="bg-[#08b36a]/5 border border-dashed border-[#08b36a]/30 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-full text-[#08b36a] shadow-sm">
                                        <FaCloudUploadAlt size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">Upload Prescription</p>
                                        <p className="text-[11px] text-slate-500">Required for items marked with RX</p>
                                    </div>
                                    <button className="bg-white text-[#08b36a] px-4 py-2 rounded-lg text-xs font-bold border border-[#08b36a]/20 shadow-sm">
                                        Upload
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* --- DESKTOP SUMMARY --- */}
                        <div className="hidden lg:block w-[380px]">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-10">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-8 border-b border-slate-50 pb-8">
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Cart Subtotal</span>
                                        <span className="text-slate-800 font-bold">₹{totals.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Medical Tax (5%)</span>
                                        <span className="text-slate-800 font-bold">₹{totals.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Collection Charge</span>
                                        <span className={`font-bold ${totals.shipping === 0 ? 'text-[#08b36a]' : 'text-slate-800'}`}>
                                            {totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Payable</span>
                                    <span className="text-3xl font-black text-[#08b36a] tracking-tight">₹{totals.total.toLocaleString()}</span>
                                </div>

                                <button
                                    onClick={() => router.push('/checkout')}
                                    className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#079d5d] transition-all shadow-xl shadow-[#08b36a]/20 flex items-center justify-center gap-3"
                                >
                                    Proceed to Checkout <FaShieldAlt size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* --- MOBILE FIXED BOTTOM BAR --- */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 md:hidden z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Total Amount</p>
                            <p className="text-2xl font-black text-[#08b36a]">₹{totals.total.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400">Incl. all taxes</p>
                            {totals.shipping === 0 && <p className="text-[10px] text-[#08b36a] font-bold">Free Collection</p>}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/checkout')}
                        className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#08b36a]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                    >
                        Checkout Now <FaShieldAlt size={18} />
                    </button>
                </div>
            )}

        </div>
    );
};

export default CartPage;