import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto';
export declare class SchoolController {
    private readonly schoolService;
    private readonly logger;
    constructor(schoolService: SchoolService);
    createSchool(createSchoolDto: CreateSchoolDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getAllSchools(page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getAllClasses(page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    updateAllStudentCounts(): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
}
