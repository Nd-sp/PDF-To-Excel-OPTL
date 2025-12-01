const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;

  try {
    console.log('Starting database initialization...\n');

    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL server');

    // Read schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    console.log('✓ Schema file loaded');

    // Execute schema
    await connection.query(schema);

    console.log('✓ Database schema created successfully');
    console.log('\nDatabase initialization completed!\n');

    // Display summary
    console.log('Summary:');
    console.log(`  Database: ${process.env.DB_NAME || 'pdf_excel_converter'}`);
    console.log('  Tables created:');
    console.log('    - upload_batches');
    console.log('    - pdf_records');
    console.log('    - invoice_data');
    console.log('    - field_templates');
    console.log('    - custom_fields');
    console.log('    - processing_logs');
    console.log('\nYou can now start the server with: npm start\n');

  } catch (error) {
    console.error('\n✗ Database initialization failed:', error.message);
    console.error('\nPlease check:');
    console.error('  1. MySQL server is running');
    console.error('  2. Database credentials in .env file are correct');
    console.error('  3. User has proper permissions');
    process.exit(1);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
