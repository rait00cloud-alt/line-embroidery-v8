"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Asset {
  type: "text" | "upload" | "public";
  value: string | File;
  properties: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
    opacity: number;
  };
}

export interface CartItem {
  id: number;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  designUrl?: string;
  design?: Asset[];
  customColors?: string[];
  designImages?: {
    preview2D?: string;
    preview3D?: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  clearCart: () => void;
  updateQuantity: (id: number, size: string, color: string, quantity: number) => void;
  total: number;
}

// ------------------
// Price Break Logic
// ------------------
// Isolada para poder remover ou modificar facilmente
export const getUnitPrice = (quantity: number): number => {
  if (quantity >= 100) return 15;
  if (quantity >= 21) return 19;
  if (quantity >= 2) return 27;
  return 35;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "shopping-cart";

// Helper para serializar cart (File -> placeholder)
const serializeCart = (cart: CartItem[]): string => {
  const serializable = cart.map(item => ({
    ...item,
    design: item.design?.map(asset => ({
      ...asset,
      value: asset.value instanceof File ? `[File: ${asset.value.name}]` : asset.value
    }))
  }));
  return JSON.stringify(serializable);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, serializeCart(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }, [cart, isHydrated]);

  // ------------------------
  // Add To Cart
  // ------------------------
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );

      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prev];
        const newQuantity = updated[existingIndex].quantity + item.quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
          price: getUnitPrice(newQuantity),
          design: item.design || updated[existingIndex].design,
          customColors: item.customColors || updated[existingIndex].customColors,
          designImages: item.designImages || updated[existingIndex].designImages,
        };
        return updated;
      }

      // Novo item
      return [
        ...prev,
        { ...item, price: getUnitPrice(item.quantity) }
      ];
    });
  };

  const removeFromCart = (item: CartItem) => {
    setCart((prev) =>
      prev.filter(
        (i) => !(i.id === item.id && i.size === item.size && i.color === item.color)
      )
    );
  };

  const updateQuantity = (id: number, size: string, color: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter(i => !(i.id === id && i.size === size && i.color === color));
      }
      return prev.map(i =>
        i.id === id && i.size === size && i.color === color
          ? { ...i, quantity, price: getUnitPrice(quantity) }
          : i
      );
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
