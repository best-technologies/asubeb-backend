import { PrismaService } from '../../../prisma/prisma.service';
import { EnrollOfficerDto } from '../subeb-officers/dto';
export declare class EnrollmentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    healthCheck(): Promise<{
        ok: boolean;
    }>;
    enrollNewSubebOfficer(dto: EnrollOfficerDto, user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
