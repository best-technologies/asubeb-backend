import { PrismaService } from '../../../prisma/prisma.service';
import { EnrollOfficerDto, UpdateOfficerDto } from './dto';
export declare class SubebOfficersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private generateUniqueOfficerId;
    enrollOfficer(data: EnrollOfficerDto, enrolledByUserId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getAllOfficers(page?: number, limit?: number, stateId?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    updateOfficer(id: string, data: UpdateOfficerDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
