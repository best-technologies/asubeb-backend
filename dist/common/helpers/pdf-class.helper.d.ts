export interface ClassResultsRow {
    studentName: string;
    studentId: string;
    subjects: Record<string, {
        score: number;
        maxScore: number;
    } | undefined>;
}
export interface ClassResultsPayload {
    schoolName?: string | null;
    className?: string | null;
    sessionName: string;
    termName: string;
    subjects: string[];
    rows: ClassResultsRow[];
}
export declare function generateClassResultsPdf(payload: ClassResultsPayload): Promise<Buffer>;
