import { EnrollmentService } from './enrollment.service';
import { EnrollOfficerDto } from '../subeb-officers/dto';
import { EnrollSingleOrBulkStudentsDto } from './dto/enroll-student.dto';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    healthCheck(): Promise<{
        ok: boolean;
    }>;
    getStudentEnrollmentMetadata(req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getSchoolsForStudentEnrollment(req: any, lgaId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getClassesForStudentEnrollment(req: any, schoolId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    enrollNewSubebOfficer(req: any, dto: EnrollOfficerDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    enrollSingleOrBulkStudents(req: any, payload: EnrollSingleOrBulkStudentsDto): Promise<{
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
