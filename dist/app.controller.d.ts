import { AppService } from './app.service';
import { DatabaseHealthService } from './health/database-health.service';
export declare class AppController {
    private readonly appService;
    private readonly databaseHealthService;
    constructor(appService: AppService, databaseHealthService: DatabaseHealthService);
    getHello(): string;
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        database: any;
    }>;
    echo(data: any): any;
    getUser(id: string): {
        id: string;
        name: string;
        email: string;
    };
}
