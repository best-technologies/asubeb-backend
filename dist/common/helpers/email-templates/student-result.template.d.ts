export interface StudentResultEmailItem {
    subjectName: string;
    score: number;
    maxScore: number;
    percentage: number;
    type: string;
}
export interface StudentResultEmailPayload {
    studentName: string;
    studentId: string;
    gender?: string | null;
    schoolName?: string | null;
    className?: string | null;
    sessionName: string;
    termName: string;
    assessments: StudentResultEmailItem[];
}
export declare const studentResultEmailTemplate: (payload: StudentResultEmailPayload) => string;
