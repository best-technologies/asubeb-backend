import { EnrollmentService } from './enrollment.service';
import { EnrollOfficerDto } from '../subeb-officers/dto';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    healthCheck(): Promise<{
        ok: boolean;
    }>;
    enrollNewSubebOfficer(req: any, dto: EnrollOfficerDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
