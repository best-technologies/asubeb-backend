import { PrismaService } from '../../../prisma/prisma.service';
import { TermType } from '@prisma/client';
export declare class StudentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getStudentDashboard(filters?: {
        session?: string;
        term?: TermType;
        schoolId?: string;
        classId?: string;
        subject?: string;
        gender?: string;
        search?: string;
        lgaId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentResultPdf(studentId: string, options?: {
        sessionId?: string;
        termId?: string;
    }): Promise<{
        pdf: Buffer<ArrayBufferLike>;
        filename: string;
    }>;
    getClassResultsPdf(params: {
        schoolId: string;
        classId: string;
        sessionId?: string;
        termId?: string;
    }): Promise<{
        pdf: Buffer<ArrayBufferLike>;
        filename: string;
    }>;
    getAllStudents(page?: number, limit?: number, schoolId?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentById(id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
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
    private updateSchoolStudentCount;
    searchFilterPaginationStudents(query: {
        page?: number;
        limit?: number;
        search?: string;
        lgaId?: string;
        schoolId?: string;
        classId?: string;
        gender?: string;
        subject?: string;
        session?: string;
        term?: TermType;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getStudentExplorer(params: {
        sessionId?: string;
        termId?: string;
        lgaId?: string;
        schoolId?: string;
        classId?: string;
        studentId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    private getStudentOrderBy;
    private getStudentFilterOptions;
}
