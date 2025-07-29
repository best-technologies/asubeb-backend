import { PrismaService } from '../prisma/prisma.service';
export declare class DatabaseHealthService {
    private prisma;
    constructor(prisma: PrismaService);
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        details?: any;
    }>;
}
