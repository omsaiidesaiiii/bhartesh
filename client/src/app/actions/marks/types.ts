import { ActionResult } from "@/lib/auth-types";

export type AssessmentType = 'IA1' | 'IA2' | 'IA3' | 'IA4';

export interface InternalMark {
    id: string;
    studentId: string;
    subjectId: string;
    marks: number;
    maxMarks: number;
    semester: number;
    assessmentType: AssessmentType;
    remarks?: string;
    subject?: {
        id: string;
        name: string;
        code: string;
        credits: number;
    };
    student?: {
        id: string;
        name: string;
        email: string;
        profile?: {
            regno?: string;
            section?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface ExternalMark {
    id: string;
    studentId: string;
    subjectId: string;
    marks: number;
    maxMarks: number;
    semester: number;
    remarks?: string;
    createdAt: string;
}

export interface StudentSubjectResult {
    subject: {
        id: string;
        name: string;
        code: string;
        credits: number;
    };
    internals: InternalMark[];
    external?: ExternalMark;
    totalMarks: number;
    totalMax: number;
    percentage: number;
    grade: string;
    gradePoint: number;
}

export interface UpsertMarkData {
    studentId: string;
    subjectId: string;
    marks: number;
    assessmentType?: AssessmentType;
    maxMarks?: number;
    semester: number;
    remarks?: string;
}

export type MarksResponse = ActionResult<InternalMark[]>;
export type MarkResponse = ActionResult<InternalMark>;
export type ResultsResponse = ActionResult<StudentSubjectResult[]>;
export type ExternalMarkResponse = ActionResult<ExternalMark>;
