import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getAdminDashboard(session: string, term: string): Promise<any>;
    fetchDashboardPerformanceTable(session: string, term: string, page?: number, limit?: number, search?: string, schoolId?: string, classId?: string, gender?: string): Promise<any>;
}
