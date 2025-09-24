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
const pdf_helper_1 = require("../../../common/helpers/pdf.helper");
const pdf_class_helper_1 = require("../../../common/helpers/pdf-class.helper");
let StudentService = StudentService_1 = class StudentService {
    prisma;
    logger = new common_1.Logger(StudentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentDashboard(filters) {
        this.logger.log(`Fetching student dashboard data with filters:`, filters);
        try {
            let currentSession = filters?.session;
            let currentTerm = filters?.term;
            if (!currentSession || !currentTerm) {
                this.logger.log('No session or term provided, fetching active session and term...');
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
                this.logger.log(`Found active session: ${activeSession.name}`);
                this.logger.log(`Available terms: ${activeSession.terms.map(t => t.name).join(', ')}`);
                currentSession = currentSession || activeSession.name;
                currentTerm = currentTerm || activeSession.terms[0]?.name;
                if (!currentTerm) {
                    const anyTerm = await this.prisma.term.findFirst({
                        where: {
                            sessionId: activeSession.id,
                        },
                        orderBy: { createdAt: 'desc' },
                    });
                    if (anyTerm) {
                        currentTerm = anyTerm.name;
                        this.logger.log(`Using fallback term: ${currentTerm}`);
                    }
                    else {
                        throw new Error('No terms found for active session');
                    }
                }
            }
            this.logger.log(`Using session: ${currentSession}, term: ${currentTerm}`);
            const lgas = await this.prisma.localGovernmentArea.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    state: true,
                },
            });
            const schools = await this.prisma.school.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    level: true,
                },
            });
            const classes = await this.prisma.class.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    grade: true,
                    section: true,
                    school: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            const subjects = await this.prisma.subject.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    level: true,
                },
            });
            const genders = await this.prisma.student.groupBy({
                by: ['gender'],
                where: { isActive: true },
                _count: {
                    gender: true,
                },
            });
            const studentWhereConditions = {
                isActive: true,
                assessments: {
                    some: {
                        term: {
                            name: currentTerm,
                            session: {
                                name: currentSession,
                            },
                        },
                    },
                },
            };
            if (filters?.schoolId) {
                studentWhereConditions.schoolId = filters.schoolId;
                this.logger.log(`Applied school filter: ${filters.schoolId}`);
            }
            if (filters?.classId) {
                studentWhereConditions.classId = filters.classId;
                this.logger.log(`Applied class filter: ${filters.classId}`);
            }
            if (filters?.gender) {
                studentWhereConditions.gender = filters.gender;
                this.logger.log(`Applied gender filter: ${filters.gender}`);
            }
            if (filters?.search) {
                studentWhereConditions.OR = [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { studentId: { contains: filters.search, mode: 'insensitive' } },
                ];
                this.logger.log(`Applied search filter: ${filters.search}`);
            }
            const students = await this.prisma.student.findMany({
                where: studentWhereConditions,
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
                                name: currentTerm,
                                session: {
                                    name: currentSession,
                                },
                            },
                            ...(filters?.subject && {
                                subject: {
                                    name: {
                                        contains: filters.subject,
                                        mode: 'insensitive',
                                    },
                                },
                            }),
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
            });
            this.logger.log(`Found ${students.length} students with filters`);
            if (students.length > 0) {
                this.logger.log(`Sample student: ${students[0].firstName} ${students[0].lastName} - Class: ${students[0].class?.name} - School: ${students[0].school?.name}`);
            }
            const performanceData = students.map(student => {
                const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
                const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
                const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
                return {
                    studentName: `${student.firstName} ${student.lastName}`,
                    examNo: student.studentId,
                    school: student.school?.name || 'N/A',
                    class: student.class?.name || 'N/A',
                    total: totalScore,
                    average: Math.round(average * 100) / 100,
                    percentage: Math.round(percentage * 100) / 100,
                    gender: student.gender,
                };
            });
            performanceData.sort((a, b) => b.total - a.total);
            const performanceTable = performanceData.map((student, index) => ({
                position: index + 1,
                ...student,
            }));
            return response_helper_1.ResponseHelper.success('Student dashboard data retrieved successfully', {
                session: currentSession,
                term: currentTerm,
                lgas,
                schools,
                classes,
                subjects,
                genders,
                performanceTable,
                lastUpdated: new Date().toISOString(),
            });
        }
        catch (error) {
            throw new Error(`Error fetching student dashboard: ${error.message}`);
        }
    }
    async getStudentResultPdf(studentId, options) {
        let session = options?.sessionId
            ? await this.prisma.session.findUnique({ where: { id: options.sessionId } })
            : await this.prisma.session.findFirst({ where: { isCurrent: true, isActive: true } });
        if (!session) {
            session = await this.prisma.session.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
        }
        let term = options?.termId
            ? await this.prisma.term.findUnique({ where: { id: options.termId } })
            : await this.prisma.term.findFirst({ where: { isCurrent: true, isActive: true, ...(session ? { sessionId: session.id } : {}) } });
        if (!term && session) {
            term = await this.prisma.term.findFirst({ where: { sessionId: session.id, isActive: true }, orderBy: { createdAt: 'desc' } });
        }
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
                gender: true,
                school: { select: { name: true } },
                class: { select: { name: true } },
                assessments: {
                    where: term && session ? { term: { id: term.id, sessionId: session.id } } : undefined,
                    select: {
                        score: true,
                        maxScore: true,
                        percentage: true,
                        type: true,
                        subject: { select: { name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${studentId} not found`);
        }
        const studentDisplayName = `${student.firstName} ${student.lastName}`.trim() || student.studentId;
        const pdf = await (0, pdf_helper_1.generateStudentResultPdf)({
            studentName: `${student.firstName} ${student.lastName}`.trim(),
            studentId: student.studentId,
            gender: student.gender,
            schoolName: student.school?.name ?? null,
            className: student.class?.name ?? null,
            sessionName: session?.name ?? 'N/A',
            termName: term?.name ?? 'N/A',
            assessments: (student.assessments || []).map(a => ({
                subjectName: a.subject.name,
                score: a.score,
                maxScore: a.maxScore,
                percentage: a.percentage,
                type: a.type,
            })),
        });
        return { pdf, filename: `asubeb - ${studentDisplayName}.pdf` };
    }
    async getClassResultsPdf(params) {
        let session = params.sessionId
            ? await this.prisma.session.findUnique({ where: { id: params.sessionId } })
            : await this.prisma.session.findFirst({ where: { isCurrent: true, isActive: true } });
        if (!session) {
            session = await this.prisma.session.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
        }
        let term = params.termId
            ? await this.prisma.term.findUnique({ where: { id: params.termId } })
            : await this.prisma.term.findFirst({ where: { isCurrent: true, isActive: true, ...(session ? { sessionId: session.id } : {}) } });
        if (!term && session) {
            term = await this.prisma.term.findFirst({ where: { sessionId: session.id, isActive: true }, orderBy: { createdAt: 'desc' } });
        }
        const students = await this.prisma.student.findMany({
            where: { isActive: true, classId: params.classId, schoolId: params.schoolId },
            select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
                school: { select: { name: true } },
                class: { select: { name: true } },
                assessments: {
                    where: term && session ? { term: { id: term.id, sessionId: session.id } } : undefined,
                    select: {
                        score: true,
                        maxScore: true,
                        subject: { select: { name: true } },
                    },
                },
            },
            orderBy: { firstName: 'asc' },
        });
        const subjectsSet = new Set();
        students.forEach(s => s.assessments.forEach(a => subjectsSet.add(a.subject.name)));
        const subjects = Array.from(subjectsSet).sort((a, b) => a.localeCompare(b));
        const rows = students.map(s => ({
            studentName: `${s.firstName} ${s.lastName}`.trim(),
            studentId: s.studentId,
            subjects: subjects.reduce((acc, subj) => {
                const hit = s.assessments.find(a => a.subject.name === subj);
                acc[subj] = hit ? { score: hit.score, maxScore: hit.maxScore } : undefined;
                return acc;
            }, {}),
        }));
        const payload = {
            schoolName: students[0]?.school?.name ?? null,
            className: students[0]?.class?.name ?? null,
            sessionName: session?.name ?? 'N/A',
            termName: term?.name ?? 'N/A',
            subjects,
            rows,
        };
        const pdf = await (0, pdf_class_helper_1.generateClassResultsPdf)(payload);
        const filename = `asubeb - ${payload.schoolName ?? 'school'} - ${payload.className ?? 'class'} - ${payload.termName}.pdf`;
        return { pdf, filename };
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
            this.logger.error(`Student with ID ${id} not found`);
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        this.logger.log(`Student with ID ${id} retrieved successfully`);
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
    async searchFilterPaginationStudents(query) {
        const { page = 1, limit = 10, search, lgaId, schoolId, classId, gender, subject, session, term, sortBy = 'firstName', sortOrder = 'asc', } = query;
        this.logger.log(`Searching students with filters: ${JSON.stringify(query)}`);
        try {
            const skip = (page - 1) * limit;
            let currentSession = session;
            let currentTerm = term;
            if (!currentSession || !currentTerm) {
                const activeSession = await this.prisma.session.findFirst({
                    where: { isCurrent: true, isActive: true },
                });
                if (!activeSession) {
                    throw new Error('No current session found');
                }
                currentSession = currentSession || activeSession.name;
                if (!currentTerm) {
                    const currentTermData = await this.prisma.term.findFirst({
                        where: {
                            sessionId: activeSession.id,
                            isCurrent: true,
                            isActive: true,
                        },
                    });
                    if (!currentTermData) {
                        throw new Error('No current term found');
                    }
                    currentTerm = currentTermData.name;
                }
            }
            const studentWhereConditions = {
                isActive: true,
            };
            if (lgaId) {
                studentWhereConditions.school = {
                    lgaId: lgaId,
                };
            }
            if (schoolId) {
                studentWhereConditions.schoolId = schoolId;
            }
            if (classId) {
                studentWhereConditions.classId = classId;
            }
            if (gender) {
                studentWhereConditions.gender = gender;
            }
            if (search) {
                studentWhereConditions.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { studentId: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ];
            }
            const total = await this.prisma.student.count({
                where: studentWhereConditions,
            });
            const students = await this.prisma.student.findMany({
                where: studentWhereConditions,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    studentId: true,
                    email: true,
                    phone: true,
                    dateOfBirth: true,
                    gender: true,
                    address: true,
                    enrollmentDate: true,
                    school: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            level: true,
                            lga: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    state: true,
                                },
                            },
                        },
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                            grade: true,
                            section: true,
                        },
                    },
                    parent: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    assessments: {
                        where: {
                            term: {
                                name: currentTerm,
                                session: {
                                    name: currentSession,
                                },
                            },
                            ...(subject && {
                                subject: {
                                    name: {
                                        contains: subject,
                                        mode: 'insensitive',
                                    },
                                },
                            }),
                        },
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
                                    name: true,
                                },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: this.getStudentOrderBy(sortBy, sortOrder),
            });
            const studentsData = students.map(student => {
                const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
                const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
                const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
                const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
                return {
                    id: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    studentId: student.studentId,
                    email: student.email,
                    phone: student.phone,
                    dateOfBirth: student.dateOfBirth,
                    gender: student.gender,
                    address: student.address,
                    enrollmentDate: student.enrollmentDate,
                    school: student.school,
                    class: student.class,
                    parent: student.parent,
                    performance: {
                        totalScore,
                        average: Math.round(average * 100) / 100,
                        percentage: Math.round(percentage * 100) / 100,
                        assessmentCount: student.assessments.length,
                        assessments: student.assessments,
                    },
                };
            });
            const filterOptions = await this.getStudentFilterOptions();
            this.logger.log(`Found ${studentsData.length} students (page ${page} of ${Math.ceil(total / limit)})`);
            return response_helper_1.ResponseHelper.success('Students retrieved successfully', {
                data: studentsData,
                lastUpdated: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logger.error(`Error searching students: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStudentExplorer(params) {
        this.logger.log(`Student explorer params: ${JSON.stringify(params)}`);
        const { sessionId, termId, lgaId, schoolId, classId, studentId, search } = params;
        const [sessions, lgas] = await Promise.all([
            this.prisma.session.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    isCurrent: true,
                    terms: {
                        where: { isActive: true },
                        orderBy: { createdAt: 'asc' },
                        select: { id: true, name: true, isCurrent: true },
                    },
                },
            }),
            this.prisma.localGovernmentArea.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, code: true, state: true },
            }),
        ]);
        let schools;
        let classes;
        let students;
        let student;
        let studentsPagination;
        let selectedSession;
        let selectedTerm;
        let selectedLga;
        let selectedSchool;
        let selectedClass;
        let selectedStudent;
        if (studentId) {
            let activeSession = await this.prisma.session.findFirst({ where: { isCurrent: true, isActive: true } });
            if (!activeSession) {
                activeSession = await this.prisma.session.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
            }
            let activeTerm = await this.prisma.term.findFirst({
                where: { isCurrent: true, isActive: true, ...(activeSession && { sessionId: activeSession.id }) },
                orderBy: { createdAt: 'desc' },
            });
            if (!activeTerm && activeSession) {
                activeTerm = await this.prisma.term.findFirst({ where: { sessionId: activeSession.id, isActive: true }, orderBy: { createdAt: 'desc' } });
            }
            student = await this.prisma.student.findUnique({
                where: { id: studentId },
                select: {
                    id: true,
                    studentId: true,
                    firstName: true,
                    lastName: true,
                    gender: true,
                    email: true,
                    school: { select: { id: true, name: true } },
                    class: { select: { id: true, name: true } },
                    assessments: {
                        where: activeTerm && activeSession ? {
                            term: {
                                id: activeTerm.id,
                                sessionId: activeSession.id,
                            },
                        } : undefined,
                        select: {
                            id: true,
                            score: true,
                            maxScore: true,
                            percentage: true,
                            type: true,
                            title: true,
                            subject: { select: { id: true, name: true, code: true } },
                            term: { select: { id: true, name: true, session: { select: { id: true, name: true } } } },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (student) {
                selectedStudent = { id: student.id, name: `${student.firstName} ${student.lastName}` };
            }
        }
        const [sessionEntity, termEntity, lgaEntity, schoolEntity, classEntity] = await Promise.all([
            sessionId ? this.prisma.session.findUnique({ where: { id: sessionId }, select: { id: true, name: true } }) : Promise.resolve(null),
            termId ? this.prisma.term.findUnique({ where: { id: termId }, select: { id: true, name: true } }) : Promise.resolve(null),
            lgaId ? this.prisma.localGovernmentArea.findUnique({ where: { id: lgaId }, select: { id: true, name: true } }) : Promise.resolve(null),
            schoolId ? this.prisma.school.findUnique({ where: { id: schoolId }, select: { id: true, name: true } }) : Promise.resolve(null),
            classId ? this.prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } }) : Promise.resolve(null),
        ]);
        if (sessionEntity)
            selectedSession = sessionEntity;
        if (termEntity)
            selectedTerm = termEntity;
        if (lgaEntity)
            selectedLga = lgaEntity;
        if (schoolEntity)
            selectedSchool = schoolEntity;
        if (classEntity)
            selectedClass = classEntity;
        if (lgaId) {
            schools = await this.prisma.school.findMany({
                where: { isActive: true, lgaId },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, code: true, level: true },
            });
        }
        if (schoolId) {
            classes = await this.prisma.class.findMany({
                where: { isActive: true },
                orderBy: [{ grade: 'asc' }, { section: 'asc' }],
                select: { id: true, name: true, grade: true, section: true },
            });
        }
        if (classId) {
            const page = params.page && params.page > 0 ? params.page : 1;
            const limit = params.limit && params.limit > 0 ? params.limit : 10;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
                classId,
                ...(schoolId ? { schoolId } : {}),
                ...(search && {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };
            let activeSession = await this.prisma.session.findFirst({ where: { isCurrent: true, isActive: true } });
            if (!activeSession) {
                activeSession = await this.prisma.session.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
            }
            let activeTerm = await this.prisma.term.findFirst({
                where: { isCurrent: true, isActive: true, ...(activeSession && { sessionId: activeSession.id }) },
                orderBy: { createdAt: 'desc' },
            });
            if (!activeTerm && activeSession) {
                activeTerm = await this.prisma.term.findFirst({ where: { sessionId: activeSession.id, isActive: true }, orderBy: { createdAt: 'desc' } });
            }
            const [list, total] = await Promise.all([
                this.prisma.student.findMany({
                    where,
                    orderBy: { firstName: 'asc' },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                        gender: true,
                        email: true,
                        school: { select: { id: true, name: true } },
                        class: { select: { id: true, name: true } },
                        assessments: {
                            where: activeTerm && activeSession ? {
                                term: { id: activeTerm.id, sessionId: activeSession.id },
                            } : undefined,
                            select: {
                                id: true,
                                score: true,
                                maxScore: true,
                                percentage: true,
                                type: true,
                                title: true,
                                subject: { select: { id: true, name: true, code: true } },
                                term: { select: { id: true, name: true } },
                            },
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                }),
                this.prisma.student.count({ where }),
            ]);
            students = list;
            studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
        }
        else if (schoolId) {
            if (search) {
                const page = params.page && params.page > 0 ? params.page : 1;
                const limit = params.limit && params.limit > 0 ? params.limit : 10;
                const skip = (page - 1) * limit;
                const where = {
                    isActive: true,
                    schoolId,
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                    ],
                };
                const [list, total] = await Promise.all([
                    this.prisma.student.findMany({
                        where,
                        orderBy: { firstName: 'asc' },
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            studentId: true,
                            gender: true,
                            email: true,
                            school: { select: { id: true, name: true } },
                            class: { select: { id: true, name: true } },
                        },
                    }),
                    this.prisma.student.count({ where }),
                ]);
                students = list;
                studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
            }
        }
        else if (lgaId) {
            if (search) {
                const page = params.page && params.page > 0 ? params.page : 1;
                const limit = params.limit && params.limit > 0 ? params.limit : 10;
                const skip = (page - 1) * limit;
                const where = {
                    isActive: true,
                    school: { lgaId },
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                    ],
                };
                const [list, total] = await Promise.all([
                    this.prisma.student.findMany({
                        where,
                        orderBy: { firstName: 'asc' },
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            studentId: true,
                            gender: true,
                            email: true,
                            school: { select: { id: true, name: true } },
                            class: { select: { id: true, name: true } },
                        },
                    }),
                    this.prisma.student.count({ where }),
                ]);
                students = list;
                studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
            }
        }
        else if (search) {
            const page = params.page && params.page > 0 ? params.page : 1;
            const limit = params.limit && params.limit > 0 ? params.limit : 10;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { school: { name: { contains: search, mode: 'insensitive' } } },
                    { school: { lga: { name: { contains: search, mode: 'insensitive' } } } },
                ],
            };
            const [list, total] = await Promise.all([
                this.prisma.student.findMany({
                    where,
                    orderBy: { firstName: 'asc' },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                        gender: true,
                        email: true,
                        school: { select: { id: true, name: true } },
                        class: { select: { id: true, name: true } },
                    },
                }),
                this.prisma.student.count({ where }),
            ]);
            students = list;
            studentsPagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
        }
        const [totalSchools, totalClasses, totalStudents] = await Promise.all([
            this.prisma.school.count({ where: { isActive: true, ...(lgaId ? { lgaId } : {}) } }),
            schoolId ? this.prisma.class.count({ where: { isActive: true } }) : Promise.resolve(undefined),
            classId ? this.prisma.student.count({ where: { isActive: true, classId, ...(schoolId ? { schoolId } : {}) } }) : Promise.resolve(undefined),
        ]);
        return response_helper_1.ResponseHelper.success('Explorer data retrieved successfully', {
            totals: {
                schools: totalSchools,
                ...(totalClasses !== undefined ? { classes: totalClasses } : {}),
                ...(totalStudents !== undefined ? { students: totalStudents } : {}),
            },
            selections: {
                session: selectedSession,
                term: selectedTerm,
                lga: selectedLga,
                school: selectedSchool,
                class: selectedClass,
                student: selectedStudent,
            },
            sessions,
            lgas,
            ...(schools && { schools }),
            ...(classes && { classes }),
            ...(students && { students }),
            ...(student && { student }),
            ...(studentsPagination && { pagination: studentsPagination }),
            lastUpdated: new Date().toISOString(),
        });
    }
    getStudentOrderBy(sortBy, sortOrder) {
        const fieldMapping = {
            firstName: 'firstName',
            lastName: 'lastName',
            studentId: 'studentId',
            email: 'email',
            gender: 'gender',
            enrollmentDate: 'enrollmentDate',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        };
        const actualField = fieldMapping[sortBy] || 'firstName';
        return { [actualField]: sortOrder };
    }
    async getStudentFilterOptions() {
        const [lgas, schools, classes, subjects, genders] = await Promise.all([
            this.prisma.localGovernmentArea.findMany({
                where: { isActive: true },
                select: { id: true, name: true, code: true, state: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.school.findMany({
                where: { isActive: true },
                select: { id: true, name: true, code: true, level: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.class.findMany({
                where: { isActive: true },
                select: { id: true, name: true, grade: true, section: true },
                orderBy: [{ grade: 'asc' }, { section: 'asc' }],
            }),
            this.prisma.subject.findMany({
                where: { isActive: true },
                select: { id: true, name: true, code: true, level: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.student.groupBy({
                by: ['gender'],
                where: { isActive: true },
                _count: { gender: true },
            }),
        ]);
        return {
            lgas,
            schools,
            classes,
            subjects,
            genders: genders.map(g => ({ gender: g.gender, count: g._count.gender })),
        };
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = StudentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.js.map