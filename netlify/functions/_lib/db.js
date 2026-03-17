const { Pool } = require("pg");
const { getConfig } = require("./env");
const config = getConfig();
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: { rejectUnauthorized: false }
});
async function query(text, params = []) { return pool.query(text, params); }
module.exports = { query };
