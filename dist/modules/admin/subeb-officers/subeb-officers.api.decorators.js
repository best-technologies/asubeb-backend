"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiUpdateOfficer = exports.ApiGetAllOfficers = exports.ApiEnrollOfficer = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiEnrollOfficer = () => (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Enroll a new SUBEB officer' }), (0, swagger_1.ApiResponse)({
    status: 201,
    description: 'SUBEB officer enrolled successfully',
}), (0, swagger_1.ApiResponse)({
    status: 400,
    description: 'Invalid input data',
}), (0, swagger_1.ApiResponse)({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
}), (0, swagger_1.ApiResponse)({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
}), (0, swagger_1.ApiResponse)({
    status: 409,
    description: 'User with this email already exists',
}));
exports.ApiEnrollOfficer = ApiEnrollOfficer;
const ApiGetAllOfficers = () => (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get all enrolled SUBEB officers with pagination' }), (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Records per page (default: 10)', example: 10 }), (0, swagger_1.ApiResponse)({
    status: 200,
    description: 'SUBEB officers retrieved successfully',
}), (0, swagger_1.ApiResponse)({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
}), (0, swagger_1.ApiResponse)({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
}));
exports.ApiGetAllOfficers = ApiGetAllOfficers;
const ApiUpdateOfficer = () => (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Update a SUBEB officer (partial update)' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'SUBEB officer ID', example: 'cmhtd7o950003vlmxs173b4gq' }), (0, swagger_1.ApiResponse)({
    status: 200,
    description: 'SUBEB officer updated successfully',
}), (0, swagger_1.ApiResponse)({
    status: 400,
    description: 'Invalid input data',
}), (0, swagger_1.ApiResponse)({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
}), (0, swagger_1.ApiResponse)({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
}), (0, swagger_1.ApiResponse)({
    status: 404,
    description: 'SUBEB officer not found',
}), (0, swagger_1.ApiResponse)({
    status: 409,
    description: 'Email already exists (if updating email)',
}));
exports.ApiUpdateOfficer = ApiUpdateOfficer;
//# sourceMappingURL=subeb-officers.api.decorators.js.map