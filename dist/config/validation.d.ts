declare class EnvironmentVariables {
    DATABASE_URL: string;
    PORT?: number;
    NODE_ENV?: string;
    API_PREFIX?: string;
    CORS_ORIGIN?: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
