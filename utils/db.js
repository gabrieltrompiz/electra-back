const { Pool } = require('pg');
const pool = new Pool({
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false,
  max: 50,
  min: 10
});

module.exports = pool;