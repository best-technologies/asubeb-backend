export interface AppConfig {
    port: number;
    nodeEnv: string;
    apiPrefix: string;
    corsOrigin: string[];
    jwtSecret: string;
    jwtExpiresIn: string;
}
declare const _default: (() => AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AppConfig>;
export default _default;
