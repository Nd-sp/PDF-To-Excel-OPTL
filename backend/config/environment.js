const path = require('path');
const fs = require('fs');

/**
 * Environment Configuration Manager
 * Handles loading different .env files based on NODE_ENV
 */

// Determine which environment file to load
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envPath = path.join(__dirname, '..', envFile);
const defaultEnvPath = path.join(__dirname, '..', '.env');

console.log('');
console.log('========================================');
console.log('  Environment Configuration');
console.log('========================================');
console.log(`[ENV] Current NODE_ENV: ${env}`);
console.log(`[ENV] Looking for: ${envFile}`);

// Check if environment-specific file exists
if (fs.existsSync(envPath)) {
  console.log(`[ENV] ✅ Found ${envFile}`);
  console.log(`[ENV] Loading configuration from: ${envPath}`);
  require('dotenv').config({ path: envPath });
} else if (fs.existsSync(defaultEnvPath)) {
  console.log(`[ENV] ⚠️  ${envFile} not found, falling back to .env`);
  console.log(`[ENV] Loading configuration from: ${defaultEnvPath}`);
  require('dotenv').config({ path: defaultEnvPath });
} else {
  console.error(`[ENV] ❌ No environment file found!`);
  console.error(`[ENV] Please create either ${envFile} or .env`);
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'PORT'
];

console.log('[ENV] Validating required environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`[ENV] ❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log('[ENV] ✅ All required environment variables are set');
console.log('========================================');
console.log('  Database Configuration');
console.log('========================================');
console.log(`[DB] Host: ${process.env.DB_HOST}`);
console.log(`[DB] Port: ${process.env.DB_PORT || 3306}`);
console.log(`[DB] Database: ${process.env.DB_NAME}`);
console.log(`[DB] User: ${process.env.DB_USER}`);
console.log('========================================');
console.log('  Server Configuration');
console.log('========================================');
console.log(`[Server] Port: ${process.env.PORT}`);
console.log(`[Server] Host: ${process.env.HOST || '0.0.0.0'} (network accessible)`);
console.log(`[Server] Environment: ${env}`);
console.log('========================================');
console.log('');

module.exports = {
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  config: process.env
};
