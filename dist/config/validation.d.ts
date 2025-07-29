declare class EnvironmentVariables {
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_SCHEMA?: string;
    DB_SSL?: boolean;
    DB_MAX_CONNECTIONS?: number;
    DB_IDLE_TIMEOUT?: number;
    DB_CONNECTION_TIMEOUT?: number;
    PORT?: number;
    NODE_ENV?: string;
    API_PREFIX?: string;
    CORS_ORIGIN?: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
