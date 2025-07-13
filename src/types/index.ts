import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
}

export interface Student {
  id: string;
  fullName: string;
  classId: string;
}

export interface AnecdotalRecord {
  id: string;
  studentId: string;
  authorId: string;
  note: string;
  valueTag: string;
  assessmentType: 'FORMATIVE' | 'SUMMATIVE';
  isFlaggedForReport: boolean;
  createdAt: Timestamp;
  fileUrl?: string;
}

export interface ClassWithDetails extends Class {
  teacherName: string;
  studentCount: number;
}

export interface StudentWithRecords extends Student {
  records: AnecdotalRecord[];
}