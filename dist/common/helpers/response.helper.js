"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    static success(message, data = null, meta = null) {
        return {
            success: true,
            message,
            data,
            length: Array.isArray(data) ? data.length : undefined,
            meta: meta || undefined,
            statusCode: 200
        };
    }
    static created(message, data = null, meta = null) {
        return {
            success: true,
            message,
            data,
            length: Array.isArray(data) ? data.length : undefined,
            meta: meta || undefined,
            statusCode: 201
        };
    }
    static error(message, error = null, statusCode = 400) {
        return {
            success: false,
            message,
            error,
            statusCode,
        };
    }
}
exports.ResponseHelper = ResponseHelper;
//# sourceMappingURL=response.helper.js.map