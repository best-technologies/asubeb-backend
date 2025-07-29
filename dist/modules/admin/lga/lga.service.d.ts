import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLgaDto } from './dto';
export declare class LgaService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createLga(createLgaDto: CreateLgaDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    private generateUniqueCode;
}
