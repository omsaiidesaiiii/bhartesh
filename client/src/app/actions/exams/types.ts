export type ExamType = 'FINAL' | 'INTERNAL' | 'PRACTICAL';
export type ExamStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Exam {
    id: string;
    name: string;
    code: string;
    type: ExamType;
    status: ExamStatus;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    description?: string;
    isResultPublished: boolean;
    resultsPublishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExamStats {
    upcomingExams: number;
    resultsPending: number;
    publishedResults: number;
    avgPerformance: number;
}

export interface ResultOverview {
    id: string;
    subject: string;
    code: string;
    totalStudents: number;
    passed: number;
    failed: number;
    avgGrade: string;
    published: boolean;
}

export interface CreateExamInput {
    name: string;
    code: string;
    type: ExamType;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    description?: string;
}

export interface UpdateExamInput {
    name?: string;
    code?: string;
    type?: ExamType;
    status?: ExamStatus;
    date?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    description?: string;
    isResultPublished?: boolean;
}
