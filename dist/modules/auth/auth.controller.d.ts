import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    }>;
    profile(req: any): {
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    } | {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    };
}
