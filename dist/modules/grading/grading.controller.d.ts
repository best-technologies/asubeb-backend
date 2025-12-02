import { GradingService } from './grading.service';
export declare class GradingController {
    private readonly gradingService;
    constructor(gradingService: GradingService);
    fetchAcademicMetadataForGradeEntry(req: any): Promise<{
        stateId: string;
        currentSession: {
            name: string;
            id: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            stateId: string;
        } | null;
        currentTerm: {
            name: import(".prisma/client").$Enums.TermType;
            id: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isCurrent: boolean;
            createdAt: Date;
            updatedAt: Date;
            stateId: string;
            sessionId: string;
        } | null;
        localGovernments: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stateId: string;
            code: string;
            state: string;
            description: string | null;
        }[];
    }>;
    getStudentGrades(studentId: string, subject?: string, semester?: string): Promise<{
        studentId: string;
        grades: {
            id: string;
            studentId: string;
            subject: string;
            semester: string;
            academicYear: string;
            assignmentScore: number;
            examScore: number;
            totalScore: number;
            grade: string;
            remarks: string;
            teacherId: string;
            teacherName: string;
            createdAt: string;
            updatedAt: string;
        }[];
        summary: {
            totalSubjects: number;
            averageScore: number;
            highestGrade: number;
            lowestGrade: number;
        };
    }>;
    addStudentGrade(studentId: string, gradeData: any): Promise<any>;
    updateStudentGrade(studentId: string, gradeId: string, gradeData: any): Promise<{
        id: string;
        studentId: string;
        subject: string;
        semester: string;
        academicYear: string;
        assignmentScore: number;
        examScore: number;
        totalScore: number;
        grade: string;
        remarks: string;
        teacherId: string;
        teacherName: string;
        createdAt: string;
        updatedAt: string;
    }>;
    getClassGrades(classId: string, subject?: string): Promise<{
        classId: string;
        grades: {
            id: string;
            studentId: string;
            subject: string;
            semester: string;
            academicYear: string;
            assignmentScore: number;
            examScore: number;
            totalScore: number;
            grade: string;
            remarks: string;
            teacherId: string;
            teacherName: string;
            createdAt: string;
            updatedAt: string;
        }[];
        summary: {
            totalStudents: number;
            averageScore: number;
            gradeDistribution: {
                [key: string]: number;
            };
        };
    }>;
    addBulkGrades(classId: string, gradesData: any): Promise<{
        message: string;
        addedGrades: any;
    }>;
    getSubjects(): Promise<{
        id: string;
        name: string;
        code: string;
    }[]>;
    getGradeScales(): Promise<{
        grade: string;
        minScore: number;
        maxScore: number;
        points: number;
    }[]>;
    getClassGradeReport(classId: string): Promise<{
        classId: string;
        reportGeneratedAt: string;
        summary: {
            totalStudents: number;
            averageScore: number;
            gradeDistribution: {
                [key: string]: number;
            };
            subjectPerformance: {
                [key: string]: number;
            };
        };
        topPerformers: {
            id: string;
            studentId: string;
            subject: string;
            semester: string;
            academicYear: string;
            assignmentScore: number;
            examScore: number;
            totalScore: number;
            grade: string;
            remarks: string;
            teacherId: string;
            teacherName: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    getStudentGradeReport(studentId: string): Promise<{
        studentId: string;
        reportGeneratedAt: string;
        summary: {
            totalSubjects: number;
            averageScore: number;
            gpa: number;
            gradeDistribution: {
                [key: string]: number;
            };
        };
        subjectBreakdown: {
            subject: string;
            score: number;
            grade: string;
            remarks: string;
        }[];
    }>;
}
