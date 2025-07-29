import { TermService } from './term.service';
export declare class TermController {
    private readonly termService;
    constructor(termService: TermService);
    getAllTerms(page?: number, limit?: number, sessionId?: string, isActive?: boolean): Promise<{
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
            title: string;
            classId: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
                updatedAt: Date;
                studentId: string;
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        updatedAt: Date;
        studentId: string;
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
