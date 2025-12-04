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
var ExcelUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelUploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const helpers_1 = require("../../../common/helpers");
const XLSX = require("xlsx");
const colors = require("colors");
let ExcelUploadService = ExcelUploadService_1 = class ExcelUploadService {
    prisma;
    logger = new common_1.Logger(ExcelUploadService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadExcelFile(file) {
        this.logger.log(colors.magenta('Processing Excel file upload...'));
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            throw new common_1.BadRequestException('Only Excel files are allowed');
        }
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            if (jsonData.length === 0) {
                throw new common_1.BadRequestException('Excel file is empty');
            }
            this.logger.log(colors.cyan(`Found ${jsonData.length} rows in Excel file`));
            const results = {
                totalRows: jsonData.length,
                processedRows: 0,
                createdSchools: 0,
                createdLgas: 0,
                createdStudents: 0,
                createdAssessments: 0,
                errors: [],
            };
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                try {
                    const assessmentCount = await this.processRow(row, i + 1);
                    results.processedRows++;
                    results.createdAssessments += assessmentCount;
                }
                catch (error) {
                    const errorMsg = `Row ${i + 1}: ${error.message}`;
                    results.errors.push(errorMsg);
                    this.logger.error(colors.red(errorMsg));
                }
            }
            this.logger.log(colors.america('Excel file processing completed'));
            return helpers_1.ResponseHelper.success('Excel file processed successfully', results);
        }
        catch (error) {
            this.logger.error(colors.red(`Excel processing error: ${error.message}`));
            throw new common_1.BadRequestException(`Error processing Excel file: ${error.message}`);
        }
    }
    async processRow(row, rowNumber) {
        const schoolName = row['School Name']?.toLowerCase()?.trim();
        const lgaName = row['LGA']?.toLowerCase()?.trim();
        const studentName = row['Student Name']?.toLowerCase()?.trim();
        const className = row['Class']?.toLowerCase()?.trim();
        const gender = row['Gender']?.toLowerCase()?.trim();
        if (!schoolName || !lgaName || !studentName || !className || !gender) {
            throw new Error('Missing required fields (School Name, LGA, Student Name, Class, Gender)');
        }
        const abiaState = await this.prisma.state.findFirst({
            where: { stateId: 'ABIA' },
        });
        if (!abiaState) {
            throw new Error('Abia State not found. Please run the migration first.');
        }
        const stateId = abiaState.id;
        let lga = await this.prisma.localGovernmentArea.findFirst({
            where: { name: lgaName }
        });
        if (!lga) {
            const lgaCode = await this.generateUniqueLgaCode(lgaName);
            lga = await this.prisma.localGovernmentArea.create({
                data: {
                    name: lgaName,
                    code: lgaCode,
                    state: 'abia',
                    stateId: stateId,
                    isActive: true,
                }
            });
            this.logger.log(colors.green(`Created new LGA: ${lgaName}`));
        }
        let school = await this.prisma.school.findFirst({
            where: { name: schoolName }
        });
        if (!school) {
            const schoolCode = await this.generateUniqueSchoolCode(schoolName);
            school = await this.prisma.school.create({
                data: {
                    name: schoolName,
                    code: schoolCode,
                    level: 'PRIMARY',
                    address: `${lgaName}, Abia State`,
                    lgaId: lga.id,
                    stateId: stateId,
                    isActive: true,
                }
            });
            this.logger.log(colors.green(`Created new School: ${schoolName}`));
        }
        let classRecord = await this.prisma.class.findFirst({
            where: {
                name: className.toLowerCase(),
                schoolId: school.id
            }
        });
        if (!classRecord) {
            classRecord = await this.prisma.class.create({
                data: {
                    name: className.toLowerCase(),
                    grade: className,
                    section: 'A',
                    schoolId: school.id,
                    academicYear: '2024-2025',
                    isActive: true,
                }
            });
            this.logger.log(colors.green(`Created new Class: ${className}`));
        }
        let student = await this.prisma.student.findFirst({
            where: {
                firstName: studentName,
                schoolId: school.id
            }
        });
        if (!student) {
            const uniqueStudentId = await this.generateUniqueStudentId();
            student = await this.prisma.student.create({
                data: {
                    firstName: studentName,
                    lastName: '',
                    studentId: uniqueStudentId,
                    gender: this.mapGender(gender),
                    schoolId: school.id,
                    classId: classRecord.id,
                    dateOfBirth: new Date(),
                    stateId: stateId,
                    isActive: true,
                }
            });
            this.logger.log(colors.green(`Created new Student: ${studentName}`));
        }
        const subjects = [
            { name: 'English Language', score: row['English Language'] },
            { name: 'Mathematics', score: row['Mathematics'] },
            { name: 'Number work', score: row['Number work'] },
            { name: 'General norms', score: row['General norms'] },
            { name: 'Letter work', score: row['Letter work'] },
            { name: 'Rhyme', score: row['Rhyme'] },
            { name: 'National values', score: row['National values'] },
            { name: 'Prevocational', score: row['Prevocational'] },
            { name: 'CRS', score: row['CRS'] },
            { name: 'History', score: row['History'] },
            { name: 'Igbo Language', score: row['Igbo Language'] },
            { name: 'CCA', score: row['CCA'] },
            { name: 'Basic science and technology', score: row['Basic science and technology'] },
        ];
        const termId = await this.getCurrentTermId(school.id, stateId);
        for (const subject of subjects) {
            if (subject.score !== undefined && subject.score !== null && subject.score > 0) {
                const subjectId = await this.getSubjectId(subject.name, stateId);
                await this.prisma.assessment.create({
                    data: {
                        studentId: student.id,
                        subjectId: subjectId,
                        classId: classRecord.id,
                        termId: termId,
                        type: 'EXAM',
                        title: 'Excel Upload Assessment',
                        maxScore: 100,
                        score: subject.score,
                        percentage: 100,
                        dateGiven: new Date(),
                        isSubmitted: true,
                        isGraded: true,
                    }
                });
            }
        }
        this.logger.log(colors.green(`Created Assessments for ${studentName}`));
        return subjects.filter(subject => subject.score !== undefined && subject.score !== null && subject.score > 0).length;
    }
    async generateUniqueLgaCode(name) {
        const firstThreeLetters = name.substring(0, 3).toUpperCase();
        let code;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;
        while (!isUnique && attempts < maxAttempts) {
            const randomDigits = Math.floor(Math.random() * 900) + 100;
            code = `${firstThreeLetters}${randomDigits}`;
            const existingCode = await this.prisma.localGovernmentArea.findFirst({
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
            throw new Error('Unable to generate unique LGA code');
        }
        return code;
    }
    async generateUniqueSchoolCode(name) {
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
            throw new Error('Unable to generate unique school code');
        }
        return code;
    }
    mapGender(gender) {
        const genderMap = {
            'male': 'MALE',
            'female': 'FEMALE',
            'm': 'MALE',
            'f': 'FEMALE',
            'boy': 'MALE',
            'girl': 'FEMALE',
        };
        return genderMap[gender] || 'OTHER';
    }
    async getCurrentSessionId(schoolId, stateId) {
        let session = await this.prisma.session.findFirst({
            where: {
                name: '2024/2025',
                stateId: stateId
            }
        });
        if (!session) {
            session = await this.prisma.session.create({
                data: {
                    name: '2024/2025',
                    startDate: new Date('2024-09-01'),
                    endDate: new Date('2025-07-31'),
                    isActive: true,
                    isCurrent: true,
                    stateId: stateId,
                }
            });
            this.logger.log(colors.green('Created default session: 2024/2025'));
        }
        return session.id;
    }
    async getCurrentTermId(schoolId, stateId) {
        const sessionId = await this.getCurrentSessionId(schoolId, stateId);
        let term = await this.prisma.term.findFirst({
            where: {
                sessionId: sessionId,
                name: 'SECOND_TERM',
                stateId: stateId
            }
        });
        if (!term) {
            term = await this.prisma.term.create({
                data: {
                    sessionId: sessionId,
                    name: 'SECOND_TERM',
                    startDate: new Date('2025-01-01'),
                    endDate: new Date('2025-04-30'),
                    isActive: true,
                    isCurrent: true,
                    stateId: stateId,
                }
            });
            this.logger.log(colors.green('Created default term: SECOND_TERM'));
        }
        return term.id;
    }
    async generateUniqueStudentId() {
        let studentId;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 20;
        while (!isUnique && attempts < maxAttempts) {
            const randomDigits = Math.floor(Math.random() * 90000) + 10000;
            studentId = `STU${randomDigits}`;
            const existingStudent = await this.prisma.student.findFirst({
                where: { studentId },
            });
            if (!existingStudent) {
                isUnique = true;
            }
            else {
                attempts++;
            }
        }
        if (!isUnique) {
            throw new Error('Unable to generate unique student ID');
        }
        return studentId;
    }
    async getSubjectId(subjectName, stateId) {
        let subject = await this.prisma.subject.findFirst({
            where: {
                name: subjectName.toLowerCase(),
                stateId: stateId,
                level: 'PRIMARY',
            },
        });
        if (!subject) {
            subject = await this.prisma.subject.create({
                data: {
                    name: subjectName.toLowerCase(),
                    code: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    level: 'PRIMARY',
                    isActive: true,
                    stateId: stateId,
                },
            });
        }
        return subject.id;
    }
};
exports.ExcelUploadService = ExcelUploadService;
exports.ExcelUploadService = ExcelUploadService = ExcelUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExcelUploadService);
//# sourceMappingURL=excel-upload.service.js.map