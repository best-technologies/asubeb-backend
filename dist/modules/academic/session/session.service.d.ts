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
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
        }[];
    } & {
        name: string;
        id: string;
        schoolId: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
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
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
        }[];
    } & {
        name: string;
        id: string;
        schoolId: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteSession(id: string): Promise<{
        message: string;
        deletedSession: {
            terms: {
                name: import(".prisma/client").$Enums.TermType;
                id: string;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
                isCurrent: boolean;
                createdAt: Date;
                updatedAt: Date;
                sessionId: string;
            }[];
        } & {
            name: string;
            id: string;
            schoolId: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSessionTerms(id: string): Promise<{
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
    }[]>;
}
