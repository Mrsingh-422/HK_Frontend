"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import UserAPI from "../services/UserAPI";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // State for Lab Cart
    const [cart, setCart] = useState(null);
    const [cartItemIds, setCartItemIds] = useState([]);

    // State for Pharmacy Cart
    const [pharmacyCart, setPharmacyCart] = useState(null);
    const [pharmacyItemIds, setPharmacyItemIds] = useState([]);

    const [loading, setLoading] = useState(true);

    const fetchCart = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await UserAPI.getMyCart();
            if (response.success && response.data) {
                if (response.data.labCart) {
                    setCart(response.data.labCart);
                    setCartItemIds(response.data.labCart.items.map(i => i.itemId._id || i.itemId));
                } else {
                    setCart(null);
                    setCartItemIds([]);
                }
            }
        } catch (error) {
            console.error("Fetch Cart Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);


    /**
     * Updated addItem to handle Radiology Bypass and Lab Conflicts
     */
    const addItem = async (labId, itemId, productType, forceReplace = false, confirmRadiologyBypass = false) => {
        try {
            const payload = { 
                labId: String(labId), 
                itemId: String(itemId), 
                productType, 
                forceReplace, 
                confirmRadiologyBypass 
            };
            
            const response = await UserAPI.addToCart(payload);

            if (response.success) {
                await fetchCart(true);
                return { success: true };
            }
            return response; // Return for component-level modal handling
        } catch (error) {
            // Handle the 400 Intercept Warning from documentation
            if (error.response && error.response.data) {
                return error.response.data; 
            }
            throw error;
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await UserAPI.removeCartItem(itemId);
            if (response.success) await fetchCart(true); // Category healing happens automatically on backend
        } catch (error) {
            console.error("Remove Item Error:", error);
        }
    };

    const updateQuantity = async (itemId, action) => {
        try {
            const response = await UserAPI.updateCartQuantity({ itemId, action });
            if (response.success) await fetchCart(true); // Category healing happens automatically on backend
        } catch (error) {
            console.error("Update Quantity Error:", error);
        }
    };

    const removePharmacyItem = async (itemId) => {
        try {
            const response = await UserAPI.removePharmacyItem(itemId);
            if (response.success) await fetchCart();
        } catch (error) {
            console.error("Remove Pharmacy Item Error:", error);
        }
    };

    const clearFullCart = async () => {
        try {
            const response = await UserAPI.clearCart();
            if (response.success) {
                setCart(null);
                setCartItemIds([]);
            }
        } catch (error) {
            console.error("Clear Cart Error:", error);
        }
    };

    // --- PHARMACY CART METHODS ---
    const addPharmacyToCart = async (pharmacyId, medicineId, quantity = 1, duration = "Full Course", forceReplace = false, isComboApplied = false, comboOfferId = null) => {
        try {
            const payload = { pharmacyId, medicineId, quantity, duration, forceReplace, isComboApplied, comboOfferId };
            const response = await UserAPI.addPharmacyToCart(payload);

            if (response.success) {
                await fetchCart(true);
            } else if (response.canReplace) {
                const confirmReplace = window.confirm(response.message || "Clear existing pharmacy items?");
                if (confirmReplace) {
                    await addPharmacyToCart(pharmacyId, medicineId, quantity, duration, true, isComboApplied, comboOfferId);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error adding medicine to cart.";
            alert(errorMsg);
        }
    };

    const updatePharmacyCartQuantity = async (medicineId, action) => {
        try {
            // Optimistic Update
            setPharmacyCart(prev => {
                if (!prev) return prev;
                const updatedItems = prev.items.map(item => {
                    const id = item.medicineId._id || item.medicineId;
                    if (id === medicineId) {
                        return { ...item, quantity: action === 'inc' ? item.quantity + 1 : item.quantity - 1 };
                    }
                    return item;
                }).filter(item => item.quantity > 0);

                return { ...prev, items: updatedItems };
            });

            const response = await UserAPI.updatePharmacyCartQuantity({ medicineId, action });
            if (response.success) {
                await fetchCart(true);
            }
        } catch (error) {
            fetchCart(); // Revert on error
        }
    };

    return (
        <CartContext.Provider
            value={{
                // Lab
                cart,
                cartItemIds,
                addItem,
                removeItem,
                updateQuantity,
                clearFullCart,
                // Pharmacy
                pharmacyCart,
                pharmacyItemIds,
                addPharmacyToCart,
                updatePharmacyCartQuantity,
                // General
                fetchCart,
                loading,
                removePharmacyItem
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);