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
var BigQueryImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const helpers_1 = require("../../../common/helpers");
const bigquery_service_1 = require("./bigquery.service");
const colors = require("colors");
let BigQueryImportService = BigQueryImportService_1 = class BigQueryImportService {
    prisma;
    bigQueryService;
    logger = new common_1.Logger(BigQueryImportService_1.name);
    constructor(prisma, bigQueryService) {
        this.prisma = prisma;
        this.bigQueryService = bigQueryService;
    }
    async importFromBigQueryTable(datasetId, tableId, limit) {
        this.logger.log(colors.magenta('Starting BigQuery table import...'));
        try {
            this.logger.log(colors.cyan(`Fetching data from: ${datasetId}.${tableId}`));
            const rawData = await this.bigQueryService.getStudentDataFromTable(datasetId, tableId, limit);
            if (!rawData || rawData.length === 0) {
                return helpers_1.ResponseHelper.success('No data found in BigQuery table', { processedRows: 0 });
            }
            this.logger.log(colors.cyan(`Normalizing ${rawData.length} rows...`));
            const normalizedData = rawData.map(row => this.normalizeColumnNames(row));
            this.logger.log(colors.magenta(`Processing ${normalizedData.length} rows...`));
            const results = {
                totalRows: normalizedData.length,
                processedRows: 0,
                createdSchools: 0,
                createdLgas: 0,
                createdStudents: 0,
                createdAssessments: 0,
                errors: [],
            };
            for (let i = 0; i < normalizedData.length; i++) {
                const row = normalizedData[i];
                if (i % 100 === 0) {
                    this.logger.log(colors.yellow(`Processing row ${i + 1}/${normalizedData.length}`));
                }
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
            this.logger.log(colors.green(`BigQuery table import completed: ${results.processedRows} rows processed`));
            return helpers_1.ResponseHelper.success('BigQuery table import completed successfully', results);
        }
        catch (error) {
            this.logger.error(colors.red(`BigQuery table import error: ${error.message}`));
            throw new common_1.BadRequestException(`Error importing from BigQuery table: ${error.message}`);
        }
    }
    normalizeColumnNames(row) {
        return {
            school_name: row['School Name'] || row.school_name,
            lga: row.LGA || row.lga,
            student_name: row['Student Name'] || row.student_name,
            class: row.Class || row.class,
            gender: row.Gender || row.gender,
            english_language: row['English Language'] || row.english_language,
            mathematics: row.Mathematics || row.mathematics,
            number_work: row['Number work'] || row.number_work,
            general_norms: row['General norms'] || row.general_norms,
            letter_work: row['Letter work'] || row.letter_work,
            rhyme: row.Rhyme || row.rhyme,
            national_values: row['National values'] || row.national_values,
            prevocational: row.Prevocational || row.prevocational,
            crs: row.CRS || row.crs,
            history: row.History || row.history,
            igbo_language: row['Igbo Language'] || row.igbo_language,
            cca: row.CCA || row.cca,
            basic_science_technology: row['Basic science and technology'] || row.basic_science_technology,
            total_score: row['Total Score'] || row.total_score,
        };
    }
    async importFromBigQuery(bigQueryData) {
        this.logger.log(colors.magenta('Starting import...'));
        if (!bigQueryData || bigQueryData.length === 0) {
            throw new common_1.BadRequestException('No data provided from BigQuery');
        }
        this.logger.log(colors.cyan(`Found ${bigQueryData.length} rows`));
        const results = {
            totalRows: bigQueryData.length,
            processedRows: 0,
            createdSchools: 0,
            createdLgas: 0,
            createdStudents: 0,
            createdAssessments: 0,
            errors: [],
        };
        for (let i = 0; i < bigQueryData.length; i++) {
            const row = bigQueryData[i];
            if (i % 10 === 0) {
                this.logger.log(colors.yellow(`Processing row ${i + 1}/${bigQueryData.length}`));
            }
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
        this.logger.log(colors.green('Import completed!'));
        return helpers_1.ResponseHelper.success('BigQuery data imported successfully', results);
    }
    async processRow(row, rowNumber) {
        const schoolName = row.school_name?.toLowerCase()?.trim() || 'unknown_school';
        const lgaName = row.lga?.toLowerCase()?.trim() || 'unknown_lga';
        const studentName = row.student_name?.toLowerCase()?.trim() || 'unknown_student';
        const className = row.class?.toLowerCase()?.trim() || 'unknown_class';
        const gender = row.gender?.toLowerCase()?.trim() || 'unknown_gender';
        if (!studentName || studentName === 'unknown_student') {
            throw new Error('Student name is required and cannot be empty');
        }
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
                    isActive: true,
                }
            });
            this.logger.log(colors.green(`New LGA: ${lgaName} created`));
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
                    isActive: true,
                }
            });
            this.logger.log(colors.green(`New School: ${schoolName} created`));
        }
        const normalizedClassName = className.toLowerCase().trim();
        const academicYear = '2024-2025';
        let classRecord = await this.prisma.class.findFirst({
            where: {
                name: normalizedClassName,
            }
        });
        if (!classRecord) {
            try {
                classRecord = await this.prisma.class.create({
                    data: {
                        name: normalizedClassName,
                        grade: className,
                        section: 'A',
                        schoolId: school.id,
                        academicYear: academicYear,
                        isActive: true,
                    }
                });
                this.logger.log(colors.green(`New Class: ${normalizedClassName} created for school: ${schoolName}`));
            }
            catch (error) {
                classRecord = await this.prisma.class.findFirst({
                    where: {
                        schoolId: school.id,
                        name: normalizedClassName,
                        academicYear: academicYear
                    }
                });
                if (!classRecord) {
                    throw new Error(`Failed to create or find class: ${normalizedClassName} for school: ${schoolName}`);
                }
            }
        }
        let student = await this.prisma.student.findFirst({
            where: {
                firstName: studentName,
                schoolId: school.id,
                classId: classRecord.id
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
                    isActive: true,
                }
            });
        }
        const subjects = [
            { name: 'English Language', score: row.english_language },
            { name: 'Mathematics', score: row.mathematics },
            { name: 'Number work', score: row.number_work },
            { name: 'General norms', score: row.general_norms },
            { name: 'Letter work', score: row.letter_work },
            { name: 'Rhyme', score: row.rhyme },
            { name: 'National values', score: row.national_values },
            { name: 'Prevocational', score: row.prevocational },
            { name: 'CRS', score: row.crs },
            { name: 'History', score: row.history },
            { name: 'Igbo Language', score: row.igbo_language },
            { name: 'CCA', score: row.cca },
            { name: 'Basic science and technology', score: row.basic_science_technology },
        ];
        const termId = await this.getCurrentTermId(school.id);
        for (const subject of subjects) {
            if (subject.score !== undefined && subject.score !== null && subject.score > 0) {
                const subjectId = await this.getSubjectId(subject.name);
                await this.prisma.assessment.upsert({
                    where: {
                        studentId_subjectId_classId_termId_type_title: {
                            studentId: student.id,
                            subjectId: subjectId,
                            classId: classRecord.id,
                            termId: termId,
                            type: 'EXAM',
                            title: 'BigQuery Import Assessment',
                        }
                    },
                    update: {
                        score: subject.score,
                        percentage: 100,
                        dateGiven: new Date(),
                        isSubmitted: true,
                        isGraded: true,
                    },
                    create: {
                        studentId: student.id,
                        subjectId: subjectId,
                        classId: classRecord.id,
                        termId: termId,
                        type: 'EXAM',
                        title: 'BigQuery Import Assessment',
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
            'unknown_gender': 'OTHER',
        };
        return genderMap[gender] || 'OTHER';
    }
    async getCurrentSessionId(schoolId) {
        let session = await this.prisma.session.findFirst({
            where: {
                name: '2024/2025'
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
                }
            });
            this.logger.log(colors.green('Created default session: 2024/2025'));
        }
        return session.id;
    }
    async getCurrentTermId(schoolId) {
        const sessionId = await this.getCurrentSessionId(schoolId);
        let term = await this.prisma.term.findFirst({
            where: {
                sessionId: sessionId,
                name: 'SECOND_TERM'
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
    async getSubjectId(subjectName) {
        let subject = await this.prisma.subject.findFirst({
            where: { name: subjectName.toLowerCase() },
        });
        if (!subject) {
            subject = await this.prisma.subject.create({
                data: {
                    name: subjectName.toLowerCase(),
                    code: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    level: 'PRIMARY',
                    isActive: true,
                },
            });
        }
        return subject.id;
    }
    async testConnection() {
        return this.bigQueryService.testConnection();
    }
};
exports.BigQueryImportService = BigQueryImportService;
exports.BigQueryImportService = BigQueryImportService = BigQueryImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bigquery_service_1.BigQueryService])
], BigQueryImportService);
//# sourceMappingURL=bigquery-import.service.js.map