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
            isActive: boolean;
            updatedAt: Date;
            stateId: string;
            sessionId: string;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
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
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
            isActive: boolean;
            updatedAt: Date;
            stateId: string;
            sessionId: string;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
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
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    getTermAssessments(id: string): Promise<({
        student: {
            id: string;
            studentId: string;
            firstName: string;
            lastName: string;
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
