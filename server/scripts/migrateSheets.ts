import { google } from "googleapis";
import { pool } from "../storage";
import { products } from "../../shared/schema";

async function migrateProducts() {
  console.log("Migrating products...");

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const sheetId = process.env.GOOGLE_SHEETS_PRODUCTS_ID!;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Products!A2:Z",
  });

  const rows = response.data.values || [];

  for (const row of rows) {
    await pool.query(
      `INSERT INTO products (id,name,category,description,price,images,colors,sizes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        row[0],
        row[1],
        row[2],
        row[3],
        Number(row[4]),
        JSON.parse(row[5] || "[]"),
        JSON.parse(row[6] || "[]"),
        JSON.parse(row[7] || "[]")
      ]
    );
  }

  console.log("Products migrated successfully");
}

async function runMigration() {
  await migrateProducts();
  console.log("Migration finished");
}

runMigration();