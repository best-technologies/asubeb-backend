import { TermType } from '@prisma/client';
export declare class StudentDashboardQueryDto {
    session?: string;
    term?: TermType;
    lgaId?: string;
    schoolId?: string;
    classId?: string;
    get page(): number;
    set page(value: number);
    private _page;
    get limit(): number;
    set limit(value: number);
    private _limit;
}
