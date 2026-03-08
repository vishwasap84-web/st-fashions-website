import { db } from "./db";
import { products, customers, orders, admins } from "@shared/schema";
import {
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Customer,
  type InsertCustomer,
  type Admin,
} from "@shared/schema";

import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export class Storage {
  /* ================= PRODUCTS ================= */

  async getProducts(): Promise<Product[]> {
    return (await db.select().from(products)) as Product[];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));

    return result[0] as Product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = {
      ...product,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct as any);

    return newProduct as unknown as Product;
  }

  async updateProduct(id: string, product: Partial<Product>) {
    await db
      .update(products)
      .set(product as any)
      .where(eq(products.id, id));

    return this.getProduct(id);
  }

  async deleteProduct(id: string) {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  /* ================= CUSTOMERS ================= */

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const hashedPassword = await bcrypt.hash(customer.password, 10);

    const newCustomer = {
      ...customer,
      id: randomUUID(),
      password: hashedPassword,
    };

    await db.insert(customers).values(newCustomer as any);

    return newCustomer as unknown as Customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone));

    return result[0] as Customer;
  }

  /* ================= ORDERS ================= */

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = {
      ...order,
      id: randomUUID(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    await db.insert(orders).values(newOrder as any);

    return newOrder as unknown as Order;
  }

  async getOrders(): Promise<Order[]> {
    return (await db.select().from(orders)) as Order[];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0] as Order;
  }

  async updateOrderStatus(id: string, status: string) {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    return this.getOrder(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return (await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))) as Order[];
  }

  async reduceProductStock(productId: string, color: string, qty: number) {
    const product = await this.getProduct(productId);

    if (!product) throw new Error("Product not found");

    const stock = (product.stockByColor as Record<string, number>) || {};

    const current = stock[color] || 0;

    if (current < qty) {
      throw new Error("Out of stock");
    }

    stock[color] = current - qty;

    await db
      .update(products)
      .set({ stockByColor: stock })
      .where(eq(products.id, productId));
  }

  async verifyCustomerPassword(
    phone: string,
    password: string,
  ): Promise<Customer | null> {
    const customer = await this.getCustomerByPhone(phone);

    if (!customer) return null;

    const match = await bcrypt.compare(password, customer.password);

    if (!match) return null;

    return customer;
  }

  async verifyAdminPassword(
    username: string,
    password: string,
  ): Promise<Admin | null> {
    const admin = await this.getAdmin(username);

    if (!admin) return null;

    const match = await bcrypt.compare(password, admin.password);

    if (!match) return null;

    return admin;
  }

  async updateAdminPassword(username: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);

    await db
      .update(admins)
      .set({ password: hashed, isDefaultPassword: false })
      .where(eq(admins.username, username));

    return true;
  }
  /* ================= ADMINS ================= */

  async getAdmin(username: string): Promise<Admin | undefined> {
    const result = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));

    return result[0] as Admin;
  }
}

export const storage = new Storage();
