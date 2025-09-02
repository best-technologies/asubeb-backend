export declare class BigQueryService {
    private readonly logger;
    private bigquery;
    constructor();
    queryStudentData(query: string): Promise<any[]>;
    getStudentDataFromTable(datasetId: string, tableId: string, limit?: number): Promise<any[]>;
    testConnection(): Promise<boolean>;
}
