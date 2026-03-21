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
    const result = await db.select().from(products);
    return result as unknown as Product[];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] as unknown as Product | undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = {
      id: randomUUID(),
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      images: product.images ?? [],
      colors: product.colors ?? [],
      sizes: product.sizes ?? [],
      stockByColor: product.stockByColor ?? {},
      sareeType: product.sareeType ?? null,
      blouseMaterialType: product.blouseMaterialType ?? null,
      lengthInches: product.lengthInches ?? null,
      widthInches: product.widthInches ?? null,
      readyBlouseTypes: product.readyBlouseTypes ?? [],
    };

    await db.insert(products).values(newProduct);

    const created = await this.getProduct(newProduct.id);
    return created!;
  }

  async updateProduct(id: string, product: Partial<Product>) {
    const updateData = {
      ...(product.name !== undefined && { name: product.name }),
      ...(product.category !== undefined && { category: product.category }),
      ...(product.description !== undefined && { description: product.description }),
      ...(product.price !== undefined && { price: product.price }),
      ...(product.images !== undefined && { images: product.images }),
      ...(product.colors !== undefined && { colors: product.colors }),
      ...(product.sizes !== undefined && { sizes: product.sizes }),
      ...(product.stockByColor !== undefined && { stockByColor: product.stockByColor }),
      ...(product.sareeType !== undefined && { sareeType: product.sareeType }),
      ...(product.blouseMaterialType !== undefined && {
        blouseMaterialType: product.blouseMaterialType,
      }),
      ...(product.lengthInches !== undefined && { lengthInches: product.lengthInches }),
      ...(product.widthInches !== undefined && { widthInches: product.widthInches }),
      ...(product.readyBlouseTypes !== undefined && {
        readyBlouseTypes: product.readyBlouseTypes,
      }),
    };

    await db.update(products).set(updateData).where(eq(products.id, id));

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

    return result[0] as unknown as Customer | undefined;
  }

  /* ================= ORDERS ================= */

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = {
      ...order,
      id: randomUUID(),
      status: "Pending",
    };

    await db.insert(orders).values(newOrder as any);

    return newOrder as unknown as Order;
  }

  async getOrders(): Promise<Order[]> {
    const result = await db.select().from(orders);
    return result as unknown as Order[];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0] as unknown as Order | undefined;
  }

  async updateOrderStatus(id: string, status: string) {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    return this.getOrder(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId));

    return result as unknown as Order[];
  }

  async reduceProductStock(productId: string, color: string, qty: number) {
    const product = await this.getProduct(productId);

    if (!product) throw new Error("Product not found");

    const stock = (product.stockByColor ?? {}) as Record<string, number>;
    const current = stock[color] || 0;

    if (current < qty) {
      throw new Error("Out of stock");
    }

    const updatedStock = {
      ...stock,
      [color]: current - qty,
    };

    await db
      .update(products)
      .set({ stockByColor: updatedStock })
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

    return result[0] as unknown as Admin | undefined;
  }
}

export const storage = new Storage();
