const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'pdf_excel_converter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling (returns [rows, fields] like pool.query)
// Using pool.query instead of pool.execute for better parameter handling
const query = async (sql, params = []) => {
  try {
    // Ensure params is always an array
    const safeParams = Array.isArray(params) ? params : [];

    // Use pool.query which handles parameters more flexibly than execute
    return await pool.query(sql, safeParams);
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Execute multiple queries in a transaction
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
