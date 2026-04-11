import mysql from "mysql2/promise";

let pool;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 10
    });
  }
  return pool;
}
