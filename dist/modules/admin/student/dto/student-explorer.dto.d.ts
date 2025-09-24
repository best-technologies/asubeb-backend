export declare class SelectionDto {
    id: string;
    name: string;
}
export declare class TermDto {
    id: string;
    name: string;
    isCurrent: boolean;
}
export declare class SessionDto {
    id: string;
    name: string;
    isCurrent: boolean;
    terms: TermDto[];
}
export declare class LgaDto {
    id: string;
    name: string;
    code: string;
    state: string;
}
export declare class SchoolDto {
    id: string;
    name: string;
    code: string;
    level: string;
}
export declare class ClassDto {
    id: string;
    name: string;
    grade: number;
    section: string;
}
export declare class StudentDto {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    gender: string;
    email: string;
    school: {
        id: string;
        name: string;
    };
    class: {
        id: string;
        name: string;
    };
    assessments?: any[];
}
export declare class TotalsDto {
    schools: number;
    classes?: number;
    students?: number;
}
export declare class StudentExplorerResponseDto {
    selections: {
        session?: SelectionDto;
        term?: SelectionDto;
        lga?: SelectionDto;
        school?: SelectionDto;
        class?: SelectionDto;
        student?: SelectionDto;
    };
    sessions: SessionDto[];
    lgas: LgaDto[];
    schools?: SchoolDto[];
    classes?: ClassDto[];
    students?: StudentDto[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    totals: TotalsDto;
    lastUpdated: string;
}
