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
            isActive: boolean;
            updatedAt: Date;
            stateId: string;
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
        terms: {
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
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    getSessionById(id: string): Promise<{
        terms: {
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
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    createSession(createSessionDto: CreateSessionDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    updateSession(id: string, updateSessionDto: UpdateSessionDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
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
                createdAt: Date;
                isActive: boolean;
                updatedAt: Date;
                stateId: string;
                sessionId: string;
                startDate: Date;
                endDate: Date;
                isCurrent: boolean;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            stateId: string;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        };
    }>;
    activateSession(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    deactivateSession(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        startDate: Date;
        endDate: Date;
        isCurrent: boolean;
    }>;
    getSessionTerms(id: string): Promise<{
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
    }[]>;
}
