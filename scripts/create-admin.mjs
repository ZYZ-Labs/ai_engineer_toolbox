#!/usr/bin/env node
/**
 * Create admin user for SilverIce Toolbox
 * Usage: node scripts/create-admin.mjs <username> <password>
 *
 * This script generates the SQL to insert an admin user.
 * Run the output with: wrangler d1 execute <database-name> --command="<sql>"
 */

import { createHash, randomBytes } from "crypto";

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function generateSalt() {
  return randomBytes(16).toString("hex");
}

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: node scripts/create-admin.mjs <username> <password>");
  process.exit(1);
}

if (password.length < 1) {
  console.error("Password cannot be empty");
  process.exit(1);
}

const salt = generateSalt();
const passwordHash = sha256(password + salt);
const now = Date.now();

const sql = `INSERT OR IGNORE INTO users (username, password_hash, salt, is_admin, created_at) VALUES ('${username}', '${passwordHash}', '${salt}', 1, ${now});`;

console.log("\n=== Generated SQL ===");
console.log(sql);
console.log("\n=== Run with ===");
console.log(`wrangler d1 execute YOUR_DB_NAME --command="${sql}"`);
console.log("\n=== Or save to file and run ===");
console.log(`echo "${sql}" > admin.sql && wrangler d1 execute YOUR_DB_NAME --file=admin.sql`);
