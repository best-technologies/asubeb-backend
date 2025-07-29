import { PrismaService } from '../../../prisma/prisma.service';
export declare class TermService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAllTerms(page: number, limit: number, sessionId?: string, isActive?: boolean): Promise<{
        data: ({
            session: {
                school: {
                    name: string;
                    id: string;
                    code: string;
                };
                name: string;
                id: string;
            };
            _count: {
                assessments: number;
            };
        } & {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            school: {
                name: string;
                id: string;
                code: string;
            };
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
    }>;
    getTermById(id: string): Promise<{
        session: {
            school: {
                name: string;
                id: string;
                code: string;
            };
            name: string;
            id: string;
        };
        assessments: {
            description: string | null;
            type: import(".prisma/client").$Enums.AssessmentType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            teacherId: string | null;
            studentId: string;
            classId: string;
            termId: string;
            subjectId: string;
            title: string;
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
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
    }>;
    createTerm(createTermDto: any): Promise<{
        session: {
            school: {
                name: string;
                id: string;
                code: string;
            };
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
    }>;
    updateTerm(id: string, updateTermDto: any): Promise<{
        session: {
            school: {
                name: string;
                id: string;
                code: string;
            };
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
    }>;
    deleteTerm(id: string): Promise<{
        message: string;
        deletedTerm: {
            assessments: {
                description: string | null;
                type: import(".prisma/client").$Enums.AssessmentType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                teacherId: string | null;
                studentId: string;
                classId: string;
                termId: string;
                subjectId: string;
                title: string;
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
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
        };
    }>;
    activateTerm(id: string): Promise<{
        session: {
            school: {
                name: string;
                id: string;
                code: string;
            };
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
    }>;
    deactivateTerm(id: string): Promise<{
        session: {
            school: {
                name: string;
                id: string;
                code: string;
            };
            name: string;
            id: string;
        };
    } & {
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
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
        createdAt: Date;
        updatedAt: Date;
        teacherId: string | null;
        studentId: string;
        classId: string;
        termId: string;
        subjectId: string;
        title: string;
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
