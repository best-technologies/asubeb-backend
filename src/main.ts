import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { checkEnvironmentVariables } from './config/env-checker';
import { HttpExceptionFilter } from './common/filters';
import * as colors from 'colors';

async function bootstrap() {
  // Check environment variables before starting the server
  checkEnvironmentVariables();
  
  // Create app with memory optimizations
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:4200',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:4200',
      // Add your frontend URL here
      'http://localhost:3000', // React default
      'http://localhost:5173', // Vite default
      'http://localhost:8080', // Vue default
      'http://localhost:4200', // Angular default
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Swagger configuration (only in development or when explicitly enabled)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Asubeb Backend API')
      .setDescription('The Asubeb Backend API documentation')
      .setVersion('1.0')
      .addTag('default')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  
  const port = configService.get<number>('app.port') || 4000;
  await app.listen(port);
  
  console.log(colors.green('🚀 Server successfully started!'));
  console.log(colors.cyan(`📍 Server running on: http://localhost:${port}`));
  console.log(colors.yellow(`📝 API Documentation: http://localhost:${port}/api`));
  console.log(colors.blue(`💾 Database: ${configService.get<string>('database.database')}`));
  console.log(colors.magenta(`🔗 API Base URL: http://localhost:${port}/api/v1`));
}
bootstrap();
