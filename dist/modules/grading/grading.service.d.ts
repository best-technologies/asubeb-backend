import { PrismaService } from '../../prisma/prisma.service';
import { AcademicContextService } from '../academic/academic-context.service';
export declare class GradingService {
    private readonly prisma;
    private readonly academicContext;
    private readonly logger;
    constructor(prisma: PrismaService, academicContext: AcademicContextService);
    private grades;
    private subjects;
    private gradeScales;
    getAcademicMetadataForGradeEntry(stateId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    }>;
    getSchoolsByLocalGovernment(stateId: string, lgaId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    }>;
    getClassesBySchool(stateId: string, schoolId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    }>;
    fetchAllStudentsByClassId(classId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    }>;
    private formatFullName;
}
