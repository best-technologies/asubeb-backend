export declare class SubjectScoreDto {
    subjectId: string;
    score: number;
}
export declare class StudentResultDto {
    studentId: string;
    subjects: SubjectScoreDto[];
}
export declare class UploadResultsDto {
    sessionId: string;
    termId: string;
    lgaId: string;
    schoolId: string;
    classId: string;
    students: StudentResultDto[];
}
export declare class FailedStudentResultDto {
    studentId: string;
    error: string;
    studentName?: string;
}
export declare class SuccessfulStudentResultDto {
    studentId: string;
    assessmentsCount: number;
    studentName: string;
}
export declare class UploadResultsDataDto {
    total: number;
    successful: number;
    failed: number;
    successfulStudents: SuccessfulStudentResultDto[];
    failedStudents: FailedStudentResultDto[];
}
export declare class UploadResultsResponseDto {
    success: boolean;
    message: string;
    data: UploadResultsDataDto;
    statusCode: number;
}
