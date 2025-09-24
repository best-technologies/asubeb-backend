import { Response as ExpressResponse } from 'express';
import { StudentService } from './student.service';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    getStudentExplorer(sessionId?: string, termId?: string, lgaId?: string, schoolId?: string, classId?: string, studentId?: string, search?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentExploreAlias(sessionId?: string, termId?: string, lgaId?: string, schoolId?: string, classId?: string, studentId?: string, search?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentDashboard(session?: string, term?: string, schoolId?: string, classId?: string, subject?: string, gender?: string, search?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    searchFilterPaginationStudents(page?: number, limit?: number, search?: string, lgaId?: string, schoolId?: string, classId?: string, gender?: string, subject?: string, session?: string, term?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getAllStudents(page?: number, limit?: number, schoolId?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    downloadClassResultsPdf(schoolId: string, classId: string, sessionId: string | undefined, termId: string | undefined, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
    getStudentById(id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    downloadStudentResultPdf(id: string, sessionId: string | undefined, termId: string | undefined, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
    createStudent(createStudentDto: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    updateStudent(id: string, updateStudentDto: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    deleteStudent(id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentAcademicRecord(id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentAssessmentBreakdown(id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
