"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GradingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const response_helper_1 = require("../../common/helpers/response.helper");
const colors = require("colors");
const academic_context_service_1 = require("../academic/academic-context.service");
let GradingService = GradingService_1 = class GradingService {
    prisma;
    academicContext;
    logger = new common_1.Logger(GradingService_1.name);
    constructor(prisma, academicContext) {
        this.prisma = prisma;
        this.academicContext = academicContext;
    }
    grades = [
        {
            id: '1',
            studentId: '1',
            subject: 'Mathematics',
            semester: 'First Semester',
            academicYear: '2023-2024',
            assignmentScore: 85,
            examScore: 90,
            totalScore: 87.5,
            grade: 'A',
            remarks: 'Excellent performance',
            teacherId: 'TCH001',
            teacherName: 'Mr. Johnson',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            studentId: '1',
            subject: 'English',
            semester: 'First Semester',
            academicYear: '2023-2024',
            assignmentScore: 78,
            examScore: 82,
            totalScore: 80,
            grade: 'B+',
            remarks: 'Good performance',
            teacherId: 'TCH002',
            teacherName: 'Mrs. Smith',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
    subjects = [
        { id: '1', name: 'Mathematics', code: 'MATH101' },
        { id: '2', name: 'English', code: 'ENG101' },
        { id: '3', name: 'Science', code: 'SCI101' },
        { id: '4', name: 'History', code: 'HIST101' },
        { id: '5', name: 'Geography', code: 'GEO101' },
        { id: '6', name: 'Computer Science', code: 'CS101' },
    ];
    gradeScales = [
        { grade: 'A', minScore: 90, maxScore: 100, points: 4.0 },
        { grade: 'A-', minScore: 85, maxScore: 89, points: 3.7 },
        { grade: 'B+', minScore: 80, maxScore: 84, points: 3.3 },
        { grade: 'B', minScore: 75, maxScore: 79, points: 3.0 },
        { grade: 'B-', minScore: 70, maxScore: 74, points: 2.7 },
        { grade: 'C+', minScore: 65, maxScore: 69, points: 2.3 },
        { grade: 'C', minScore: 60, maxScore: 64, points: 2.0 },
        { grade: 'D', minScore: 50, maxScore: 59, points: 1.0 },
        { grade: 'F', minScore: 0, maxScore: 49, points: 0.0 },
    ];
    async getAcademicMetadataForGradeEntry(stateId) {
        this.logger.log(colors.magenta(`Fetching academic metadata for grade entry for state ${stateId}`));
        try {
            const [{ currentSession, currentTerm }, lgas] = await Promise.all([
                this.academicContext.getCurrentSessionAndTerm(stateId),
                this.academicContext.getLgasWithSchoolCounts(stateId),
            ]);
            this.logger.log(colors.green('Academic metadata for grade entry retrieved successfully'));
            return response_helper_1.ResponseHelper.success('Academic metadata retrieved successfully', {
                stateId,
                currentSession,
                currentTerm,
                totalLocalGovernments: lgas.length,
                localGovernments: lgas,
            });
        }
        catch (error) {
            this.logger.error(colors.red(`Failed to fetch academic metadata for grade entry: ${error?.message ?? error}`));
            return response_helper_1.ResponseHelper.error('Failed to fetch academic metadata for grade entry', error?.message ?? error, 500);
        }
    }
    async getSchoolsByLocalGovernment(stateId, lgaId) {
        this.logger.log(colors.magenta(`Fetching schools for state ${stateId} and LGA ${lgaId}`));
        try {
            const schools = await this.academicContext.getSchoolsWithClassCounts(stateId, lgaId);
            this.logger.log(colors.green(`Retrieved ${schools.length} schools for LGA ${lgaId}`));
            return response_helper_1.ResponseHelper.success('Schools in LGA retrieved successfully', {
                stateId,
                lgaId,
                total: schools.length,
                schools,
            });
        }
        catch (error) {
            this.logger.error(colors.red(`Failed to fetch schools for LGA ${lgaId}: ${error?.message ?? error}`));
            return response_helper_1.ResponseHelper.error('Failed to fetch schools for LGA', error?.message ?? error, 500);
        }
    }
    async getClassesBySchool(stateId, schoolId) {
        this.logger.log(colors.magenta(`Fetching classes for state ${stateId} and school ${schoolId}`));
        try {
            const classes = await this.academicContext.getClassesWithStudentCounts(stateId, schoolId);
            this.logger.log(colors.green(`Retrieved ${classes.length} classes for school ${schoolId}`));
            return response_helper_1.ResponseHelper.success('Classes in school retrieved successfully', {
                stateId,
                schoolId,
                total: classes.length,
                classes,
            });
        }
        catch (error) {
            this.logger.error(colors.red(`Failed to fetch classes for school ${schoolId}: ${error?.message ?? error}`));
            return response_helper_1.ResponseHelper.error('Failed to fetch classes for school', error?.message ?? error, 500);
        }
    }
    async fetchAllStudentsByClassId(classId) {
        this.logger.log(colors.magenta(`Fetching students for class ${classId}`));
        try {
            const students = await this.prisma.student.findMany({
                where: {
                    classId,
                    isActive: true,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    studentId: true,
                    gender: true,
                    email: true,
                    schoolId: true,
                    stateId: true,
                },
                orderBy: { lastName: 'asc' },
            });
            if (students.length === 0) {
                this.logger.log(colors.yellow(`No students found for class ${classId}`));
                return response_helper_1.ResponseHelper.success('No students found for class', {
                    currentSession: null,
                    currentTerm: null,
                    stateId: null,
                    schoolId: null,
                    classId,
                    total: 0,
                    students: [],
                });
            }
            const stateId = students[0].stateId;
            const { currentSession, currentTerm } = await this.academicContext.getCurrentSessionAndTerm(stateId);
            let studentIdsWithResults = new Set();
            if (currentTerm) {
                const assessments = await this.prisma.assessment.findMany({
                    where: {
                        classId,
                        termId: currentTerm.id,
                    },
                    select: {
                        studentId: true,
                    },
                });
                studentIdsWithResults = new Set(assessments.map(a => a.studentId));
            }
            this.logger.log(colors.green(`Retrieved ${students.length} students for class ${classId}`));
            const schoolId = students[0]?.schoolId ?? null;
            return response_helper_1.ResponseHelper.success('Students in class retrieved successfully', {
                currentSession: currentSession
                    ? {
                        id: currentSession.id,
                        name: currentSession.name,
                        isCurrent: currentSession.isCurrent,
                    }
                    : null,
                currentTerm: currentTerm
                    ? {
                        isCurrent: currentTerm.isCurrent,
                        name: currentTerm.name,
                        id: currentTerm.id,
                    }
                    : null,
                stateId,
                schoolId,
                classId,
                total: students.length,
                students: students.map(({ schoolId, firstName, lastName, ...rest }) => {
                    const rawFullName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || firstName || lastName || '';
                    const formattedFullName = this.formatFullName(rawFullName);
                    return {
                        ...rest,
                        firstName,
                        lastName,
                        fullName: formattedFullName,
                        hasResultForActiveTerm: currentTerm ? studentIdsWithResults.has(rest.id) : false,
                    };
                }),
            });
        }
        catch (error) {
            this.logger.error(colors.red(`Failed to fetch students for class ${classId}: ${error?.message ?? error}`));
            return response_helper_1.ResponseHelper.error('Failed to fetch students for class', error?.message ?? error, 500);
        }
    }
    formatFullName(name) {
        if (!name)
            return '';
        return name
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }
};
exports.GradingService = GradingService;
exports.GradingService = GradingService = GradingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        academic_context_service_1.AcademicContextService])
], GradingService);
//# sourceMappingURL=grading.service.js.map