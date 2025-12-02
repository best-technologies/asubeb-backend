export declare class GradeEntrySchoolDto {
    id: string;
    name: string;
    code: string;
    level: string;
    isActive: boolean;
    totalClasses: number;
}
export declare class GradeEntrySchoolsDataDto {
    stateId: string;
    lgaId: string;
    total: number;
    schools: GradeEntrySchoolDto[];
}
export declare class GradeEntrySchoolsResponseDto {
    success: boolean;
    message: string;
    data: GradeEntrySchoolsDataDto;
    statusCode: number;
}
export declare class GradeEntryClassDto {
    id: string;
    name: string;
    grade: string;
    section: string;
    isActive: boolean;
    totalStudents: number;
}
export declare class GradeEntryClassesDataDto {
    stateId: string;
    schoolId: string;
    total: number;
    classes: GradeEntryClassDto[];
}
export declare class GradeEntryClassesResponseDto {
    success: boolean;
    message: string;
    data: GradeEntryClassesDataDto;
    statusCode: number;
}
export declare class GradeEntryStudentDto {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    studentId: string;
    gender: string;
    email?: string | null;
    isActive: boolean;
    hasResultForActiveTerm: boolean;
}
export declare class GradeEntryStudentsDataDto {
    currentSession?: {
        id: string;
        name: string;
        isCurrent: boolean;
    } | null;
    currentTerm?: {
        id: string;
        name: string;
        isCurrent: boolean;
    } | null;
    stateId: string;
    schoolId: string;
    classId: string;
    total: number;
    students: GradeEntryStudentDto[];
}
export declare class GradeEntryStudentsResponseDto {
    success: boolean;
    message: string;
    data: GradeEntryStudentsDataDto;
    statusCode: number;
}
export declare class GradeEntryMetadataLocalGovernmentDto {
    id: string;
    name: string;
    totalSchools: number;
}
export declare class GradeEntryMetadataDataDto {
    stateId: string;
    currentSession?: {
        id: string;
        name: string;
        isCurrent: boolean;
    } | null;
    currentTerm?: {
        id: string;
        name: string;
        isCurrent: boolean;
    } | null;
    totalLocalGovernments: number;
    localGovernments: GradeEntryMetadataLocalGovernmentDto[];
}
export declare class GradeEntryMetadataResponseDto {
    success: boolean;
    message: string;
    data: GradeEntryMetadataDataDto;
    statusCode: number;
}
