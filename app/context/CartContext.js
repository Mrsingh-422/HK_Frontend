"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import UserAPI from "../services/UserAPI";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [cartItemIds, setCartItemIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true); // ONLY set global loading if it's NOT a background update

            const response = await UserAPI.getMyCart();
            if (response.success && response.data?.labCart) {
                setCart(response.data.labCart);
                setCartItemIds(response.data.labCart.items.map(i => i.itemId._id || i.itemId));
            } else {
                setCart(null);
                setCartItemIds([]);
            }
        } catch (error) {
            console.error("Fetch Cart Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, action) => {
        try {
            // Option 1: Optimistic Update (Update local UI instantly)
            setCart(prev => {
                const newItems = prev.items.map(item => {
                    if (item.itemId._id === itemId) {
                        return { ...item, quantity: action === 'inc' ? item.quantity + 1 : item.quantity - 1 };
                    }
                    return item;
                });
                return { ...prev, items: newItems };
            });

            // Option 2: Server Update
            const response = await UserAPI.updateCartQuantity({ itemId, action });
            if (response.success) {
                await fetchCart(true); // Pass 'true' to fetch in background without reload/spinner
            }
        } catch (error) {
            fetchCart(); // Revert on error
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addItem = async (labId, itemId, productType, forceReplace = false) => {
        // Validation before sending
        if (!labId || !itemId || !productType) {
            console.error("❌ Missing required fields for AddToCart:", { labId, itemId, productType });
            return;
        }

        try {
            const payload = {
                labId: String(labId), // Ensure it's a string
                itemId: String(itemId),
                productType: productType, // Must be 'LabPackage' or 'LabTest'
                forceReplace
            };

            const response = await UserAPI.addToCart(payload);

            if (response.success) {
                await fetchCart();
            } else if (response.canReplace) {
                const confirmReplace = window.confirm(response.message || "Your cart has items from another lab. Replace them?");
                if (confirmReplace) {
                    await addItem(labId, itemId, productType, true);
                }
            } else {
                alert(response.message || "Failed to add item.");
            }
        } catch (error) {
            // This will tell you exactly what the 400 error is
            const errorMsg = error.response?.data?.message || "Error adding item to cart.";
            console.error("Add Item API Error Details:", error.response?.data);
            alert(errorMsg);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await UserAPI.removeCartItem(itemId);
            if (response.success) {
                await fetchCart();
            }
        } catch (error) {
            console.error("Remove Item Error:", error);
        }
    };

    // const updateQuantity = async (itemId, action) => {
    //     try {
    //         const response = await UserAPI.updateCartQuantity({ itemId, action });
    //         if (response.success) {
    //             await fetchCart();
    //         }
    //     } catch (error) {
    //         console.error("Update Quantity Error:", error);
    //     }
    // };

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

    return (
        <CartContext.Provider
            value={{
                cart,
                cartItemIds,
                addItem,
                removeItem,
                updateQuantity,
                clearFullCart,
                fetchCart,
                loading
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);