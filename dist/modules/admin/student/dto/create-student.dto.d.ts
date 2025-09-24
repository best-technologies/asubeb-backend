import { Gender } from '@prisma/client';
export declare class CreateStudentDto {
    firstName: string;
    lastName: string;
    studentId: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender: Gender;
    address?: string;
    schoolId: string;
    classId: string;
    parentId?: string;
    enrollmentDate?: string;
}
