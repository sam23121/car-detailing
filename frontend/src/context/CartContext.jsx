import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CART_KEY = 'quality-detailing-cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart persist failed', e);
    }
  }, [items]);

  const addItem = useCallback((pkg) => {
    setItems((prev) => {
      const vehicleSize = pkg.vehicleSize ?? null;
      const same = prev.find((i) => i.id === pkg.id && (i.vehicleSize ?? null) === vehicleSize);
      if (same) return prev;
      const rest = prev.filter((i) => i.id !== pkg.id);
      return [...rest, {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        service_name: pkg.service_name || '',
        ...(vehicleSize ? { vehicleSize } : {}),
      }];
    });
  }, []);

  const removeItem = useCallback((packageId) => {
    setItems((prev) => prev.filter((i) => i.id !== packageId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    count: items.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
