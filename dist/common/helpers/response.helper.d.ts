export declare class ResponseHelper {
    static success(message: string, data?: any, meta?: any): {
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    };
    static created(message: string, data?: any, meta?: any): {
        success: boolean;
        message: string;
        data: any;
        length: number | undefined;
        meta: any;
        statusCode: number;
    };
    static error(message: string, error?: any, statusCode?: number): {
        success: false;
        message: string;
        error: any;
        statusCode: number;
    };
}
