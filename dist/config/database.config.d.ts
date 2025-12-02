export interface DatabaseConfig {
    url: string;
}
declare const _default: (() => DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<DatabaseConfig>;
export default _default;
