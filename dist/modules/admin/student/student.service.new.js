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
var StudentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const response_helper_1 = require("../../../common/helpers/response.helper");
let StudentService = StudentService_1 = class StudentService {
    prisma;
    logger = new common_1.Logger(StudentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentDashboard(query) {
        this.logger.log(`Fetching student dashboard data with query onsense :`, query);
        try {
            let currentSession = query.session;
            let currentTerm = query.term;
            if (!currentSession || !currentTerm) {
                const activeSession = await this.prisma.session.findFirst({
                    where: { isActive: true },
                    include: {
                        terms: {
                            where: { isActive: true },
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                });
                if (!activeSession) {
                    throw new Error('No active session found');
                }
                currentSession = currentSession || activeSession.name;
                currentTerm = currentTerm || activeSession.terms[0]?.name;
                if (!query.lgaId) {
                    const lgas = await this.prisma.localGovernmentArea.findMany({
                        where: { isActive: true },
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            state: true,
                        },
                    });
                    return response_helper_1.ResponseHelper.success('Basic dashboard data retrieved successfully', {
                        session: currentSession,
                        term: currentTerm,
                        lgas,
                        totalLgas: lgas.length
                    });
                }
            }
            if (query.lgaId && !query.schoolId) {
                const schools = await this.prisma.school.findMany({
                    where: {
                        isActive: true,
                        lgaId: query.lgaId
                    },
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        level: true,
                    },
                });
                return response_helper_1.ResponseHelper.success('Schools in LGA retrieved successfully', {
                    session: currentSession,
                    term: currentTerm,
                    schools,
                    totalSchools: schools.length
                });
            }
            if (query.schoolId && !query.classId) {
                const classes = await this.prisma.class.findMany({
                    where: {
                        isActive: true,
                        schoolId: query.schoolId
                    },
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        section: true,
                    },
                });
                return response_helper_1.ResponseHelper.success('Classes in school retrieved successfully', {
                    session: currentSession,
                    term: currentTerm,
                    classes,
                    totalClasses: classes.length
                });
            }
            if (query.classId) {
                const skip = (query.page - 1) * query.limit;
                const totalStudents = await this.prisma.student.count({
                    where: {
                        isActive: true,
                        classId: query.classId,
                    }
                });
                const students = await this.prisma.student.findMany({
                    where: {
                        isActive: true,
                        classId: query.classId,
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                        gender: true,
                        assessments: {
                            where: {
                                term: {
                                    name: currentTerm,
                                    session: {
                                        name: currentSession,
                                    },
                                },
                            },
                            select: {
                                score: true,
                                maxScore: true,
                                subject: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        firstName: 'asc',
                    },
                    skip,
                    take: query.limit,
                });
                const performanceData = students.map(student => {
                    const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                    const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
                    const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
                    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
                    return {
                        id: student.id,
                        studentName: `${student.firstName} ${student.lastName}`,
                        examNo: student.studentId,
                        total: totalScore,
                        average: Math.round(average * 100) / 100,
                        percentage: Math.round(percentage * 100) / 100,
                        gender: student.gender,
                    };
                });
                const totalPages = Math.ceil(totalStudents / query.limit);
                const hasMore = query.page < totalPages;
                return response_helper_1.ResponseHelper.success('Students in class retrieved successfully', {
                    session: currentSession,
                    term: currentTerm,
                    students: performanceData,
                    pagination: {
                        currentPage: query.page,
                        totalPages,
                        totalItems: totalStudents,
                        itemsPerPage: query.limit,
                        hasMore
                    }
                });
            }
            throw new Error('Invalid filter combination. Please provide appropriate filters');
        }
        catch (error) {
            throw new Error(`Error fetching student dashboard: ${error.message}`);
        }
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = StudentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.new.js.map