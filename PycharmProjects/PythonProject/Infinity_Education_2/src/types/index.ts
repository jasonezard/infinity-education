import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  createdAt: Timestamp;
  studentCount: number;
}

export interface Student {
  id: string;
  fullName: string;
  classId: string;
  enrolledAt: Timestamp;
  isActive: boolean;
}

export interface AnecdotalRecord {
  id: string;
  studentId: string;
  authorId: string;
  note: string;
  valueTag: EducationalValue;
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

export interface FileAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Timestamp;
  storageRef: string;
  url: string;
}

export type EducationalValue = 
  | 'Collaboration'
  | 'Leadership'
  | 'Problem Solving'
  | 'Communication'
  | 'Creativity'
  | 'Critical Thinking'
  | 'Independence'
  | 'Responsibility'
  | 'Empathy'
  | 'Perseverance';

export const EDUCATIONAL_VALUES: EducationalValue[] = [
  'Collaboration',
  'Leadership',
  'Problem Solving',
  'Communication',
  'Creativity',
  'Critical Thinking',
  'Independence',
  'Responsibility',
  'Empathy',
  'Perseverance'
];

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

export interface DashboardStats {
  totalStudents: number;
  totalRecords: number;
  totalClasses: number;
  totalTeachers: number;
  recentRecords: AnecdotalRecord[];
  valueDistribution: { [key in EducationalValue]: number };
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  valueScores: { [key in EducationalValue]: number };
  totalRecords: number;
  flaggedRecords: number;
  lastUpdated: Timestamp;
}