import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProductSchema,
  insertOrderSchema,
  insertCustomerSchema,
  loginCustomerSchema,
  loginAdminSchema,
  ORDER_STATUSES,
} from "@shared/schema";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { sendWhatsAppMessage } from "./utils/sendWhatsApp";

function normalizeIndianNumber(phone: string) {
  if (phone.startsWith("+91")) return phone;
  if (phone.length === 10) return `+91${phone}`;
  return phone;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const adminChangePasswordSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // PRODUCTS API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      let products = await storage.getProducts();

      if (category && typeof category === "string") {
        products = products.filter((p) => p.category === category);
      }

      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower),
        );
      }

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // IMAGE UPLOAD API
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
      }

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "st-fashions" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file!.buffer);
      });

      res.json({ url: result.secure_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // ORDERS API
  app.get("/api/orders", async (req, res) => {
    try {
      const { customerId, status } = req.query;
      let orders = await storage.getOrders();

      if (customerId && typeof customerId === "string") {
        orders = orders.filter((o) => o.customerId === customerId);
      }

      if (status && typeof status === "string") {
        orders = orders.filter((o) => o.status === status);
      }

      orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      console.log("🧪 Order payload:", validated.items);

      // 1️⃣ Reduce stock
      for (const item of validated.items) {
        try {
          await storage.reduceProductStock(
            item.productId,
            item.color,
            item.quantity,
          );
        } catch (err) {
          console.error("❌ Stock reduction failed:", err);
          return res.status(400).json({
            message: `Out of stock for ${item.color}`,
          });
        }
      }

      // 2️⃣ Create order
      const order = await storage.createOrder(validated);

      // ❌ CUSTOMER SMS DISABLED (A2P not approved yet)
      // try {
      //   const smsMessage = `
      // Thank you for your order at ST Fashions ❤️
      //
      // Order ID: ${order.id}
      // Total: ₹${order.totalAmount}
      //
      // We will contact you shortly.
      // `;
      //
      //   await sendSMS(`+91${order.customerPhone}`, smsMessage.trim());
      //   console.log("✅ Customer SMS sent");
      // } catch (smsError) {
      //   console.error("⚠️ Customer SMS failed:", smsError);
      // }

      // 3️⃣ WhatsApp Admin Notification (NON-BLOCKING)
      try {
        const message = `
  🛍️ *New Order Received*

  🧾 Order ID: ${order.id}
  👤 Customer: ${order.customerName}
  📞 Phone: ${order.customerPhone}
  💰 Total: ₹${order.totalAmount}

  📦 Items:
  ${order.items
    .map((i) => `• ${i.productId} (${i.color}) x ${i.quantity}`)
    .join("\n")}

  🚚 Status: ${order.status}
        `.trim();

        await sendWhatsAppMessage(process.env.ADMIN_WHATSAPP_NUMBER!, message);

        console.log("✅ WhatsApp admin notification sent");
      } catch (waError) {
        console.error("⚠️ WhatsApp notification failed:", waError);
      }

      // ❌ CUSTOMER WHATSAPP DISABLED (Sandbox requires opt-in)
      // try {
      //   const customerMessage = `
      // 🛍️ *Thank you for your order!*
      //
      // Hello ${order.customerName} 👋
      // Your order has been placed successfully.
      //
      // 🧾 *Order ID:* ${order.id}
      // 💰 *Total:* ₹${order.totalAmount}
      // 🚚 *Status:* ${order.status}
      //
      // – ST Fashions 💖
      //   `.trim();
      //
      //   await sendWhatsAppMessage(order.customerPhone, customerMessage);
      //   console.log("✅ WhatsApp customer confirmation sent");
      // } catch (waError) {
      //   console.error("⚠️ Customer WhatsApp failed:", waError);
      // }

      // 4️⃣ ALWAYS return success
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }

      console.error("❌ Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // CUSTOMER AUTH API
  app.post("/api/customers/signup", async (req, res) => {
    try {
      const validated = insertCustomerSchema.parse(req.body);

      const existing = await storage.getCustomerByPhone(validated.phone);
      if (existing) {
        return res
          .status(400)
          .json({ message: "Phone number already registered" });
      }

      const customer = await storage.createCustomer(validated);
      res.status(201).json({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error signing up customer:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/customers/login", async (req, res) => {
    try {
      const validated = loginCustomerSchema.parse(req.body);

      const customer = await storage.verifyCustomerPassword(
        validated.phone,
        validated.password
      );

      if (!customer) {
        return res.status(401).json({
          message: "Invalid phone number or password",
        });
      }

      req.session.customer = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      };

      // ensure session saved before response
      req.session.save(() => {
        if (!res.headersSent) {
          res.status(200).json({
            success: true,
            customer: {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
            },
          });
        }
      });

    } catch (error) {
      console.error("Customer login error:", error);

      if (!res.headersSent) {
        return res.status(500).json({
          message: "Login failed",
        });
      }
    }
  });
  
  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomer(req.params.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // ADMIN AUTH API
  app.post("/api/admin/login", async (req, res) => {
    try {
      const validated = loginAdminSchema.parse(req.body);

      const admin = await storage.verifyAdminPassword(
        validated.username,
        validated.password,
      );
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      res.json({
        username: admin.username,
        isDefaultPassword: admin.isDefaultPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error logging in admin:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const validated = adminChangePasswordSchema.parse(req.body);

      const admin = await storage.verifyAdminPassword(
        validated.username,
        validated.currentPassword,
      );
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      const updated = await storage.updateAdminPassword(
        validated.username,
        validated.newPassword,
      );
      if (!updated) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error changing admin password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.get("/api/customers/me", (req, res) => {
    if (!req.session.customer) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json(req.session.customer);
  });

  app.post("/api/customers/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  
  // DASHBOARD STATS API
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const [products, orders] = await Promise.all([
        storage.getProducts(),
        storage.getOrders(),
      ]);

      const totalRevenue = orders
        .filter((o) => o.status === "Delivered")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const pendingOrders = orders.filter((o) => o.status === "Pending").length;
      const recentOrders = orders.slice(0, 10);

      res.json({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        recentOrders,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
