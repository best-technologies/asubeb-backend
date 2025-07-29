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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const response_helper_1 = require("../../../common/helpers/response.helper");
let StudentService = class StudentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllStudents(page = 1, limit = 10, schoolId) {
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
            ...(schoolId && { schoolId }),
        };
        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                skip,
                take: limit,
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
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.student.count({ where }),
        ]);
        return response_helper_1.ResponseHelper.success('Students retrieved successfully', students, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    }
    async getStudentById(id) {
        const student = await this.prisma.student.findUnique({
            where: { id },
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
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        return response_helper_1.ResponseHelper.success('Student retrieved successfully', student);
    }
    async createStudent(createStudentDto) {
        const student = await this.prisma.student.create({
            data: createStudentDto,
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
            },
        });
        await this.updateSchoolStudentCount(student.schoolId);
        return response_helper_1.ResponseHelper.created('Student created successfully', student);
    }
    async updateStudent(id, updateStudentDto) {
        const existingStudent = await this.prisma.student.findUnique({
            where: { id },
            select: { schoolId: true },
        });
        if (!existingStudent) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        const student = await this.prisma.student.update({
            where: { id },
            data: updateStudentDto,
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
            },
        });
        if (updateStudentDto.schoolId && updateStudentDto.schoolId !== existingStudent.schoolId) {
            await Promise.all([
                this.updateSchoolStudentCount(existingStudent.schoolId),
                this.updateSchoolStudentCount(updateStudentDto.schoolId),
            ]);
        }
        else {
            await this.updateSchoolStudentCount(student.schoolId);
        }
        return response_helper_1.ResponseHelper.success('Student updated successfully', student);
    }
    async deleteStudent(id) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            select: { schoolId: true },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        await this.prisma.student.update({
            where: { id },
            data: { isActive: false },
        });
        await this.updateSchoolStudentCount(student.schoolId);
        return response_helper_1.ResponseHelper.success('Student deleted successfully');
    }
    async getStudentAcademicRecord(id) {
        const student = await this.prisma.student.findUnique({
            where: { id },
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
                    include: {
                        subject: true,
                        term: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        return response_helper_1.ResponseHelper.success('Academic record retrieved successfully', student);
    }
    async getStudentAssessmentBreakdown(id) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
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
                    select: {
                        id: true,
                        score: true,
                        maxScore: true,
                        percentage: true,
                        type: true,
                        title: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        term: {
                            select: {
                                id: true,
                                name: true,
                                session: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        subject: {
                            name: 'asc',
                        },
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
        const averageScore = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
        const breakdown = {
            student: {
                id: student.id,
                studentId: student.studentId,
                name: `${student.firstName} ${student.lastName}`,
                gender: student.gender,
                school: student.school?.name,
                class: student.class?.name,
            },
            assessments: student.assessments,
            summary: {
                totalAssessments: student.assessments.length,
                totalScore,
                totalMaxScore,
                averageScore: Math.round(averageScore * 100) / 100,
                percentage: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100 * 100) / 100 : 0,
            },
        };
        return response_helper_1.ResponseHelper.success('Assessment breakdown retrieved successfully', breakdown);
    }
    async updateSchoolStudentCount(schoolId) {
        const studentCount = await this.prisma.student.count({
            where: {
                schoolId,
                isActive: true,
            },
        });
        await this.prisma.school.update({
            where: { id: schoolId },
            data: { totalStudents: studentCount },
        });
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.js.map