import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';
export declare class SessionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAllSessions(page: number, limit: number, schoolId?: string, isActive?: boolean): Promise<{
        data: ({
            school: {
                name: string;
                id: string;
                code: string;
            };
            _count: {
                terms: number;
            };
        } & {
            name: string;
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
    getCurrentSession(): Promise<{
        school: {
            name: string;
            id: string;
            code: string;
        };
        terms: {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        }[];
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    getSessionById(id: string): Promise<{
        school: {
            name: string;
            id: string;
            code: string;
        };
        terms: {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        }[];
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    createSession(createSessionDto: CreateSessionDto): Promise<{
        school: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    updateSession(id: string, updateSessionDto: UpdateSessionDto): Promise<{
        school: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    deleteSession(id: string): Promise<{
        message: string;
        deletedSession: {
            terms: {
                name: import(".prisma/client").$Enums.TermType;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                sessionId: string;
                startDate: Date;
                endDate: Date;
                isCurrent: boolean;
            }[];
        } & {
            name: string;
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        };
    }>;
    activateSession(id: string): Promise<{
        school: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    deactivateSession(id: string): Promise<{
        school: {
            name: string;
            id: string;
            code: string;
        };
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    getSessionTerms(id: string): Promise<{
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }[]>;
}
