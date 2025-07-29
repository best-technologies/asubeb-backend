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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const response_helper_1 = require("../../../common/helpers/response.helper");
let DashboardService = DashboardService_1 = class DashboardService {
    prisma;
    logger = new common_1.Logger(DashboardService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminDashboard(session, term) {
        this.logger.log(`Fetching admin dashboard data for session: ${session}, term: ${term}`);
        try {
            const sessionData = await this.prisma.session.findFirst({
                where: { name: session },
            });
            if (!sessionData) {
                throw new Error('Session not found');
            }
            const totalStudents = await this.prisma.student.count({
                where: { isActive: true },
            });
            const genderDistribution = await this.prisma.student.groupBy({
                by: ['gender'],
                where: { isActive: true },
                _count: {
                    gender: true,
                },
            });
            const totalMale = genderDistribution.find(g => g.gender === 'MALE')?._count.gender || 0;
            const totalFemale = genderDistribution.find(g => g.gender === 'FEMALE')?._count.gender || 0;
            const schools = await this.prisma.school.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    level: true,
                    _count: {
                        select: {
                            students: {
                                where: { isActive: true },
                            },
                            teachers: {
                                where: { isActive: true },
                            },
                        },
                    },
                },
            });
            const schoolsWithCounts = schools.map(school => ({
                id: school.id,
                name: school.name,
                code: school.code,
                level: school.level,
                totalStudents: school._count.students,
                totalTeachers: school._count.teachers,
            }));
            const lgas = await this.prisma.localGovernmentArea.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    state: true,
                },
            });
            const classes = await this.prisma.class.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    grade: true,
                    section: true,
                    capacity: true,
                    school: {
                        select: {
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            students: {
                                where: { isActive: true },
                            },
                        },
                    },
                },
            });
            const classesWithEnrollment = classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                grade: cls.grade,
                section: cls.section,
                capacity: cls.capacity,
                currentEnrollment: cls._count.students,
                school: {
                    name: cls.school.name,
                },
            }));
            const subjects = await this.prisma.subject.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    level: true,
                },
            });
            const topStudents = await this.prisma.student.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    studentId: true,
                    gender: true,
                    school: {
                        select: {
                            name: true,
                        },
                    },
                    class: {
                        select: {
                            name: true,
                        },
                    },
                    assessments: {
                        where: {
                            term: {
                                name: term,
                                session: {
                                    name: session,
                                },
                            },
                        },
                        select: {
                            score: true,
                        },
                    },
                },
                take: 10,
            });
            const studentsWithScores = topStudents.map(student => {
                const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                return {
                    id: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    examNumber: student.studentId,
                    school: student.school?.name || 'N/A',
                    class: student.class?.name || 'N/A',
                    gender: student.gender,
                    totalScore,
                };
            });
            studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
            const topStudentsWithPositions = studentsWithScores.map((student, index) => ({
                position: index + 1,
                ...student,
            }));
            return response_helper_1.ResponseHelper.success('Admin Dashboard Data retrieved successfully', {
                session: sessionData.name,
                term,
                totalStudents,
                totalMale,
                totalFemale,
                schools: schoolsWithCounts,
                lgas,
                classes: classesWithEnrollment,
                genders: genderDistribution,
                subjects,
                topStudents: topStudentsWithPositions,
                lastUpdated: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logger.error(`Error fetching admin dashboard: ${error.message}`, error.stack);
            throw error;
        }
    }
    async fetchDashboardPerformanceTable(session, term, page = 1, limit = 10, search, schoolId, classId, gender) {
        this.logger.log(`Fetching performance table for session: ${session}, term: ${term}`);
        try {
            const skip = (page - 1) * limit;
            const whereConditions = {
                isActive: true,
                assessments: {
                    some: {
                        term: {
                            name: term,
                            session: {
                                name: session,
                            },
                        },
                    },
                },
            };
            if (schoolId) {
                whereConditions.schoolId = schoolId;
            }
            if (classId) {
                whereConditions.classId = classId;
            }
            if (gender) {
                whereConditions.gender = gender;
            }
            if (search) {
                whereConditions.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { studentId: { contains: search, mode: 'insensitive' } },
                ];
            }
            const students = await this.prisma.student.findMany({
                where: whereConditions,
                include: {
                    school: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                    class: {
                        select: {
                            name: true,
                        },
                    },
                    assessments: {
                        where: {
                            term: {
                                name: term,
                                session: {
                                    name: session,
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
                skip,
                take: limit,
                orderBy: {
                    firstName: 'asc',
                },
            });
            const performanceData = students.map(student => {
                const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
                const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
                const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
                return {
                    id: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    examNumber: student.studentId,
                    school: student.school?.name || 'N/A',
                    class: student.class?.name || 'N/A',
                    totalScore,
                    average: Math.round(average * 100) / 100,
                    percentage: Math.round(percentage * 100) / 100,
                    assessmentCount: student.assessments.length,
                };
            });
            performanceData.sort((a, b) => b.totalScore - a.totalScore);
            const performanceTable = performanceData.map((student, index) => ({
                position: skip + index + 1,
                ...student,
            }));
            const total = await this.prisma.student.count({ where: whereConditions });
            return response_helper_1.ResponseHelper.success('Performance table retrieved successfully', {
                data: performanceTable,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            this.logger.error(`Error fetching performance table: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.ts.js.map