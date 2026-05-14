"use client";

import { CartProvider } from "../entities/cart/CartContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}   