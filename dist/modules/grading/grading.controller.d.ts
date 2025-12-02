import { GradingService } from './grading.service';
export declare class GradingController {
    private readonly gradingService;
    constructor(gradingService: GradingService);
    fetchAcademicMetadataForGradeEntry(req: any): Promise<{
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
    fetchSchoolsByLocalGovernment(req: any, lgaId: string): Promise<{
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
    fetchClassesBySchool(req: any, schoolId: string): Promise<{
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
    fetchAllStudentsByClassId(req: any, classId: string): Promise<{
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
