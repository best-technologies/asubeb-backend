export interface BigQueryConfig {
    projectId: string;
    keyFilename?: string;
    clientEmail?: string;
    privateKey?: string;
    location: string;
}
declare const _default: (() => BigQueryConfig) & import("@nestjs/config").ConfigFactoryKeyHost<BigQueryConfig>;
export default _default;
