import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME || 'asubeb-bucket';
  private readonly region = process.env.AWS_REGION || 'us-east-1';

  constructor() {
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    try {
      const fileExt = extname(file.originalname);
      const fileName = `${folder}/${randomUUID()}${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read',
      });

      await this.s3Client.send(command);

      // Return the public URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
