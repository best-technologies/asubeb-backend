"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const env_checker_1 = require("./config/env-checker");
const filters_1 = require("./common/filters");
const colors = require("colors");
async function bootstrap() {
    (0, env_checker_1.checkEnvironmentVariables)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
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
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://localhost:4200',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new filters_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Asubeb Backend API')
        .setDescription('The Asubeb Backend API documentation')
        .setVersion('1.0')
        .addTag('default')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = configService.get('app.port') || 4000;
    await app.listen(port);
    console.log(colors.green('🚀 Server successfully started!'));
    console.log(colors.cyan(`📍 Server running on: http://localhost:${port}`));
    console.log(colors.yellow(`📝 API Documentation: http://localhost:${port}/api`));
    console.log(colors.blue(`💾 Database: ${configService.get('database.database')}`));
    console.log(colors.magenta(`🔗 API Base URL: http://localhost:${port}/api/v1`));
}
bootstrap();
//# sourceMappingURL=main.js.map