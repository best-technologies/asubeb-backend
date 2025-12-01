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
            stateId: string;
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
            stateId: string;
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
        stateId: string;
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
            stateId: string;
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
        stateId: string;
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
        stateId: string;
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
        stateId: string;
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
                stateId: string;
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
            stateId: string;
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
        stateId: string;
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
        stateId: string;
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
        stateId: string;
        sessionId: string;
    }[]>;
}
