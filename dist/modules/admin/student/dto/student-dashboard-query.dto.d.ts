import { TermType } from '@prisma/client';
export declare class StudentDashboardQueryDto {
    session?: string;
    term?: TermType;
    lgaId?: string;
    schoolId?: string;
    classId?: string;
    page?: number;
    limit?: number;
}
