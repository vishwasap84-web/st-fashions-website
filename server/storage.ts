import { 
  type Product, type InsertProduct,
  type Order, type InsertOrder, type OrderStatus,
  type Customer, type InsertCustomer,
  type Admin
} from "@shared/schema";
import { randomUUID } from "crypto";
import { getUncachableGoogleSheetClient, getGoogleDriveClient } from "./googleSheets";
import bcrypt from "bcrypt";

const SPREADSHEET_NAME = "ST_Fashions_Data";
const SALT_ROUNDS = 10;

let spreadsheetId: string | null = null;

function safeJsonParse<T>(value: string, defaultValue: T): T {
  if (!value || value === '') return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    console.error(`Failed to parse JSON: ${value}`);
    return defaultValue;
  }
}

async function getOrCreateSpreadsheet(): Promise<string> {
  if (spreadsheetId) return spreadsheetId;
  
  const drive = await getGoogleDriveClient();
  const sheets = await getUncachableGoogleSheetClient();
  
  const response = await drive.files.list({
    q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    spaces: 'drive',
    fields: 'files(id, name)',
  });
  
  if (response.data.files && response.data.files.length > 0) {
    spreadsheetId = response.data.files[0].id!;
    return spreadsheetId;
  }
  
  const createResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        { properties: { title: 'Products' } },
        { properties: { title: 'Orders' } },
        { properties: { title: 'Customers' } },
        { properties: { title: 'Admin' } },
      ],
    },
  });
  
  spreadsheetId = createResponse.data.spreadsheetId!;
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        {
          range: 'Products!A1:J1',
          values: [['id', 'name', 'category', 'description', 'price', 'sizes', 'colors', 'images', 'stock', 'createdAt']],
        },
        {
          range: 'Orders!A1:L1',
          values: [['id', 'customerId', 'customerName', 'customerPhone', 'customerDob', 'customerAddress', 'customerPinCode', 'alternativePhone', 'items', 'totalAmount', 'status', 'createdAt']],
        },
        {
          range: 'Customers!A1:E1',
          values: [['id', 'name', 'phone', 'passwordHash', 'createdAt']],
        },
        {
          range: 'Admin!A1:C1',
          values: [['username', 'passwordHash', 'isDefaultPassword']],
        },
      ],
    },
  });
  
  const defaultAdminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Admin!A:C',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['admin', defaultAdminPasswordHash, 'true']],
    },
  });
  
  return spreadsheetId;
}

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
  
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  verifyCustomerPassword(phone: string, password: string): Promise<Customer | null>;
  
  getAdmin(username: string): Promise<Admin | undefined>;
  verifyAdminPassword(username: string, password: string): Promise<Admin | null>;
  updateAdminPassword(username: string, newPassword: string): Promise<Admin | undefined>;
}

export class GoogleSheetsStorage implements IStorage {
  
  async getProducts(): Promise<Product[]> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ssId,
      range: 'Products!A2:J',
    });
    
    const rows = response.data.values || [];
    return rows.map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      category: row[2] as any,
      description: row[3] || '',
      price: parseFloat(row[4]) || 0,
      sizes: safeJsonParse<string[]>(row[5], []),
      colors: safeJsonParse<string[]>(row[6], []),
      images: safeJsonParse<string[]>(row[7], []),
      stock: parseInt(row[8]) || 0,
      createdAt: row[9] || '',
    }));
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.category === category);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: ssId,
      range: 'Products!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          product.name,
          product.category,
          product.description,
          product.price,
          JSON.stringify(product.sizes),
          JSON.stringify(product.colors),
          JSON.stringify(product.images),
          product.stock,
          createdAt,
        ]],
      },
    });
    
    return { ...product, id, createdAt };
  }
  
  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    const existingProduct = products[index];
    const updatedProduct: Product = {
      id: existingProduct.id,
      name: updates.name ?? existingProduct.name,
      category: updates.category ?? existingProduct.category,
      description: updates.description ?? existingProduct.description,
      price: updates.price ?? existingProduct.price,
      sizes: updates.sizes ?? existingProduct.sizes,
      colors: updates.colors ?? existingProduct.colors,
      images: updates.images ?? existingProduct.images,
      stock: updates.stock ?? existingProduct.stock,
      createdAt: existingProduct.createdAt,
    };
    
    const rowNumber = index + 2;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: ssId,
      range: `Products!A${rowNumber}:J${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          updatedProduct.id,
          updatedProduct.name,
          updatedProduct.category,
          updatedProduct.description,
          updatedProduct.price,
          JSON.stringify(updatedProduct.sizes),
          JSON.stringify(updatedProduct.colors),
          JSON.stringify(updatedProduct.images),
          updatedProduct.stock,
          updatedProduct.createdAt || '',
        ]],
      },
    });
    
    return updatedProduct;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    const rowNumber = index + 2;
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: ssId,
    });
    
    const productsSheet = response.data.sheets?.find(s => s.properties?.title === 'Products');
    const sheetId = productsSheet?.properties?.sheetId;
    
    if (sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ssId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          }],
        },
      });
    }
    
    return true;
  }
  
  async getOrders(): Promise<Order[]> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ssId,
      range: 'Orders!A2:L',
    });
    
    const rows = response.data.values || [];
    return rows.map(row => ({
      id: row[0] || '',
      customerId: row[1] || undefined,
      customerName: row[2] || '',
      customerPhone: row[3] || '',
      customerDob: row[4] || undefined,
      customerAddress: row[5] || '',
      customerPinCode: row[6] || '',
      alternativePhone: row[7] || undefined,
      items: safeJsonParse(row[8], []),
      totalAmount: parseFloat(row[9]) || 0,
      status: (row[10] || 'Pending') as any,
      createdAt: row[11] || '',
    }));
  }
  
  async getOrder(id: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id);
  }
  
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(o => o.customerId === customerId);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const status = 'Pending' as const;
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: ssId,
      range: 'Orders!A:L',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          order.customerId || '',
          order.customerName,
          order.customerPhone,
          order.customerDob || '',
          order.customerAddress,
          order.customerPinCode,
          order.alternativePhone || '',
          JSON.stringify(order.items),
          order.totalAmount,
          status,
          createdAt,
        ]],
      },
    });
    
    return { ...order, id, status, createdAt };
  }
  
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    
    const updatedOrder = { ...orders[index], status };
    const rowNumber = index + 2;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: ssId,
      range: `Orders!K${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });
    
    return updatedOrder;
  }
  
  private async getAllCustomers(): Promise<Array<{id: string, name: string, phone: string, passwordHash: string, createdAt: string}>> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ssId,
      range: 'Customers!A2:E',
    });
    
    const rows = response.data.values || [];
    return rows.map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      phone: row[2] || '',
      passwordHash: row[3] || '',
      createdAt: row[4] || '',
    }));
  }
  
  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.getAllCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return undefined;
    
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      password: '',
      createdAt: customer.createdAt,
    };
  }
  
  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customers = await this.getAllCustomers();
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return undefined;
    
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      password: '',
      createdAt: customer.createdAt,
    };
  }
  
  async verifyCustomerPassword(phone: string, password: string): Promise<Customer | null> {
    const customers = await this.getAllCustomers();
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return null;
    
    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) return null;
    
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      password: '',
      createdAt: customer.createdAt,
    };
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const passwordHash = await bcrypt.hash(customer.password, SALT_ROUNDS);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: ssId,
      range: 'Customers!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          customer.name,
          customer.phone,
          passwordHash,
          createdAt,
        ]],
      },
    });
    
    return { 
      id, 
      name: customer.name, 
      phone: customer.phone, 
      password: '',
      createdAt 
    };
  }
  
  private async getAllAdmins(): Promise<Array<{username: string, passwordHash: string, isDefaultPassword: boolean}>> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ssId,
      range: 'Admin!A2:C',
    });
    
    const rows = response.data.values || [];
    return rows.map(row => ({
      username: row[0] || '',
      passwordHash: row[1] || '',
      isDefaultPassword: row[2] === 'true',
    }));
  }
  
  async getAdmin(username: string): Promise<Admin | undefined> {
    const admins = await this.getAllAdmins();
    const admin = admins.find(a => a.username === username);
    if (!admin) return undefined;
    
    return {
      username: admin.username,
      password: '',
      isDefaultPassword: admin.isDefaultPassword,
    };
  }
  
  async verifyAdminPassword(username: string, password: string): Promise<Admin | null> {
    const admins = await this.getAllAdmins();
    const admin = admins.find(a => a.username === username);
    if (!admin) return null;
    
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) return null;
    
    return {
      username: admin.username,
      password: '',
      isDefaultPassword: admin.isDefaultPassword,
    };
  }
  
  async updateAdminPassword(username: string, newPassword: string): Promise<Admin | undefined> {
    const ssId = await getOrCreateSpreadsheet();
    const sheets = await getUncachableGoogleSheetClient();
    
    const admins = await this.getAllAdmins();
    const index = admins.findIndex(a => a.username === username);
    if (index === -1) return undefined;
    
    const rowNumber = index + 2;
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: ssId,
      range: `Admin!B${rowNumber}:C${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newPasswordHash, 'false']],
      },
    });
    
    return {
      username,
      password: '',
      isDefaultPassword: false,
    };
  }
}

export const storage: IStorage = new GoogleSheetsStorage();
