import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getAdminDashboard(query: DashboardQueryDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    fetchDashboardPerformanceTable(session: string, term: string, page?: number, limit?: number, search?: string, schoolId?: string, classId?: string, gender?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
