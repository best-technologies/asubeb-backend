import { SubebOfficersService } from './subeb-officers.service';
import { EnrollOfficerDto, UpdateOfficerDto } from './dto';
export declare class SubebOfficersController {
    private readonly subebOfficersService;
    constructor(subebOfficersService: SubebOfficersService);
    enrollOfficer(dto: EnrollOfficerDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getAllOfficers(page: number | undefined, limit: number | undefined, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    updateOfficer(id: string, dto: UpdateOfficerDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
