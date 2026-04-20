"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrashAlt, FaPlus, FaMinus, FaPills, FaTruck, FaFilePrescription, FaSpinner } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';
// Import your UserAPI here
// import { UserAPI } from '@/app/api/UserAPI'; 

const PharmacyCart = () => {
    const router = useRouter();
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Cart on Mount
    const fetchCart = async () => {
        try {
            setLoading(true);
            // Replace this with your actual UserAPI call
            const response = await UserAPI.getMyCart();
            // For now, using the structure from your JSON:
            setCartData(response.data); 
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // 2. Handle Quantity Update
    const handleUpdateQuantity = async (itemId, currentQty, action) => {
        const newQuantity = action === 'inc' ? currentQty + 1 : currentQty - 1;
        
        if (newQuantity < 1) return;

        try {
            // API Call
            await UserAPI.updateCartQuantity({ itemId, quantity: newQuantity });
            
            // Optimistic UI Update (Refresh data)
            fetchCart();
        } catch (error) {
            console.error("Failed to update quantity", error);
        }
    };

    // 3. Handle Remove Item
    const handleRemoveItem = async (itemId) => {
        if (!confirm("Remove this medicine from cart?")) return;
        
        try {
            // API Call
            await UserAPI.removeCartItem(itemId);
            
            // Refresh data
            fetchCart();
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    // Memoized Calculations
    const pharmacyItems = useMemo(() => {
        return cartData?.pharmacyCart?.items || [];
    }, [cartData]);

    const totals = useMemo(() => {
        const subtotal = pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 || subtotal === 0 ? 0 : 40;
        return { subtotal, shipping, total: subtotal + shipping };
    }, [pharmacyItems]);

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center">
                <FaSpinner className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-medium">Loading your medicines...</p>
            </div>
        );
    }

    if (pharmacyItems.length === 0) {
        return (
            <div className="p-10 text-center">
                <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-20 border border-slate-100 shadow-sm">
                    <FaPills size={60} className="text-slate-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800">Pharmacy Cart is Empty</h2>
                    <p className="text-slate-500 mt-2 mb-8">You haven't added any medicines yet.</p>
                    <button 
                        onClick={() => router.push('/pharmacy')} 
                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Browse Medicines
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Left Side: Items List */}
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-black text-slate-800">My Cart ({pharmacyItems.length})</h1>
                    <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold">
                        {cartData?.pharmacyCart?.pharmacyId?.name}
                    </span>
                </div>

                {pharmacyItems.map((item) => (
                    <div key={item._id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-5 hover:shadow-lg transition-shadow duration-300">
                        {/* Image */}
                        <div className="w-28 h-28 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-200 text-4xl overflow-hidden border border-slate-50">
                            {item.medicineId?.image_url?.[0] ? (
                                <img src={item.medicineId.image_url[0]} alt={item.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <FaPills />
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight">{item.medicineId?.manufacturers}</p>
                                    
                                    {item.medicineId?.prescription_required === "YES" && (
                                        <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded mt-2 w-fit">
                                            <FaFilePrescription /> RX REQUIRED
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item._id)} 
                                    className="text-slate-300 hover:text-rose-500 p-2 transition-colors"
                                >
                                    <FaTrashAlt />
                                </button>
                            </div>

                            <div className="flex items-end justify-between mt-4">
                                <div>
                                    <span className="text-2xl font-black text-slate-900">₹{item.price * item.quantity}</span>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-wide">₹{item.price} / UNIT</p>
                                </div>
                                
                                <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                    <button 
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity, 'dec')} 
                                        className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                                        disabled={item.quantity <= 1}
                                    >
                                        <FaMinus size={12} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-slate-700">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity, 'inc')} 
                                        className="p-2 text-slate-400 hover:text-blue-600"
                                    >
                                        <FaPlus size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Side: Bill Summary */}
            <div className="w-full lg:w-[420px]">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl sticky top-10">
                    <h3 className="text-lg font-bold mb-6 text-slate-800">Order Summary</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Bag Subtotal</span>
                            <span className="font-bold text-slate-800">₹{totals.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Delivery Fee</span>
                            <span className={`font-bold ${totals.shipping === 0 ? "text-green-500" : "text-slate-800"}`}>
                                {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
                            </span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600">
                                <FaTruck />
                            </div>
                            <p className="text-[11px] text-blue-700 font-medium">
                                {totals.shipping === 0 
                                    ? "Your order is eligible for free delivery!" 
                                    : `Add ₹${500 - totals.subtotal} more to get FREE delivery.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-8 border-t border-dashed pt-6">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-4xl font-black text-blue-600">₹{totals.total}</p>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-blue-100">
                        Proceed to Checkout <FaTruck />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PharmacyCart;