#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Setting up environment variables for Asubeb Backend...\n');

const envPath = path.join(process.cwd(), '.env');
const examplePath = path.join(process.cwd(), 'env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createEnvFile();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\n📝 Creating .env file...\n');
  
  const envContent = `# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/asubeb_db
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=asubeb_db
DB_SCHEMA=public
DB_SSL=false
DB_MAX_CONNECTIONS=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
`;

  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update the database credentials in .env file');
  console.log('2. Make sure PostgreSQL is running');
  console.log('3. Create the database: CREATE DATABASE asubeb_db;');
  console.log('4. Run: npx prisma generate');
  console.log('5. Run: npx prisma migrate dev --name init');
  console.log('6. Start the server: npm run start:dev');
  
  rl.close();
} 