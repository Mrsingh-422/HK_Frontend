"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrashAlt, FaPlus, FaMinus, FaPills, FaTruck } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';

const PharmacyCart = () => {
    const router = useRouter();
    const { cart, updateQuantity, removeItem } = useCart();

    const pharmacyItems = useMemo(() => {
        return cart?.items?.filter(item => item.productType === 'Medicine') || [];
    }, [cart]);

    const totals = useMemo(() => {
        const subtotal = pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = subtotal > 300 ? 0 : 40;
        return { subtotal, shipping, total: subtotal + shipping };
    }, [pharmacyItems]);

    if (pharmacyItems.length === 0) {
        return (
            <div className="p-10 text-center">
                <div className="bg-white rounded-[2.5rem] p-20 border border-slate-100 shadow-sm">
                    <FaPills size={60} className="text-slate-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800">Pharmacy Cart is Empty</h2>
                    <button onClick={() => router.push('/pharmacy')} className="mt-8 bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold">Browse Medicines</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
                {pharmacyItems.map((item) => (
                    <div key={item._id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-5">
                        <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-300 text-3xl">
                            <FaPills />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                                <button onClick={() => removeItem(item.itemId._id)} className="text-slate-300 hover:text-rose-500"><FaTrashAlt /></button>
                            </div>
                            <div className="flex items-end justify-between mt-4">
                                <span className="text-xl font-black text-slate-900">₹{item.price * item.quantity}</span>
                                <div className="flex items-center bg-slate-50 rounded-xl p-1">
                                    <button onClick={() => updateQuantity(item.itemId._id, 'dec')} className="p-2"><FaMinus size={12} /></button>
                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.itemId._id, 'inc')} className="p-2"><FaPlus size={12} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full lg:w-[420px]">
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl">
                    <h3 className="text-lg font-bold mb-6">Pharmacy Bill</h3>
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm"><span>Items Total</span><span className="font-bold">₹{totals.subtotal}</span></div>
                        <div className="flex justify-between text-sm"><span>Delivery Fee</span><span className="font-bold">{totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}</span></div>
                    </div>
                    <div className="flex justify-between items-center mb-8 border-t pt-4">
                        <p className="text-4xl font-black text-blue-600">₹{totals.total}</p>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3">
                        Order Medicines <FaTruck />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PharmacyCart;