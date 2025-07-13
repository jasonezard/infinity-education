import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Class, Student, AnecdotalRecord } from '../types';

export const firestoreService = {
  // Users
  async createUser(userId: string, userData: Omit<User, 'id'>) {
    await updateDoc(doc(db, 'users', userId), userData);
  },

  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userId, ...userDoc.data() } as User : null;
  },

  async getAllTeachers(): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', 'TEACHER'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },

  // Classes
  async createClass(classData: Omit<Class, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'classes'), classData);
    return docRef.id;
  },

  async getAllClasses(): Promise<Class[]> {
    const snapshot = await getDocs(collection(db, 'classes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
  },

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
  },

  async updateClass(classId: string, updates: Partial<Class>) {
    await updateDoc(doc(db, 'classes', classId), updates);
  },

  async deleteClass(classId: string) {
    await deleteDoc(doc(db, 'classes', classId));
  },

  // Students
  async createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'students'), studentData);
    return docRef.id;
  },

  async getStudentsByClass(classId: string): Promise<Student[]> {
    const q = query(collection(db, 'students'), where('classId', '==', classId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  async getStudent(studentId: string): Promise<Student | null> {
    const studentDoc = await getDoc(doc(db, 'students', studentId));
    return studentDoc.exists() ? { id: studentId, ...studentDoc.data() } as Student : null;
  },

  async updateStudent(studentId: string, updates: Partial<Student>) {
    await updateDoc(doc(db, 'students', studentId), updates);
  },

  async deleteStudent(studentId: string) {
    await deleteDoc(doc(db, 'students', studentId));
  },

  // Anecdotal Records
  async createAnecdotalRecord(recordData: Omit<AnecdotalRecord, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'anecdotal_records'), {
      ...recordData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async createMultipleAnecdotalRecords(
    studentIds: string[],
    recordData: Omit<AnecdotalRecord, 'id' | 'createdAt' | 'studentId'>
  ): Promise<void> {
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();
    
    studentIds.forEach(studentId => {
      const docRef = doc(collection(db, 'anecdotal_records'));
      batch.set(docRef, {
        ...recordData,
        studentId,
        createdAt: timestamp
      });
    });
    
    await batch.commit();
  },

  async getAnecdotalRecordsByStudent(studentId: string): Promise<AnecdotalRecord[]> {
    const q = query(
      collection(db, 'anecdotal_records'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord));
  },

  async getAnecdotalRecordsByClass(studentIds: string[]): Promise<AnecdotalRecord[]> {
    if (studentIds.length === 0) return [];
    
    const q = query(
      collection(db, 'anecdotal_records'),
      where('studentId', 'in', studentIds),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord));
  },

  async getFlaggedRecordsByStudent(studentId: string): Promise<AnecdotalRecord[]> {
    const q = query(
      collection(db, 'anecdotal_records'),
      where('studentId', '==', studentId),
      where('isFlaggedForReport', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord));
  },

  async updateAnecdotalRecord(recordId: string, updates: Partial<AnecdotalRecord>) {
    await updateDoc(doc(db, 'anecdotal_records', recordId), updates);
  },

  async deleteAnecdotalRecord(recordId: string) {
    await deleteDoc(doc(db, 'anecdotal_records', recordId));
  }
};