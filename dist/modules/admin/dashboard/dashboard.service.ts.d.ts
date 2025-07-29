import { PrismaService } from '../../../prisma/prisma.service';
import { TermType } from '@prisma/client';
export declare class DashboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAdminDashboard(session: string, term: TermType): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    fetchDashboardPerformanceTable(session: string, term: TermType, page?: number, limit?: number, search?: string, schoolId?: string, classId?: string, gender?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
