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
var SchoolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const helpers_1 = require("../../../common/helpers");
const colors = require("colors");
let SchoolService = SchoolService_1 = class SchoolService {
    prisma;
    logger = new common_1.Logger(SchoolService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSchool(createSchoolDto) {
        this.logger.log(colors.magenta('Creating new school...'));
        const lga = await this.prisma.localGovernmentArea.findUnique({
            where: { id: createSchoolDto.lgaId },
        });
        if (!lga) {
            throw new common_1.NotFoundException('Local Government Area not found');
        }
        const existingSchool = await this.prisma.school.findFirst({
            where: {
                name: createSchoolDto.name,
            },
        });
        if (existingSchool) {
            throw new common_1.ConflictException('School with this name already exists');
        }
        const abiaState = await this.prisma.state.findFirst({
            where: { stateId: 'ABIA' },
        });
        if (!abiaState) {
            throw new common_1.BadRequestException('Abia State not found. Please run the migration first.');
        }
        const code = await this.generateUniqueCode(createSchoolDto.name);
        const school = await this.prisma.school.create({
            data: {
                name: createSchoolDto.name,
                code: code,
                level: createSchoolDto.level,
                address: createSchoolDto.address,
                phone: createSchoolDto.phone,
                email: createSchoolDto.email,
                website: createSchoolDto.website,
                principalName: createSchoolDto.principalName,
                principalPhone: createSchoolDto.principalPhone,
                principalEmail: createSchoolDto.principalEmail,
                establishedYear: createSchoolDto.establishedYear,
                totalStudents: createSchoolDto.totalStudents || 0,
                totalTeachers: createSchoolDto.totalTeachers || 0,
                capacity: createSchoolDto.capacity,
                lgaId: createSchoolDto.lgaId,
                stateId: abiaState.id,
                isActive: true,
            },
            include: {
                lga: true,
            },
        });
        this.logger.log(colors.america('School created successfully'));
        return helpers_1.ResponseHelper.created('School created successfully', school);
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
    async updateAllSchoolsStudentCounts() {
        const schools = await this.prisma.school.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
        });
        const results = [];
        for (const school of schools) {
            await this.updateSchoolStudentCount(school.id);
            results.push({ schoolId: school.id, schoolName: school.name });
        }
        return helpers_1.ResponseHelper.success(`Updated student counts for ${results.length} schools`, results);
    }
    async getAllSchools(page = 1, limit = 10) {
        this.logger.log(colors.cyan(`Fetching schools with pagination - page: ${page}, limit: ${limit}`));
        const skip = (page - 1) * limit;
        const total = await this.prisma.school.count({
            where: { isActive: true },
        });
        const schools = await this.prisma.school.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                code: true,
                level: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                principalName: true,
                principalPhone: true,
                principalEmail: true,
                establishedYear: true,
                totalStudents: true,
                totalTeachers: true,
                capacity: true,
                lga: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        state: true,
                    },
                },
                _count: {
                    select: {
                        classes: {
                            where: { isActive: true },
                        },
                        students: {
                            where: { isActive: true },
                        },
                        teachers: {
                            where: { isActive: true },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                name: 'asc',
            },
        });
        const schoolsWithCounts = schools.map(school => ({
            id: school.id,
            name: school.name,
            code: school.code,
            level: school.level,
            address: school.address,
            phone: school.phone,
            email: school.email,
            website: school.website,
            principalName: school.principalName,
            principalPhone: school.principalPhone,
            principalEmail: school.principalEmail,
            establishedYear: school.establishedYear,
            totalStudents: school.totalStudents,
            totalTeachers: school.totalTeachers,
            capacity: school.capacity,
            lga: school.lga,
            totalClasses: school._count.classes,
            actualStudentCount: school._count.students,
            actualTeacherCount: school._count.teachers,
        }));
        this.logger.log(colors.green(`Retrieved ${schoolsWithCounts.length} schools (page ${page} of ${Math.ceil(total / limit)})`));
        return helpers_1.ResponseHelper.success('Schools retrieved successfully', {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
                nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
                startIndex: (page - 1) * limit + 1,
                endIndex: Math.min(page * limit, total),
            },
            data: schoolsWithCounts,
        });
    }
    async getAllClasses(page = 1, limit = 10) {
        this.logger.log(colors.cyan(`Fetching classes with pagination - page: ${page}, limit: ${limit}`));
        const skip = (page - 1) * limit;
        const total = await this.prisma.class.count({
            where: { isActive: true },
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
                academicYear: true,
                school: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        level: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        teacherId: true,
                        email: true,
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
            skip,
            take: limit,
            orderBy: [
                { school: { name: 'asc' } },
                { grade: 'asc' },
                { section: 'asc' },
            ],
        });
        const classesWithDetails = classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            grade: cls.grade,
            section: cls.section,
            capacity: cls.capacity,
            currentEnrollment: cls.currentEnrollment,
            actualEnrollment: cls._count.students,
            academicYear: cls.academicYear,
            school: cls.school,
            teacher: cls.teacher ? {
                id: cls.teacher.id,
                name: `${cls.teacher.firstName} ${cls.teacher.lastName}`,
                teacherId: cls.teacher.teacherId,
                email: cls.teacher.email,
            } : null,
            enrollmentPercentage: cls.capacity > 0 ? Math.round((cls._count.students / cls.capacity) * 100) : 0,
        }));
        this.logger.log(colors.green(`Retrieved ${classesWithDetails.length} classes (page ${page} of ${Math.ceil(total / limit)})`));
        return helpers_1.ResponseHelper.success('Classes retrieved successfully', {
            data: classesWithDetails,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
                nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
                startIndex: (page - 1) * limit + 1,
                endIndex: Math.min(page * limit, total),
            },
        });
    }
    async generateUniqueCode(name) {
        const firstThreeLetters = name.substring(0, 3).toUpperCase();
        let code;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;
        while (!isUnique && attempts < maxAttempts) {
            const randomDigits = Math.floor(Math.random() * 900) + 100;
            code = `${firstThreeLetters}${randomDigits}`;
            const existingCode = await this.prisma.school.findFirst({
                where: { code },
            });
            if (!existingCode) {
                isUnique = true;
            }
            else {
                attempts++;
            }
        }
        if (!isUnique) {
            throw new Error('Unable to generate unique code after maximum attempts');
        }
        return code;
    }
};
exports.SchoolService = SchoolService;
exports.SchoolService = SchoolService = SchoolService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolService);
//# sourceMappingURL=school.service.js.map