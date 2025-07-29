import { ExcelUploadService } from './excel-upload.service';
export declare class ExcelUploadController {
    private readonly excelUploadService;
    private readonly logger;
    constructor(excelUploadService: ExcelUploadService);
    uploadExcelFile(file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
