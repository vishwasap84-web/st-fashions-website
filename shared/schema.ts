import { z } from "zod";

// Categories for ST Fashions
export const CATEGORIES = [
  "Sarees",
  "Aari Work Blouses",
  "Ready Made Blouses",
  "Ladies Fancy Items",
  "Stationery"
] as const;

export type Category = typeof CATEGORIES[number];

// Size options
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"] as const;
export type Size = typeof SIZES[number];

// Order status options
export const ORDER_STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// Product Schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Product name is required"),
  category: z.enum(CATEGORIES),
  description: z.string(),
  price: z.number().positive("Price must be positive"),
  sizes: z.array(z.enum(SIZES)),
  colors: z.array(z.string()),
  images: z.array(z.string()),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  createdAt: z.string().optional(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true });

export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Customer Schema
export const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  createdAt: z.string().optional(),
});

export const insertCustomerSchema = customerSchema.omit({ id: true, createdAt: true });
export const loginCustomerSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z.string().min(1, "Password is required"),
});

export type Customer = z.infer<typeof customerSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// Cart Item Schema
export const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  size: z.string(),
  color: z.string(),
  image: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Full name is required"),
  customerPhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  customerDob: z.string().optional(),
  customerAddress: z.string().min(10, "Please enter complete address"),
  customerPinCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  alternativePhone: z.string().optional(),
  items: z.array(cartItemSchema),
  totalAmount: z.number(),
  status: z.enum(ORDER_STATUSES),
  createdAt: z.string(),
});

export const insertOrderSchema = orderSchema.omit({ id: true, status: true, createdAt: true });

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Admin Schema
export const adminSchema = z.object({
  username: z.string(),
  password: z.string(),
  isDefaultPassword: z.boolean(),
});

export const loginAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type Admin = z.infer<typeof adminSchema>;

// Checkout Form Schema with Indian validations
export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter complete address"),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  alternativePhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// User type (for backward compatibility)
export const users = {
  id: "",
  username: "",
  password: "",
};

export type User = {
  id: string;
  username: string;
  password: string;
};

export type InsertUser = Omit<User, "id">;
