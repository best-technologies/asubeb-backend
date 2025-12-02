import { PrismaService } from '../../../prisma/prisma.service';
import { EnrollOfficerDto } from '../subeb-officers/dto';
import { AcademicContextService } from '../../academic/academic-context.service';
import { EnrollSingleOrBulkStudentsDto } from './dto/enroll-student.dto';
export declare class EnrollmentService {
    private readonly prisma;
    private readonly academicContext;
    private readonly logger;
    constructor(prisma: PrismaService, academicContext: AcademicContextService);
    healthCheck(): Promise<{
        ok: boolean;
    }>;
    getStudentEnrollmentMetadata(user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getSchoolsForStudentEnrollment(user: any, lgaId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getClassesForStudentEnrollment(user: any, schoolId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    enrollNewSubebOfficer(dto: EnrollOfficerDto, user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    private enrollSingleStudentInternal;
    enrollSingleOrBulkStudents(payload: EnrollSingleOrBulkStudentsDto, user: any): Promise<{
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
}
