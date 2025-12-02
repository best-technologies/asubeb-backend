import { PrismaService } from '../../prisma/prisma.service';
export declare class AcademicContextService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCurrentSessionAndTerm(stateId: string): Promise<{
        currentSession: {
            name: string;
            id: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            stateId: string;
        } | null;
        currentTerm: {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            stateId: string;
            sessionId: string;
        } | null;
    }>;
    getLgasWithSchoolCounts(stateId: string): Promise<{
        id: string;
        name: string;
        code: string;
        state: string;
        totalSchools: number;
    }[]>;
    getSchoolsWithClassCounts(stateId: string, lgaId: string): Promise<{
        id: string;
        name: string;
        code: string;
        level: import(".prisma/client").$Enums.SchoolLevel;
        isActive: boolean;
        totalClasses: number;
    }[]>;
    getClassesWithStudentCounts(stateId: string, schoolId: string): Promise<{
        id: string;
        name: string;
        grade: string;
        section: string;
        isActive: boolean;
        totalStudents: number;
    }[]>;
}
