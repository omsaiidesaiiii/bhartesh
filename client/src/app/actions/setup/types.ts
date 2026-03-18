// Department types matching backend
export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: string;
  name: string;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
  users?: DepartmentUser[];
  hod?: {
    id: string;
    staff: {
      id: string;
      name: string;
    };
  } | null;
  _count?: {
    users: number;
    subjects: number;
  };
}

export interface DepartmentUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT';
}

export interface CreateDepartmentData {
  name: string;
  status?: DepartmentStatus;
}

export interface UpdateDepartmentData {
  name?: string;
  status?: DepartmentStatus;
}
