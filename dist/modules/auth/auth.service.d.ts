import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../../common/mailer/mail.service';
export type SafeUser = {
    id: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
};
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly mailService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    validateUser(email: string, pass: string): Promise<SafeUser | null>;
    authenticate(email: string, password: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    private login;
    register(data: RegisterDto, role?: UserRole): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    registerSubebOfficer(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    }>;
    getProfile(user: any): {
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    };
}
