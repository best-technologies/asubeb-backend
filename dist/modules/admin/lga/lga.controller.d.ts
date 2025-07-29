import { LgaService } from './lga.service';
import { CreateLgaDto } from './dto';
export declare class LgaController {
    private readonly lgaService;
    private readonly logger;
    constructor(lgaService: LgaService);
    createLga(createLgaDto: CreateLgaDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
