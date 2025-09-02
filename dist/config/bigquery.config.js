"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('bigquery', () => ({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME,
    clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    location: process.env.BIGQUERY_LOCATION || 'US',
}));
//# sourceMappingURL=bigquery.config.js.map