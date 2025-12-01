const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

const { query } = require('../config/database');

/**
 * Database Backup Controller
 * Provides functionality to backup and restore MySQL database
 * Supports both structure-only and full backups (with data)
 */

/**
 * Create a database backup
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {boolean} req.body.includeData - Whether to include data in backup (default: true)
 * @param {string} req.body.description - Optional description for the backup
 * @returns {Object} - Backup file information
 */
exports.createBackup = async (req, res) => {
  try {
    const { includeData = true, description = '' } = req.body;

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const dataType = includeData ? 'full' : 'structure';
    const filename = `backup_${dataType}_${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Get database credentials from environment
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    console.log('');
    console.log('========================================');
    console.log('  Creating Database Backup');
    console.log('========================================');
    console.log(`[Backup] Type: ${dataType} (${includeData ? 'with data' : 'structure only'})`);
    console.log(`[Backup] Database: ${dbName}`);
    console.log(`[Backup] File: ${filename}`);
    console.log('========================================');

    // Build mysqldump command
    let mysqldumpCmd;

    if (includeData) {
      // Full backup with data
      mysqldumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p"${dbPassword}" --single-transaction --routines --triggers --events ${dbName}`;
    } else {
      // Structure only (no data)
      mysqldumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p"${dbPassword}" --no-data --routines --triggers --events ${dbName}`;
    }

    // Add output file
    mysqldumpCmd += ` > "${filepath}"`;

    console.log('[Backup] Executing mysqldump...');
    const startTime = Date.now();

    // Execute mysqldump command
    await execPromise(mysqldumpCmd, {
      shell: true,
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer for large databases
    });

    const duration = Date.now() - startTime;

    // Get file stats
    const stats = await fs.stat(filepath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`[Backup] ✅ Backup created successfully in ${duration}ms`);
    console.log(`[Backup] File size: ${sizeKB} KB (${sizeMB} MB)`);
    console.log('========================================');
    console.log('');

    // Get table count
    const [tables] = await query('SHOW TABLES');
    const tableCount = tables.length;

    // Store backup metadata in database (if backups table exists)
    try {
      await query(
        `INSERT INTO backups (filename, filepath, size_bytes, backup_type, include_data, tables_count, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [filename, filepath, stats.size, dataType, includeData, tableCount, description]
      );
    } catch (err) {
      console.log('[Backup] Note: Could not save metadata to database (backups table may not exist)');
    }

    res.json({
      success: true,
      message: 'Database backup created successfully',
      backup: {
        filename,
        filepath,
        sizeBytes: stats.size,
        sizeKB: parseFloat(sizeKB),
        sizeMB: parseFloat(sizeMB),
        backupType: dataType,
        includeData,
        tableCount,
        description,
        duration,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Backup] ❌ Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create database backup',
      error: error.message
    });
  }
};

/**
 * List all backups
 */
exports.listBackups = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');

    // Ensure directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Read all backup files
    const files = await fs.readdir(backupDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));

    // Get file stats
    const backups = await Promise.all(
      sqlFiles.map(async (filename) => {
        const filepath = path.join(backupDir, filename);
        const stats = await fs.stat(filepath);

        // Parse filename to extract info
        const parts = filename.replace('.sql', '').split('_');
        const backupType = parts[1]; // 'full' or 'structure'
        const includeData = backupType === 'full';

        return {
          filename,
          filepath,
          sizeBytes: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          backupType,
          includeData,
          createdAt: stats.mtime.toISOString()
        };
      })
    );

    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: backups.length,
      backups
    });

  } catch (error) {
    console.error('[Backup] Error listing backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: error.message
    });
  }
};

/**
 * Download a backup file
 */
exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const filepath = path.join(backupDir, filename);

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Send file
    res.download(filepath, filename);

  } catch (error) {
    console.error('[Backup] Error downloading backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download backup',
      error: error.message
    });
  }
};

/**
 * Delete a backup file
 */
exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const filepath = path.join(backupDir, filename);

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Delete file
    await fs.unlink(filepath);

    console.log(`[Backup] Deleted backup: ${filename}`);

    res.json({
      success: true,
      message: 'Backup deleted successfully',
      filename
    });

  } catch (error) {
    console.error('[Backup] Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup',
      error: error.message
    });
  }
};

/**
 * Restore database from backup
 */
exports.restoreBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const filepath = path.join(backupDir, filename);

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    console.log('');
    console.log('========================================');
    console.log('  Restoring Database from Backup');
    console.log('========================================');
    console.log(`[Restore] File: ${filename}`);
    console.log('========================================');

    // Get database credentials
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    // Build mysql restore command
    const restoreCmd = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} -p"${dbPassword}" ${dbName} < "${filepath}"`;

    console.log('[Restore] Executing restore...');
    const startTime = Date.now();

    // Execute restore
    await execPromise(restoreCmd, {
      shell: true,
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });

    const duration = Date.now() - startTime;

    console.log(`[Restore] ✅ Database restored successfully in ${duration}ms`);
    console.log('========================================');
    console.log('');

    res.json({
      success: true,
      message: 'Database restored successfully',
      filename,
      duration
    });

  } catch (error) {
    console.error('[Restore] ❌ Error restoring database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore database',
      error: error.message
    });
  }
};

/**
 * Get backup statistics
 */
exports.getBackupStats = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');

    await fs.mkdir(backupDir, { recursive: true });

    const files = await fs.readdir(backupDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));

    let totalSize = 0;
    let fullBackups = 0;
    let structureBackups = 0;

    for (const file of sqlFiles) {
      const filepath = path.join(backupDir, file);
      const stats = await fs.stat(filepath);
      totalSize += stats.size;

      if (file.includes('_full_')) {
        fullBackups++;
      } else if (file.includes('_structure_')) {
        structureBackups++;
      }
    }

    res.json({
      success: true,
      stats: {
        totalBackups: sqlFiles.length,
        fullBackups,
        structureBackups,
        totalSizeBytes: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        backupDirectory: backupDir
      }
    });

  } catch (error) {
    console.error('[Backup] Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup statistics',
      error: error.message
    });
  }
};
