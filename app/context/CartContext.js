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
                // Set Lab Cart
                if (response.data.labCart) {
                    setCart(response.data.labCart);
                    setCartItemIds(response.data.labCart.items.map(i => i.itemId._id || i.itemId));
                } else {
                    setCart(null);
                    setCartItemIds([]);
                }

                // Set Pharmacy Cart
                if (response.data.pharmacyCart) {
                    setPharmacyCart(response.data.pharmacyCart);
                    setPharmacyItemIds(response.data.pharmacyCart.items.map(i => i.medicineId._id || i.medicineId));
                } else {
                    setPharmacyCart(null);
                    setPharmacyItemIds([]);
                }
            }
        } catch (error) {
            console.error("Fetch Cart Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // --- LAB CART METHODS ---
    const updateQuantity = async (itemId, action) => {
        try {
            setCart(prev => {
                const newItems = prev.items.map(item => {
                    if (item.itemId._id === itemId) {
                        return { ...item, quantity: action === 'inc' ? item.quantity + 1 : item.quantity - 1 };
                    }
                    return item;
                });
                return { ...prev, items: newItems };
            });

            const response = await UserAPI.updateCartQuantity({ itemId, action });
            if (response.success) {
                await fetchCart(true);
            }
        } catch (error) {
            fetchCart();
        }
    };

    const addItem = async (labId, itemId, productType, forceReplace = false) => {
        if (!labId || !itemId || !productType) return;
        try {
            const payload = { labId: String(labId), itemId: String(itemId), productType, forceReplace };
            const response = await UserAPI.addToCart(payload);

            if (response.success) {
                await fetchCart();
            } else if (response.canReplace) {
                const confirmReplace = window.confirm(response.message || "Replace items from another lab?");
                if (confirmReplace) {
                    await addItem(labId, itemId, productType, true);
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error adding item.");
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await UserAPI.removeCartItem(itemId);
            if (response.success) await fetchCart();
        } catch (error) {
            console.error("Remove Item Error:", error);
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

    const addPharmacyToCart = async (pharmacyId, medicineId, quantity = 1, duration = "Full Course", forceReplace = false) => {
        try {
            const payload = { pharmacyId, medicineId, quantity, duration, forceReplace };
            const response = await UserAPI.addPharmacyToCart(payload);

            if (response.success) {
                await fetchCart(true);
            } else if (response.canReplace) {
                const confirmReplace = window.confirm(response.message || "Clear existing pharmacy items?");
                if (confirmReplace) {
                    await addPharmacyToCart(pharmacyId, medicineId, quantity, duration, true);
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