import { TermType } from '@prisma/client';
export declare class DashboardQueryDto {
    session?: string;
    term?: TermType;
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    gender?: string;
    schoolLevel?: string;
    lgaId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeStats?: boolean;
    includePerformance?: boolean;
}
