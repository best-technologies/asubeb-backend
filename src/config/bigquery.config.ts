import { registerAs } from '@nestjs/config';

export interface BigQueryConfig {
  projectId: string;
  keyFilename?: string;
  clientEmail?: string;
  privateKey?: string;
  location: string;
}

export default registerAs('bigquery', (): BigQueryConfig => ({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME,
  clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  location: process.env.BIGQUERY_LOCATION || 'US',
}));
