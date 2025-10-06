import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
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
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<SafeUser | null>;
    login(user: SafeUser): Promise<{
        access_token: string;
        user: {
            sub: string;
            id: string | undefined;
            email: string;
            role: string;
        };
    }>;
    register(data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }): Promise<SafeUser>;
}
