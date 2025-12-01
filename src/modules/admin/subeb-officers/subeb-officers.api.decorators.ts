import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

/**
 * API Documentation Decorators for SUBEB Officers endpoints
 * This file contains all Swagger/OpenAPI decorators to keep the controller clean
 */

export const ApiEnrollOfficer = () =>
  applyDecorators(
    ApiOperation({ summary: 'Enroll a new SUBEB officer' }),
    ApiResponse({
      status: 201,
      description: 'SUBEB officer enrolled successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiResponse({
      status: 409,
      description: 'User with this email already exists',
    }),
  );

export const ApiGetAllOfficers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all enrolled SUBEB officers with pagination' }),
    ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 }),
    ApiQuery({ name: 'limit', required: false, description: 'Records per page (default: 10)', example: 10 }),
    ApiResponse({
      status: 200,
      description: 'SUBEB officers retrieved successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
  );

export const ApiUpdateOfficer = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a SUBEB officer (partial update)' }),
    ApiParam({ name: 'id', description: 'SUBEB officer ID', example: 'cmhtd7o950003vlmxs173b4gq' }),
    ApiResponse({
      status: 200,
      description: 'SUBEB officer updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'SUBEB officer not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Email already exists (if updating email)',
    }),
  );

