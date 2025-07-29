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
            const currentSession = await this.prisma.session.findFirst({
                where: { name: session, isCurrent: true },
            });
            const currentTerm = await this.prisma.term.findFirst({
                where: {
                    sessionId: currentSession?.id,
                    name: term,
                    isCurrent: true
                },
            });
            if (!currentSession || !currentTerm) {
                this.logger.warn(`Session ${session} or term ${term} not found`);
                throw new Error('Invalid session or term');
            }
            const totalStudents = await this.prisma.student.count({
                where: { isActive: true },
            });
            const schools = await this.prisma.school.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    level: true,
                    totalStudents: true,
                    totalTeachers: true,
                },
            });
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
                    currentEnrollment: true,
                    school: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            const genderStats = await this.prisma.student.groupBy({
                by: ['gender'],
                where: { isActive: true },
                _count: {
                    gender: true,
                },
            });
            const totalMale = genderStats.find(g => g.gender === 'MALE')?._count.gender || 0;
            const totalFemale = genderStats.find(g => g.gender === 'FEMALE')?._count.gender || 0;
            const subjects = await this.prisma.subject.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    level: true,
                },
            });
            const studentsWithScores = await this.prisma.student.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    studentId: true,
                    firstName: true,
                    lastName: true,
                    gender: true,
                    class: {
                        select: {
                            name: true,
                            school: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    assessments: {
                        where: {
                            termId: currentTerm.id,
                        },
                        select: {
                            score: true,
                            termId: true,
                        },
                    },
                },
                orderBy: {
                    firstName: 'asc',
                },
            });
            let studentsWithTotalScores = studentsWithScores
                .map(student => {
                const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                return {
                    ...student,
                    totalScore,
                };
            })
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 10);
            if (studentsWithTotalScores.every(s => s.totalScore === 0)) {
                this.logger.log('No assessments found for current term, trying all assessments...');
                const studentsWithAllAssessments = await this.prisma.student.findMany({
                    where: { isActive: true },
                    select: {
                        id: true,
                        studentId: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        class: {
                            select: {
                                name: true,
                                school: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        assessments: {
                            select: {
                                score: true,
                                termId: true,
                            },
                        },
                    },
                    orderBy: {
                        firstName: 'asc',
                    },
                });
                this.logger.log(`Total assessments found (all terms): ${studentsWithAllAssessments.reduce((sum, s) => sum + s.assessments.length, 0)}`);
                studentsWithTotalScores = studentsWithAllAssessments
                    .map(student => {
                    const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                    return {
                        ...student,
                        totalScore,
                    };
                })
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .slice(0, 10);
            }
            const topStudentsWithDetails = studentsWithTotalScores.map((student, index) => ({
                id: student.id,
                position: index + 1,
                studentName: `${student.firstName} ${student.lastName}`,
                examNumber: student.studentId,
                school: student.class?.school?.name,
                class: student.class?.name,
                gender: student.gender,
                totalScore: student.totalScore,
            }));
            this.logger.log(`Successfully fetched admin dashboard data. Total students: ${totalStudents}`);
            return response_helper_1.ResponseHelper.success("Admin Dashboard Data retrieved successfully", {
                session: currentSession.name,
                term: currentTerm.name,
                totalStudents,
                totalMale,
                totalFemale,
                schools,
                lgas,
                classes,
                genders: genderStats,
                subjects,
                topStudents: topStudentsWithDetails,
                lastUpdated: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logger.error(`Error fetching admin dashboard data: ${error.message}`, error.stack);
            throw error;
        }
    }
    async fetchDashboardPerformanceTable(session, term, page = 1, limit = 10, search, schoolId, classId, gender) {
        this.logger.log(`Fetching performance table with filters - page: ${page}, limit: ${limit}, search: ${search}`);
        try {
            const currentSession = await this.prisma.session.findFirst({
                where: { name: session, isCurrent: true },
            });
            const currentTerm = await this.prisma.term.findFirst({
                where: {
                    sessionId: currentSession?.id,
                    name: term,
                    isCurrent: true
                },
            });
            if (!currentSession || !currentTerm) {
                this.logger.warn(`Session ${session} or term ${term} not found`);
                throw new Error('Invalid session or term');
            }
            const whereConditions = {
                termId: currentTerm.id,
                student: { isActive: true },
            };
            if (schoolId) {
                whereConditions.student = {
                    ...whereConditions.student,
                    schoolId,
                };
            }
            if (classId) {
                whereConditions.student = {
                    ...whereConditions.student,
                    classId,
                };
            }
            if (gender) {
                whereConditions.student = {
                    ...whereConditions.student,
                    gender: gender,
                };
            }
            const studentScores = await this.prisma.assessment.groupBy({
                by: ['studentId'],
                where: whereConditions,
                _sum: {
                    score: true,
                },
                orderBy: {
                    _sum: {
                        score: 'desc',
                    },
                },
            });
            let filteredStudents = studentScores;
            if (search) {
                const matchingStudents = await this.prisma.student.findMany({
                    where: {
                        isActive: true,
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { studentId: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                    select: { id: true },
                });
                const matchingStudentIds = matchingStudents.map(s => s.id);
                filteredStudents = studentScores.filter(s => matchingStudentIds.includes(s.studentId));
            }
            const total = filteredStudents.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            const paginatedStudents = filteredStudents.slice(skip, skip + limit);
            const performanceData = await Promise.all(paginatedStudents.map(async (student, index) => {
                const studentDetails = await this.prisma.student.findUnique({
                    where: { id: student.studentId },
                    select: {
                        id: true,
                        studentId: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        class: {
                            select: {
                                name: true,
                                school: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return {
                    id: studentDetails?.id,
                    position: skip + index + 1,
                    studentName: `${studentDetails?.firstName} ${studentDetails?.lastName}`,
                    examNumber: studentDetails?.studentId,
                    school: studentDetails?.class?.school?.name,
                    class: studentDetails?.class?.name,
                    gender: studentDetails?.gender,
                    totalScored: student._sum.score || 0,
                };
            }));
            this.logger.log(`Successfully fetched performance table. Total records: ${total}, Page: ${page}`);
            return {
                data: performanceData,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                filters: {
                    search,
                    schoolId,
                    classId,
                    gender,
                },
            };
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
//# sourceMappingURL=dashboard.service.js.map