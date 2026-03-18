import { ActionResult } from "@/lib/auth-types";

export interface Subject {
    id: string;
    name: string;
    code: string;
    credits?: number;
    semester?: number;
    departmentId?: string;
}

export type SubjectsResponse = ActionResult<Subject[]>;
