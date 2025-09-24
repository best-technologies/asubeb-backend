export declare class GenderDistributionDto {
    gender: string;
    _count: {
        gender: number;
    };
}
export declare class PerformanceTableDto {
    position: number;
    studentName: string;
    examNo: string;
    school: string;
    class: string;
    total: number;
    average: number;
    percentage: number;
    gender: string;
}
export declare class StudentDashboardResponseDto {
    session: string;
    term: string;
    lgas: any[];
    schools: any[];
    classes: any[];
    subjects: any[];
    genders: GenderDistributionDto[];
    performanceTable: PerformanceTableDto[];
    lastUpdated: string;
}
