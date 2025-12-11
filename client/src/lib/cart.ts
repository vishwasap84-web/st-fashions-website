import type { CartItem } from "@shared/schema";

const CART_KEY = "st_fashions_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existingIndex = cart.findIndex(
    (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
  );
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(productId: string, size: string, color: string, quantity: number): CartItem[] {
  const cart = getCart();
  const index = cart.findIndex(
    (i) => i.productId === productId && i.size === size && i.color === color
  );
  
  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
  }
  
  return cart;
}

export function removeFromCart(productId: string, size: string, color: string): CartItem[] {
  const cart = getCart();
  const filtered = cart.filter(
    (i) => !(i.productId === productId && i.size === size && i.color === color)
  );
  saveCart(filtered);
  return filtered;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
