import { BigQueryImportService } from './bigquery-import.service';
interface BigQueryRow {
    school_name: string;
    lga: string;
    student_name: string;
    class: string;
    gender: string;
    english_language?: number;
    mathematics?: number;
    number_work?: number;
    general_norms?: number;
    letter_work?: number;
    rhyme?: number;
    national_values?: number;
    prevocational?: number;
    crs?: number;
    history?: number;
    igbo_language?: number;
    cca?: number;
    basic_science_technology?: number;
    total_score?: number;
}
export declare class BigQueryImportController {
    private readonly bigQueryImportService;
    private readonly logger;
    constructor(bigQueryImportService: BigQueryImportService);
    importFromBigQuery(bigQueryData: BigQueryRow[]): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    importFromBigQueryBatch(body: {
        data: BigQueryRow[];
        batchSize?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            totalBatches: number;
            processedBatches: number;
            totalRows: number;
            processedRows: number;
            createdSchools: number;
            createdLgas: number;
            createdStudents: number;
            createdAssessments: number;
            errors: string[];
        };
    }>;
    importFromBigQueryTable(body: {
        datasetId: string;
        tableId: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    testBigQueryConnection(): Promise<{
        success: boolean;
        message: string;
        connected: boolean;
    }>;
}
export {};
