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
exports.GradingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GradingService = class GradingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        const [currentSession, currentTerm, lgas] = await this.prisma.$transaction([
            this.prisma.session.findFirst({
                where: { stateId, isCurrent: true },
            }),
            this.prisma.term.findFirst({
                where: { stateId, isCurrent: true },
            }),
            this.prisma.localGovernmentArea.findMany({
                where: { stateId, isActive: true },
                orderBy: { name: 'asc' },
            }),
        ]);
        return {
            stateId,
            currentSession,
            currentTerm,
            localGovernments: lgas,
        };
    }
    async getStudentGrades(studentId, subject, semester) {
        let filteredGrades = this.grades.filter(g => g.studentId === studentId);
        if (subject) {
            filteredGrades = filteredGrades.filter(g => g.subject === subject);
        }
        if (semester) {
            filteredGrades = filteredGrades.filter(g => g.semester === semester);
        }
        return {
            studentId,
            grades: filteredGrades,
            summary: {
                totalSubjects: filteredGrades.length,
                averageScore: filteredGrades.reduce((sum, g) => sum + g.totalScore, 0) / filteredGrades.length,
                highestGrade: Math.max(...filteredGrades.map(g => g.totalScore)),
                lowestGrade: Math.min(...filteredGrades.map(g => g.totalScore)),
            },
        };
    }
    async addStudentGrade(studentId, gradeData) {
        const newGrade = {
            id: (this.grades.length + 1).toString(),
            studentId,
            ...gradeData,
            totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
            grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.grades.push(newGrade);
        return newGrade;
    }
    async updateStudentGrade(studentId, gradeId, gradeData) {
        const gradeIndex = this.grades.findIndex(g => g.id === gradeId && g.studentId === studentId);
        if (gradeIndex === -1) {
            throw new common_1.NotFoundException(`Grade not found`);
        }
        this.grades[gradeIndex] = {
            ...this.grades[gradeIndex],
            ...gradeData,
            totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
            grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
            updatedAt: new Date().toISOString(),
        };
        return this.grades[gradeIndex];
    }
    async getClassGrades(classId, subject) {
        let filteredGrades = this.grades;
        if (subject) {
            filteredGrades = filteredGrades.filter(g => g.subject === subject);
        }
        return {
            classId,
            grades: filteredGrades,
            summary: {
                totalStudents: filteredGrades.length,
                averageScore: filteredGrades.reduce((sum, g) => sum + g.totalScore, 0) / filteredGrades.length,
                gradeDistribution: this.getGradeDistribution(filteredGrades),
            },
        };
    }
    async addBulkGrades(classId, gradesData) {
        const newGrades = gradesData.grades.map((gradeData, index) => ({
            id: (this.grades.length + index + 1).toString(),
            classId,
            ...gradeData,
            totalScore: (gradeData.assignmentScore + gradeData.examScore) / 2,
            grade: this.calculateGrade((gradeData.assignmentScore + gradeData.examScore) / 2),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        this.grades.push(...newGrades);
        return {
            message: `${newGrades.length} grades added successfully`,
            addedGrades: newGrades,
        };
    }
    async getSubjects() {
        return this.subjects;
    }
    async getGradeScales() {
        return this.gradeScales;
    }
    async getClassGradeReport(classId) {
        const classGrades = this.grades;
        return {
            classId,
            reportGeneratedAt: new Date().toISOString(),
            summary: {
                totalStudents: classGrades.length,
                averageScore: classGrades.reduce((sum, g) => sum + g.totalScore, 0) / classGrades.length,
                gradeDistribution: this.getGradeDistribution(classGrades),
                subjectPerformance: this.getSubjectPerformance(classGrades),
            },
            topPerformers: classGrades
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 5),
        };
    }
    async getStudentGradeReport(studentId) {
        const studentGrades = this.grades.filter(g => g.studentId === studentId);
        if (studentGrades.length === 0) {
            throw new common_1.NotFoundException(`No grades found for student ${studentId}`);
        }
        return {
            studentId,
            reportGeneratedAt: new Date().toISOString(),
            summary: {
                totalSubjects: studentGrades.length,
                averageScore: studentGrades.reduce((sum, g) => sum + g.totalScore, 0) / studentGrades.length,
                gpa: this.calculateGPA(studentGrades),
                gradeDistribution: this.getGradeDistribution(studentGrades),
            },
            subjectBreakdown: studentGrades.map(grade => ({
                subject: grade.subject,
                score: grade.totalScore,
                grade: grade.grade,
                remarks: grade.remarks,
            })),
        };
    }
    calculateGrade(score) {
        const gradeScale = this.gradeScales.find(gs => score >= gs.minScore && score <= gs.maxScore);
        return gradeScale ? gradeScale.grade : 'F';
    }
    getGradeDistribution(grades) {
        const distribution = {};
        this.gradeScales.forEach(gs => {
            distribution[gs.grade] = grades.filter(g => g.grade === gs.grade).length;
        });
        return distribution;
    }
    getSubjectPerformance(grades) {
        const subjectPerformance = {};
        const subjects = [...new Set(grades.map(g => g.subject))];
        subjects.forEach(subject => {
            const subjectGrades = grades.filter(g => g.subject === subject);
            subjectPerformance[subject] = subjectGrades.reduce((sum, g) => sum + g.totalScore, 0) / subjectGrades.length;
        });
        return subjectPerformance;
    }
    calculateGPA(grades) {
        const totalPoints = grades.reduce((sum, grade) => {
            const gradeScale = this.gradeScales.find(gs => gs.grade === grade.grade);
            return sum + (gradeScale ? gradeScale.points : 0);
        }, 0);
        return totalPoints / grades.length;
    }
};
exports.GradingService = GradingService;
exports.GradingService = GradingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradingService);
//# sourceMappingURL=grading.service.js.map