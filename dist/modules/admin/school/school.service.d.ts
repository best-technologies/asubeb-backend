import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSchoolDto } from './dto';
export declare class SchoolService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createSchool(createSchoolDto: CreateSchoolDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    updateSchoolStudentCount(schoolId: string): Promise<void>;
    updateAllSchoolsStudentCounts(): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    private generateUniqueCode;
}
