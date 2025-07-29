import { PrismaService } from '../../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAdminDashboard(session: string, term: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    fetchDashboardPerformanceTable(session: string, term: string, page?: number, limit?: number, search?: string, schoolId?: string, classId?: string, gender?: string): Promise<{
        data: {
            id: string | undefined;
            position: number;
            studentName: string;
            examNumber: string | undefined;
            school: string | undefined;
            class: string | undefined;
            gender: import(".prisma/client").$Enums.Gender | undefined;
            totalScored: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        filters: {
            search: string | undefined;
            schoolId: string | undefined;
            classId: string | undefined;
            gender: string | undefined;
        };
    }>;
}
