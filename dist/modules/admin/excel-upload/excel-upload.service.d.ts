import { PrismaService } from '../../../prisma/prisma.service';
export declare class ExcelUploadService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    uploadExcelFile(file: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    private processRow;
    private generateUniqueLgaCode;
    private generateUniqueSchoolCode;
    private mapGender;
    private getCurrentSessionId;
    private getCurrentTermId;
    private generateUniqueStudentId;
    private getSubjectId;
}
