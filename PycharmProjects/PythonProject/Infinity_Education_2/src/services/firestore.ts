import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import {
  User,
  Class,
  Student,
  AnecdotalRecord,
  FileAttachment,
  DashboardStats,
  StudentProgress,
  EducationalValue,
  EDUCATIONAL_VALUES,
} from '../types';

export const firestoreService = {
  // User operations
  async createUser(userData: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return docRef.id;
  },

  async getUser(userId: string): Promise<User | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as User) : null;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, userData);
  },

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },

  // Class operations
  async createClass(classData: Omit<Class, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getClass(classId: string): Promise<Class | null> {
    const docRef = doc(db, 'classes', classId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Class) : null;
  },

  async updateClass(classId: string, classData: Partial<Class>): Promise<void> {
    const docRef = doc(db, 'classes', classId);
    await updateDoc(docRef, classData);
  },

  async deleteClass(classId: string): Promise<void> {
    const docRef = doc(db, 'classes', classId);
    await deleteDoc(docRef);
  },

  async getAllClasses(): Promise<Class[]> {
    const querySnapshot = await getDocs(collection(db, 'classes'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
  },

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
  },

  // Student operations
  async createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      enrolledAt: serverTimestamp(),
      isActive: true,
    });
    return docRef.id;
  },

  async getStudent(studentId: string): Promise<Student | null> {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Student) : null;
  },

  async updateStudent(studentId: string, studentData: Partial<Student>): Promise<void> {
    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, studentData);
  },

  async deleteStudent(studentId: string): Promise<void> {
    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, { isActive: false });
  },

  async getStudentsByClass(classId: string): Promise<Student[]> {
    const q = query(
      collection(db, 'students'),
      where('classId', '==', classId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  async getAllStudents(): Promise<Student[]> {
    const q = query(collection(db, 'students'), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  // Anecdotal Record operations
  async createAnecdotalRecord(recordData: Omit<AnecdotalRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'anecdotalRecords'), {
      ...recordData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async createMultipleAnecdotalRecords(recordsData: Omit<AnecdotalRecord, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    
    recordsData.forEach(recordData => {
      const docRef = doc(collection(db, 'anecdotalRecords'));
      batch.set(docRef, {
        ...recordData,
        createdAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  },

  async getAnecdotalRecord(recordId: string): Promise<AnecdotalRecord | null> {
    const docRef = doc(db, 'anecdotalRecords', recordId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as AnecdotalRecord) : null;
  },

  async updateAnecdotalRecord(recordId: string, recordData: Partial<AnecdotalRecord>): Promise<void> {
    const docRef = doc(db, 'anecdotalRecords', recordId);
    await updateDoc(docRef, recordData);
  },

  async deleteAnecdotalRecord(recordId: string): Promise<void> {
    const docRef = doc(db, 'anecdotalRecords', recordId);
    await deleteDoc(docRef);
  },

  async getRecordsByStudent(studentId: string): Promise<AnecdotalRecord[]> {
    const q = query(
      collection(db, 'anecdotalRecords'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord));
  },

  async getRecordsByAuthor(authorId: string): Promise<AnecdotalRecord[]> {
    const q = query(
      collection(db, 'anecdotalRecords'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord));
  },

  async getRecentRecords(limitCount: number = 10): Promise<AnecdotalRecord[]> {
    const q = query(
      collection(db, 'anecdotalRecords'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord));
  },

  // File operations
  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  async createFileAttachment(fileData: Omit<FileAttachment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'files'), {
      ...fileData,
      uploadedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Analytics operations
  async getDashboardStats(): Promise<DashboardStats> {
    const [studentsSnapshot, recordsSnapshot, classesSnapshot, usersSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'students'), where('isActive', '==', true))),
      getDocs(collection(db, 'anecdotalRecords')),
      getDocs(collection(db, 'classes')),
      getDocs(query(collection(db, 'users'), where('role', '==', 'TEACHER'))),
    ]);

    const recentRecordsSnapshot = await getDocs(
      query(collection(db, 'anecdotalRecords'), orderBy('createdAt', 'desc'), limit(5))
    );

    const valueDistribution: { [key in EducationalValue]: number } = {
      'Collaboration': 0,
      'Leadership': 0,
      'Problem Solving': 0,
      'Communication': 0,
      'Creativity': 0,
      'Critical Thinking': 0,
      'Independence': 0,
      'Responsibility': 0,
      'Empathy': 0,
      'Perseverance': 0,
    };

    recordsSnapshot.docs.forEach(doc => {
      const record = doc.data() as AnecdotalRecord;
      if (record.valueTag && valueDistribution.hasOwnProperty(record.valueTag)) {
        valueDistribution[record.valueTag]++;
      }
    });

    return {
      totalStudents: studentsSnapshot.size,
      totalRecords: recordsSnapshot.size,
      totalClasses: classesSnapshot.size,
      totalTeachers: usersSnapshot.size,
      recentRecords: recentRecordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnecdotalRecord)),
      valueDistribution,
    };
  },

  async getStudentProgress(studentId: string): Promise<StudentProgress | null> {
    const student = await this.getStudent(studentId);
    if (!student) return null;

    const records = await this.getRecordsByStudent(studentId);
    
    const valueScores: { [key in EducationalValue]: number } = {
      'Collaboration': 0,
      'Leadership': 0,
      'Problem Solving': 0,
      'Communication': 0,
      'Creativity': 0,
      'Critical Thinking': 0,
      'Independence': 0,
      'Responsibility': 0,
      'Empathy': 0,
      'Perseverance': 0,
    };

    records.forEach(record => {
      if (record.valueTag && valueScores.hasOwnProperty(record.valueTag)) {
        valueScores[record.valueTag]++;
      }
    });

    const flaggedRecords = records.filter(record => record.isFlaggedForReport).length;
    const lastUpdated = records.length > 0 ? records[0].createdAt : student.enrolledAt;

    return {
      studentId,
      studentName: student.fullName,
      valueScores,
      totalRecords: records.length,
      flaggedRecords,
      lastUpdated,
    };
  },

  async getClassProgress(classId: string): Promise<StudentProgress[]> {
    const students = await this.getStudentsByClass(classId);
    const progressPromises = students.map(student => this.getStudentProgress(student.id));
    const progressResults = await Promise.all(progressPromises);
    return progressResults.filter(progress => progress !== null) as StudentProgress[];
  },
};