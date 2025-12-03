const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Database Restore Script
 * 
 * Restores a PostgreSQL database backup using pg_restore
 * WARNING: This will overwrite existing data!
 */
function restoreDatabase() {
  try {
    console.log('🔄 Starting database restore...\n');

    // Get backup file path
    const backupFile = process.argv[2] || 'neon-backup-20251203_164539.dump';
    const backupPath = path.isAbsolute(backupFile) 
      ? backupFile 
      : path.join(process.cwd(), backupFile);

    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Error: Backup file not found: ${backupPath}`);
      console.error('   Usage: node scripts/restore-db.js [backup-file-path]');
      process.exit(1);
    }

    // Get DATABASE_URL from environment or use provided one
    const databaseUrl = process.env.DATABASE_URL || process.argv[3];

    if (!databaseUrl) {
      console.error('❌ Error: DATABASE_URL not provided');
      console.error('   Usage: node scripts/restore-db.js [backup-file] [DATABASE_URL]');
      console.error('   Or set DATABASE_URL environment variable');
      process.exit(1);
    }

    const fileSize = getFileSize(backupPath);
    const dbName = extractDatabaseName(databaseUrl);

    console.log('⚠️  WARNING: This will overwrite all existing data in the database!');
    console.log(`📦 Database: ${dbName}`);
    console.log(`📁 Backup file: ${path.basename(backupPath)}`);
    console.log(`📊 Size: ${fileSize}`);
    console.log(`📍 Full path: ${backupPath}\n`);

    // Run pg_restore
    console.log('⏳ Restoring backup...');
    const startTime = Date.now();

    try {
      // Use --clean to drop existing objects before recreating
      // Use --if-exists to avoid errors if objects don't exist
      // Use --no-owner to avoid permission issues
      // Use --no-acl to avoid ACL issues
      execSync(`pg_restore "${databaseUrl}" "${backupPath}" --clean --if-exists --no-owner --no-acl --verbose`, {
        stdio: 'inherit',
        encoding: 'utf8',
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n✅ Database restore completed successfully!');
      console.log(`   ⏱️  Duration: ${duration}s`);
      console.log(`   📦 Database: ${dbName}\n`);
      
      console.log('📋 Next steps:');
      console.log('   1. Run: npx prisma generate');
      console.log('   2. Verify your data is restored correctly\n');
    } catch (error) {
      console.error('\n❌ Restore failed:', error.message);
      if (error.stderr) {
        console.error('   Error details:', error.stderr.toString());
      }
      throw error;
    }
  } catch (error) {
    console.error('\n❌ Restore failed:', error.message);
    process.exit(1);
  }
}

/**
 * Extract database name from connection URL for display
 */
function extractDatabaseName(url) {
  try {
    const match = url.match(/\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
    if (match) {
      return match[4]; // database name
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Get human-readable file size
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Run restore
restoreDatabase();

