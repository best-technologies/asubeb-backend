import { Gender } from '@prisma/client';
export declare class EnrollStudentDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth: string;
    gender: Gender;
    address?: string;
    schoolId: string;
    classId: string;
}
export declare class EnrollSingleOrBulkStudentsDto {
    students: EnrollStudentDto[];
}
