import { Gender } from '@prisma/client';
export declare class SchoolInfoDto {
    id: string;
    name: string;
    code: string;
    level: string;
}
export declare class ClassInfoDto {
    id: string;
    name: string;
    grade: number;
    section: string;
}
export declare class ParentInfoDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}
export declare class AssessmentDto {
    id: string;
    score: number;
    maxScore: number;
    percentage: number;
    type: string;
    title: string;
    subject: {
        id: string;
        name: string;
        code: string;
    };
    term: {
        id: string;
        name: string;
        session: {
            id: string;
            name: string;
        };
    };
}
export declare class StudentResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender: Gender;
    address?: string;
    enrollmentDate?: string;
    school: SchoolInfoDto;
    class: ClassInfoDto;
    parent?: ParentInfoDto;
    assessments?: AssessmentDto[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class StudentPerformanceDto {
    id: string;
    studentName: string;
    studentId: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: Gender;
    address: string;
    enrollmentDate: string;
    school: SchoolInfoDto;
    class: ClassInfoDto;
    parent?: ParentInfoDto;
    performance: {
        totalScore: number;
        average: number;
        percentage: number;
        assessmentCount: number;
        assessments: AssessmentDto[];
    };
}
export declare class PaginationDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class StudentListResponseDto {
    data: StudentPerformanceDto[];
    pagination: PaginationDto;
    lastUpdated: string;
}
