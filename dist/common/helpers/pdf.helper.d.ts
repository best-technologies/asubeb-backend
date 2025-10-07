export interface StudentAssessmentItem {
    subjectName: string;
    score: number;
    maxScore: number;
    percentage: number;
    type: string;
}
export interface StudentResultPayload {
    studentName: string;
    studentId: string;
    gender?: string | null;
    schoolName?: string | null;
    className?: string | null;
    sessionName: string;
    termName: string;
    assessments: StudentAssessmentItem[];
    studentData?: {
        student: any;
        performanceSummary: any;
        lastUpdated: string;
    };
}
export declare function generateStudentResultPdf(payload: StudentResultPayload): Promise<Buffer>;
