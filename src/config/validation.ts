import { plainToClass, Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync, IsBoolean } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  NODE_ENV?: string;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors.map(error => error.property).join(', ');
    throw new Error(`Missing or invalid environment variables: ${missingVars}`);
  }

  return validatedConfig;
} 