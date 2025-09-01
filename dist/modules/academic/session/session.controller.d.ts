import { SessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    getAllSessions(page?: number, limit?: number, isActive?: boolean): Promise<{
        data: ({
            _count: {
                terms: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
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
        terms: {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            sessionId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
    }>;
    getSessionById(id: string): Promise<{
        terms: {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            sessionId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
    }>;
    createSession(createSessionDto: CreateSessionDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
    }>;
    updateSession(id: string, updateSessionDto: UpdateSessionDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
    }>;
    deleteSession(id: string): Promise<{
        message: string;
        deletedSession: {
            terms: {
                name: import(".prisma/client").$Enums.TermType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
                isCurrent: boolean;
                sessionId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
        };
    }>;
    activateSession(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
    }>;
    deactivateSession(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
    }>;
    getSessionTerms(id: string): Promise<{
        name: import(".prisma/client").$Enums.TermType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isCurrent: boolean;
        sessionId: string;
    }[]>;
}
