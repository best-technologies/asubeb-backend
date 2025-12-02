"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnvironmentVariables = checkEnvironmentVariables;
const colors = require("colors");
const requiredEnvVars = {
    DATABASE_URL: {
        required: true,
        description: 'PostgreSQL database connection URL',
        example: 'postgresql://username:password@localhost:5432/database_name',
    },
    JWT_SECRET: {
        required: true,
        description: 'JWT secret key for authentication',
        example: 'your-super-secret-jwt-key',
    },
    NODE_ENV: {
        required: false,
        description: 'Application environment',
        example: 'development',
    },
    PORT: {
        required: false,
        description: 'Application port',
        example: '3000',
    },
};
function checkEnvironmentVariables() {
    console.log(colors.cyan('🔍 Checking environment variables...'));
    const missingVars = [];
    const invalidVars = [];
    for (const [varName, config] of Object.entries(requiredEnvVars)) {
        const value = process.env[varName];
        if (config.required && !value) {
            missingVars.push(varName);
        }
        else if (value && config.example && !isValidFormat(varName, value)) {
            invalidVars.push(varName);
        }
    }
    if (missingVars.length > 0) {
        console.log(colors.red('\n❌ Missing required environment variables:'));
        missingVars.forEach(varName => {
            const config = requiredEnvVars[varName];
            console.log(colors.red(`   ${varName}: ${config.description}`));
            if (config.example) {
                console.log(colors.gray(`   Example: ${config.example}`));
            }
        });
        console.log(colors.yellow('\n📝 Please create a .env file with the required variables.'));
        console.log(colors.yellow('   You can copy env.example to .env and update the values.'));
        process.exit(1);
    }
    if (invalidVars.length > 0) {
        console.log(colors.yellow('\n⚠️  Invalid environment variables:'));
        invalidVars.forEach(varName => {
            console.log(colors.yellow(`   ${varName}: Invalid format`));
        });
    }
    console.log(colors.green('✅ All required environment variables are present!'));
}
function isValidFormat(varName, value) {
    switch (varName) {
        case 'DB_PORT':
        case 'PORT':
            return !isNaN(Number(value)) && Number(value) > 0;
        case 'DATABASE_URL':
            return value.startsWith('postgresql://');
        case 'JWT_SECRET':
            return value.length >= 32;
        default:
            return true;
    }
}
//# sourceMappingURL=env-checker.js.map