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
var EnrollmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const response_helper_1 = require("../../../common/helpers/response.helper");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const colors = require("colors");
const send_mail_1 = require("../../../common/mailer/send-mail");
const academic_context_service_1 = require("../../academic/academic-context.service");
let EnrollmentService = EnrollmentService_1 = class EnrollmentService {
    prisma;
    academicContext;
    logger = new common_1.Logger(EnrollmentService_1.name);
    constructor(prisma, academicContext) {
        this.prisma = prisma;
        this.academicContext = academicContext;
    }
    async healthCheck() {
        this.logger.log(colors.green('EnrollmentService is up'));
        return { ok: true };
    }
    async getStudentEnrollmentMetadata(user) {
        if (!user?.stateId) {
            throw new common_1.BadRequestException('User state not found');
        }
        const stateId = user.stateId;
        this.logger.log(colors.magenta(`Fetching student enrollment metadata for state ${stateId} (user: ${user.id ?? 'unknown'})`));
        const [{ currentSession, currentTerm }, lgas] = await Promise.all([
            this.academicContext.getCurrentSessionAndTerm(stateId),
            this.academicContext.getLgasWithSchoolCounts(stateId),
        ]);
        this.logger.log(colors.green(`Student enrollment metadata fetched for state ${stateId}: ${lgas.length} LGAs, session=${currentSession?.name ?? 'none'}, term=${currentTerm?.name ?? 'none'}`));
        return response_helper_1.ResponseHelper.success('Student enrollment metadata retrieved successfully', {
            stateId,
            currentSession,
            currentTerm,
            totalLocalGovernments: lgas.length,
            localGovernments: lgas,
        });
    }
    async getSchoolsForStudentEnrollment(user, lgaId) {
        if (!user?.stateId) {
            throw new common_1.BadRequestException('User state not found');
        }
        const stateId = user.stateId;
        this.logger.log(colors.magenta(`Fetching schools for student enrollment for state ${stateId}, LGA ${lgaId} (user: ${user.id ?? 'unknown'})`));
        const schools = await this.academicContext.getSchoolsWithClassCounts(stateId, lgaId);
        this.logger.log(colors.green(`Retrieved ${schools.length} schools for student enrollment (state ${stateId}, LGA ${lgaId})`));
        return response_helper_1.ResponseHelper.success('Schools for student enrollment retrieved successfully', {
            stateId,
            lgaId,
            total: schools.length,
            schools,
        });
    }
    async getClassesForStudentEnrollment(user, schoolId) {
        if (!user?.stateId) {
            throw new common_1.BadRequestException('User state not found');
        }
        const stateId = user.stateId;
        this.logger.log(colors.magenta(`Fetching classes for student enrollment for state ${stateId}, school ${schoolId} (user: ${user.id ?? 'unknown'})`));
        const classes = await this.academicContext.getClassesWithStudentCounts(stateId, schoolId);
        this.logger.log(colors.green(`Retrieved ${classes.length} classes for student enrollment (state ${stateId}, school ${schoolId})`));
        return response_helper_1.ResponseHelper.success('Classes for student enrollment retrieved successfully', {
            stateId,
            schoolId,
            total: classes.length,
            classes,
        });
    }
    async enrollNewSubebOfficer(dto, user) {
        if (!user?.id) {
            throw new common_1.UnauthorizedException('User ID not found in request. Please ensure JWT authentication is working correctly.');
        }
        const enrolledByUserId = user.id;
        this.logger.log(colors.yellow(`Enrolling SUBEB officer ${dto.email} from EnrollmentModule by ${enrolledByUserId}`));
        try {
            const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (existing) {
                this.logger.warn(`Attempt to enroll SUBEB officer with existing email: ${dto.email}`);
                throw new common_1.ConflictException('User already exists');
            }
            const enrollingUser = await this.prisma.user.findUnique({
                where: { id: enrolledByUserId },
                select: { stateId: true },
            });
            if (!enrollingUser?.stateId) {
                this.logger.warn('Enrolling user has no stateId. stateId is required.');
                throw new common_1.BadRequestException('Enrolling user must be associated with a state to enroll a SUBEB officer');
            }
            const stateId = enrollingUser.stateId;
            const tempPassword = Math.random().toString(36).slice(-10);
            const hashed = await bcrypt.hash(tempPassword, 10);
            const randomDigits = Math.floor(Math.random() * 90000) + 10000;
            const officerId = `OFF${randomDigits}`;
            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: dto.email,
                        username: dto.email,
                        password: hashed,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        role: client_1.UserRole.SUBEB_OFFICER,
                        stateId,
                    },
                });
                await tx.subebOfficer.create({
                    data: {
                        userId: user.id,
                        officerId,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: dto.email,
                        phone: dto.phone,
                        address: dto.address || "",
                        designation: dto.designation || "",
                        stateId,
                        enrolledBy: enrolledByUserId,
                    },
                });
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            });
            this.logger.log(colors.blue(`Sending welcome email to ${result.email}`));
            try {
                const emailPromise = (0, send_mail_1.sendSubebOfficerWelcomeEmail)(result.email, {
                    firstName: result.firstName ?? '',
                    lastName: result.lastName ?? '',
                    email: result.email,
                    password: tempPassword,
                });
                const emailTimeout = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Email sending timeout after 90 seconds. Please check SMTP configuration and network connectivity.'));
                    }, 90000);
                });
                await Promise.race([emailPromise, emailTimeout]);
                this.logger.log(colors.green(`Welcome email sent successfully to SUBEB officer ${result.email}`));
            }
            catch (emailError) {
                this.logger.error(colors.red(`Failed to send welcome email to ${result.email}: ${emailError?.message ?? emailError}`));
                this.logger.error(`Email error details: ${JSON.stringify({
                    code: emailError?.code,
                    command: emailError?.command,
                    response: emailError?.response,
                    responseCode: emailError?.responseCode,
                }, null, 2)}`);
                throw new common_1.InternalServerErrorException(`Failed to send welcome email. Enrollment aborted because credentials could not be delivered. ` +
                    `Error: ${emailError?.message || 'Unknown error'}. ` +
                    `Please check SMTP configuration and try again.`);
            }
            this.logger.log(`Created SUBEB officer ${result.email} (${result.id}) via EnrollmentModule`);
            return response_helper_1.ResponseHelper.created('SUBEB officer registered', result);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to register SUBEB officer ${dto.email} via EnrollmentModule: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to register SUBEB officer');
        }
    }
    async enrollSingleStudentInternal(dto, user, serialInClass, schoolCode, stateName) {
        if (!user?.id) {
            throw new common_1.UnauthorizedException('User ID not found in request. Please ensure JWT authentication is working correctly.');
        }
        if (!user?.stateId) {
            throw new common_1.BadRequestException('Enrolling user must be associated with a state to enroll a student');
        }
        const stateId = user.stateId;
        const studentLabel = dto.email ?? `${dto.firstName} ${dto.lastName}`;
        try {
            const targetClass = await this.prisma.class.findFirst({
                where: {
                    id: dto.classId,
                    schoolId: dto.schoolId,
                    school: {
                        stateId,
                    },
                },
                select: {
                    id: true,
                    schoolId: true,
                },
            });
            if (!targetClass) {
                throw new common_1.BadRequestException('Class does not belong to the specified school or state');
            }
            if (dto.email) {
                const existingByEmail = await this.prisma.student.findUnique({
                    where: { email: dto.email },
                });
                if (existingByEmail) {
                    throw new common_1.ConflictException('A student with this email already exists');
                }
            }
            const now = new Date();
            const yearSuffix = now.getFullYear().toString().slice(-2);
            const monthPart = (now.getMonth() + 1).toString().padStart(2, '0');
            const serialPart = serialInClass.toString().padStart(2, '0');
            const normalize = (value) => (value || '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');
            const first = normalize(dto.firstName);
            const last = normalize(dto.lastName);
            const code = normalize(schoolCode);
            const stateSlug = normalize(stateName);
            const localPart = `${first}.${last}.${code}.${yearSuffix}${monthPart}${serialPart}`;
            const emailGenerated = `${localPart}@${stateSlug}subeb.edu.ng`;
            const studentId = `STU${yearSuffix}${monthPart}${serialPart}${code.toUpperCase()}`;
            const existingEmailOwner = await this.prisma.student.findUnique({
                where: { email: emailGenerated },
            });
            const finalEmail = existingEmailOwner || !emailGenerated ? dto.email ?? null : emailGenerated;
            if (!finalEmail) {
                throw new common_1.BadRequestException('Unable to generate a unique email address for the student. Please provide a unique email.');
            }
            const existingUserWithEmail = await this.prisma.user.findUnique({
                where: { email: finalEmail },
            });
            if (existingUserWithEmail) {
                throw new common_1.ConflictException('A user with this email already exists');
            }
            const tempPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            const result = await this.prisma.$transaction(async (tx) => {
                const userRecord = await tx.user.create({
                    data: {
                        email: finalEmail,
                        username: studentId,
                        password: hashedPassword,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        role: client_1.UserRole.STUDENT,
                        stateId,
                    },
                });
                const student = await tx.student.create({
                    data: {
                        studentId: studentId,
                        userId: userRecord.id,
                        schoolId: dto.schoolId,
                        classId: dto.classId,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: finalEmail,
                        phone: dto.phone ?? null,
                        dateOfBirth: new Date(dto.dateOfBirth),
                        gender: dto.gender,
                        address: dto.address ?? null,
                        stateId,
                    },
                });
                await tx.school.update({
                    where: { id: dto.schoolId },
                    data: {
                        totalStudents: {
                            increment: 1,
                        },
                    },
                });
                return {
                    ...student,
                    user: {
                        id: userRecord.id,
                        email: userRecord.email,
                        role: userRecord.role,
                        username: userRecord.username,
                    },
                    tempPassword,
                };
            });
            this.logger.log(colors.green(`Enrolled student ${result.studentId} (${result.id}) via EnrollmentModule into class ${dto.classId}`));
            return result;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to enroll student ${dto.email ?? dto.firstName + ' ' + dto.lastName}: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to enroll student');
        }
    }
    async enrollSingleOrBulkStudents(payload, user) {
        this.logger.log(colors.cyan(`Incoming enrollSingleOrBulkStudents payload: ${JSON.stringify(payload, null, 2)}`));
        if (!payload?.students || payload.students.length === 0) {
            this.logger.error('No students provided in the payload');
            return response_helper_1.ResponseHelper.error('No students provided in the payload');
        }
        this.logger.log(colors.yellow(`Enrolling New student(s) total ${payload.students.length}`));
        if (!user?.id) {
            this.logger.error('User ID not found in request. Please ensure JWT authentication is working correctly.');
            return response_helper_1.ResponseHelper.error('User ID not found in request');
        }
        if (!user?.stateId) {
            this.logger.error('Enrolling user must be associated with a state to enroll students');
            return response_helper_1.ResponseHelper.error('Enrolling user must be associated with a state to enroll students');
        }
        const stateId = user.stateId;
        const [first] = payload.students;
        const schoolId = first.schoolId;
        const classId = first.classId;
        const inconsistentTarget = payload.students.some((s) => s.schoolId !== schoolId || s.classId !== classId);
        if (inconsistentTarget) {
            this.logger.error('All students must target the same schoolId and classId');
            return response_helper_1.ResponseHelper.error('All students must target the same schoolId and classId');
        }
        this.logger.log(colors.yellow(`Enrolling New student(s) total ${payload.students.length}`));
        const school = await this.prisma.school.findFirst({
            where: {
                id: schoolId,
                stateId,
            },
            select: {
                id: true,
                code: true,
                stateRef: {
                    select: {
                        stateName: true,
                    },
                },
            },
        });
        if (!school) {
            this.logger.error('School does not belong to the current user state');
            return response_helper_1.ResponseHelper.error('School does not belong to the current user state');
        }
        const targetClass = await this.prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
                school: {
                    stateId,
                },
            },
            select: {
                id: true,
                schoolId: true,
            },
        });
        if (!targetClass) {
            this.logger.error('Class does not belong to the specified school or state');
            return response_helper_1.ResponseHelper.error('Class does not belong to the specified school or state');
        }
        const existingCount = await this.prisma.student.count({
            where: { classId },
        });
        const schoolCode = school.code;
        const stateName = school.stateRef.stateName;
        const createdStudents = [];
        for (let i = 0; i < payload.students.length; i++) {
            const dto = payload.students[i];
            const serialInClass = existingCount + i + 1;
            const student = await this.enrollSingleStudentInternal(dto, user, serialInClass, schoolCode, stateName);
            createdStudents.push(student);
        }
        this.logger.log(colors.green(`Successfully enrolled New student(s) total ${createdStudents.length}`));
        return response_helper_1.ResponseHelper.created('New student(s) enrolled successfully', createdStudents);
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = EnrollmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        academic_context_service_1.AcademicContextService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map