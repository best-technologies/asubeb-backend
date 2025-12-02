import { PrismaService } from '../../../prisma/prisma.service';
export declare class TermService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAllTerms(page: number, limit: number, sessionId?: string, isActive?: boolean): Promise<{
        data: ({
            session: {
                name: string;
                id: string;
            };
            _count: {
                assessments: number;
            };
        } & {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            stateId: string;
            sessionId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCurrentTerm(): Promise<{
        session: {
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        stateId: string;
        sessionId: string;
    }>;
    getTermById(id: string): Promise<{
        session: {
            name: string;
            id: string;
        };
        assessments: {
            description: string | null;
            type: import(".prisma/client").$Enums.AssessmentType;
            id: string;
            title: string;
            classId: string;
            createdAt: Date;
            studentId: string;
            updatedAt: Date;
            teacherId: string | null;
            subjectId: string;
            termId: string;
            maxScore: number;
            score: number;
            percentage: number;
            remarks: string | null;
            dateGiven: Date;
            dateSubmitted: Date | null;
            isSubmitted: boolean;
            isGraded: boolean;
        }[];
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        stateId: string;
        sessionId: string;
    }>;
    createTerm(createTermDto: any): Promise<{
        session: {
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        stateId: string;
        sessionId: string;
    }>;
    updateTerm(id: string, updateTermDto: any): Promise<{
        session: {
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        stateId: string;
        sessionId: string;
    }>;
    deleteTerm(id: string): Promise<{
        message: string;
        deletedTerm: {
            assessments: {
                description: string | null;
                type: import(".prisma/client").$Enums.AssessmentType;
                id: string;
                title: string;
                classId: string;
                createdAt: Date;
                studentId: string;
                updatedAt: Date;
                teacherId: string | null;
                subjectId: string;
                termId: string;
                maxScore: number;
                score: number;
                percentage: number;
                remarks: string | null;
                dateGiven: Date;
                dateSubmitted: Date | null;
                isSubmitted: boolean;
                isGraded: boolean;
            }[];
        } & {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            stateId: string;
            sessionId: string;
        };
    }>;
    activateTerm(id: string): Promise<{
        session: {
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        stateId: string;
        sessionId: string;
    }>;
    deactivateTerm(id: string): Promise<{
        session: {
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        stateId: string;
        sessionId: string;
    }>;
    getTermAssessments(id: string): Promise<({
        student: {
            id: string;
            firstName: string;
            lastName: string;
            studentId: string;
        };
        subject: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.AssessmentType;
        id: string;
        title: string;
        classId: string;
        createdAt: Date;
        studentId: string;
        updatedAt: Date;
        teacherId: string | null;
        subjectId: string;
        termId: string;
        maxScore: number;
        score: number;
        percentage: number;
        remarks: string | null;
        dateGiven: Date;
        dateSubmitted: Date | null;
        isSubmitted: boolean;
        isGraded: boolean;
    })[]>;
}
