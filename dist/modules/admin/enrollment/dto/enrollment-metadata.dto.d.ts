export declare class EnrollmentLgaDto {
    id: string;
    name: string;
    code: string;
    state: string;
    totalSchools: number;
}
export declare class EnrollmentSchoolsDto {
    id: string;
    name: string;
    code: string;
    level: string;
    isActive: boolean;
    totalClasses: number;
}
export declare class EnrollmentClassDto {
    id: string;
    name: string;
    grade: string;
    section: string;
    isActive: boolean;
    totalStudents: number;
}
export declare class StudentEnrollmentMetadataDataDto {
    stateId: string;
    currentSession: {
        id: string;
        name: string;
        isCurrent: boolean;
    } | null;
    currentTerm: {
        id: string;
        name: string;
        isCurrent: boolean;
    } | null;
    totalLocalGovernments: number;
    localGovernments: EnrollmentLgaDto[];
}
export declare class StudentEnrollmentMetadataResponseDto {
    success: boolean;
    message: string;
    data: StudentEnrollmentMetadataDataDto;
    statusCode: number;
}
export declare class StudentEnrollmentSchoolsDataDto {
    stateId: string;
    lgaId: string;
    total: number;
    schools: EnrollmentSchoolsDto[];
}
export declare class StudentEnrollmentSchoolsResponseDto {
    success: boolean;
    message: string;
    data: StudentEnrollmentSchoolsDataDto;
    statusCode: number;
}
export declare class StudentEnrollmentClassesDataDto {
    stateId: string;
    schoolId: string;
    total: number;
    classes: EnrollmentClassDto[];
}
export declare class StudentEnrollmentClassesResponseDto {
    success: boolean;
    message: string;
    data: StudentEnrollmentClassesDataDto;
    statusCode: number;
}
export declare class EnrolledSubebOfficerUserDto {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
}
export declare class EnrollSubebOfficerResponseDto {
    success: boolean;
    message: string;
    data: EnrolledSubebOfficerUserDto;
    statusCode: number;
}
export declare class EnrollStudentsResponseDto {
    success: boolean;
    message: string;
    data: any[];
    statusCode: number;
}
