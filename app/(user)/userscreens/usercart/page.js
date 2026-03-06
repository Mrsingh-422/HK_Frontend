'use client';

import React, { useState } from 'react';
import {
    LuTrash2,
    LuPlus,
    LuMinus,
    LuShoppingCart,
    LuUpload,
    LuInfo,
    LuChevronLeft,
    LuShieldCheck
} from 'react-icons/lu';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Paracetamol 500mg",
            brand: "Cipla Health",
            type: "Tablet",
            price: 12.50,
            quantity: 2,
            requiresPrescription: false,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop"
        },
        {
            id: 2,
            name: "Amoxicillin 250mg",
            brand: "Abbott",
            type: "Capsule",
            price: 45.00,
            quantity: 1,
            requiresPrescription: true,
            image: "https://images.unsplash.com/photo-1471864190281-ad5fe9ac5722?w=200&h=200&fit=crop"
        }
    ]);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    const updateQuantity = (id, delta) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#F3F7F5] pb-32 md:pb-10"> {/* Extra bottom padding for mobile bar */}

            {/* --- MOBILE STICKY HEADER --- */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <button className="p-2 -ml-2 text-slate-600">
                        <LuChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">My Cart ({cartItems.length})</h1>
                    <div className="w-10"></div> {/* Spacer for symmetry */}
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-10">

                {/* --- DESKTOP HEADER --- */}
                <div className="hidden md:flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#08b36a] p-3 rounded-2xl text-white shadow-lg shadow-[#08b36a]/20">
                            <LuShoppingCart size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Shopping Cart</h1>
                    </div>
                    <button className="flex items-center gap-2 text-[#08b36a] font-bold hover:bg-[#08b36a]/5 px-4 py-2 rounded-xl transition-colors">
                        <LuChevronLeft /> Back to Shop
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LuShoppingCart size={40} className="text-slate-200" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700">Your cart is empty</h2>
                        <button className="mt-6 bg-[#08b36a] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#08b36a]/20">
                            Shop Medicines
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* --- ITEM LIST --- */}
                        <div className="flex-1 space-y-3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white p-3 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 md:gap-6 relative group">
                                    {/* Medicine Image */}
                                    <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start pr-2">
                                                <h3 className="font-bold text-slate-800 text-sm md:text-lg leading-tight line-clamp-1">{item.name}</h3>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <LuTrash2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-[11px] md:text-sm text-slate-400 font-medium uppercase tracking-wider">{item.brand}</p>

                                            {item.requiresPrescription && (
                                                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
                                                    <LuInfo size={12} /> RX Required
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-end justify-between mt-2">
                                            <span className="text-lg md:text-xl font-black text-[#08b36a]">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>

                                            {/* Quantity Controls - Compact on mobile */}
                                            <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100 scale-90 md:scale-100 origin-right">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#08b36a]"
                                                >
                                                    <LuMinus size={14} strokeWidth={3} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-slate-700">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#08b36a]"
                                                >
                                                    <LuPlus size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Prescription Card */}
                            {cartItems.some(i => i.requiresPrescription) && (
                                <div className="bg-[#08b36a]/5 border border-dashed border-[#08b36a]/30 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-full text-[#08b36a] shadow-sm">
                                        <LuUpload size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">Upload Prescription</p>
                                        <p className="text-[11px] text-slate-500">Needed for Amoxicillin and 1 other</p>
                                    </div>
                                    <button className="bg-white text-[#08b36a] px-4 py-2 rounded-lg text-xs font-bold border border-[#08b36a]/20 shadow-sm">
                                        Upload
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* --- DESKTOP SUMMARY (Hidden on Mobile) --- */}
                        <div className="hidden lg:block w-[380px]">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-10">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    Payment Details
                                </h2>

                                <div className="space-y-4 mb-8 border-b border-slate-50 pb-8">
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Cart Subtotal</span>
                                        <span className="text-slate-800 font-bold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Medical Tax (5%)</span>
                                        <span className="text-slate-800 font-bold">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Delivery Charge</span>
                                        <span className={`font-bold ${shipping === 0 ? 'text-[#08b36a]' : 'text-slate-800'}`}>
                                            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Payable</span>
                                    <span className="text-3xl font-black text-[#08b36a] tracking-tight">${total.toFixed(2)}</span>
                                </div>

                                <button className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#079d5d] transition-all shadow-xl shadow-[#08b36a]/20 flex items-center justify-center gap-3">
                                    Proceed to Checkout <LuShieldCheck size={20} />
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
                            <p className="text-2xl font-black text-[#08b36a]">${total.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400">Incl. all taxes</p>
                            <p className="text-[10px] text-[#08b36a] font-bold">Free Delivery Applied</p>
                        </div>
                    </div>
                    <button className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#08b36a]/30 active:scale-[0.98] transition-transform">
                        Checkout Now
                    </button>
                </div>
            )}

        </div>
    );
};

export default CartPage;