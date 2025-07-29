export declare enum SchoolLevel {
    PRIMARY = "PRIMARY",
    SECONDARY = "SECONDARY"
}
export declare class CreateSchoolDto {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    principalName?: string;
    principalPhone?: string;
    principalEmail?: string;
    establishedYear?: number;
    totalStudents?: number;
    totalTeachers?: number;
    capacity?: number;
    level: SchoolLevel;
    lgaId: string;
}
