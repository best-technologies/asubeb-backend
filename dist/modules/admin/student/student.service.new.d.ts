import { PrismaService } from '../../../prisma/prisma.service';
import { StudentDashboardQueryDto } from './dto/student-dashboard-query.dto';
export declare class StudentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getStudentDashboard(query: StudentDashboardQueryDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
