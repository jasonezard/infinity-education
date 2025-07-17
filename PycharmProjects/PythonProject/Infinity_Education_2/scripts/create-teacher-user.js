const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://infinity-education-26e2a.firebaseio.com'
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function createTeacherUser() {
  try {
    console.log('Creating teacher user...');
    
    const teacherUserData = {
      email: 'teacher@infinityeducation.com',
      password: 'TeacherPass123!',
      displayName: 'John Teacher'
    };
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser(teacherUserData);
    console.log('✅ Teacher user created in Firebase Auth:', userRecord.uid);
    
    // Create user profile in Firestore
    const userProfile = {
      id: userRecord.uid,
      name: teacherUserData.displayName,
      email: teacherUserData.email,
      role: 'TEACHER',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ Teacher user profile created in Firestore');
    
    console.log('\\n📧 Teacher User Credentials:');
    console.log(`   Email: ${teacherUserData.email}`);
    console.log(`   Password: ${teacherUserData.password}`);
    console.log(`   Role: TEACHER`);
    console.log(`   UID: ${userRecord.uid}`);
    
    return userRecord;
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Teacher user already exists');
      
      // Update existing user role
      const existingUser = await auth.getUserByEmail('teacher@infinityeducation.com');
      await db.collection('users').doc(existingUser.uid).update({
        role: 'TEACHER',
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated existing teacher user role');
      return existingUser;
    } else {
      console.error('❌ Error creating teacher user:', error);
      throw error;
    }
  }
}

// Create teacher's class
async function createTeacherClass(teacherId) {
  try {
    console.log('\\nCreating teacher class...');
    
    const classData = {
      name: 'Math 101',
      teacherId: teacherId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      studentCount: 0
    };
    
    const classRef = await db.collection('classes').add(classData);
    console.log('✅ Teacher class created:', classRef.id);
    
    return classRef.id;
    
  } catch (error) {
    console.error('❌ Error creating teacher class:', error);
    throw error;
  }
}

// Create students for teacher's class
async function createClassStudents(classId) {
  try {
    console.log('\\nCreating students for teacher class...');
    
    const students = [
      { fullName: 'Michael Johnson', classId, isActive: true },
      { fullName: 'Sarah Williams', classId, isActive: true },
      { fullName: 'David Brown', classId, isActive: true },
      { fullName: 'Jessica Wilson', classId, isActive: true },
      { fullName: 'Christopher Lee', classId, isActive: true },
      { fullName: 'Amanda Taylor', classId, isActive: true }
    ];
    
    const batch = db.batch();
    const studentIds = [];
    
    students.forEach(student => {
      const studentRef = db.collection('students').doc();
      batch.set(studentRef, {
        ...student,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp()
      });
      studentIds.push(studentRef.id);
    });
    
    await batch.commit();
    console.log(`✅ Created ${students.length} students for teacher class`);
    
    // Update class student count
    await db.collection('classes').doc(classId).update({
      studentCount: students.length
    });
    
    return studentIds;
    
  } catch (error) {
    console.error('❌ Error creating class students:', error);
    throw error;
  }
}

// Create anecdotal records for teacher
async function createTeacherRecords(teacherId, studentIds) {
  try {
    console.log('\\nCreating anecdotal records for teacher...');
    
    const educationalValues = [
      'Communication', 'Collaboration', 'Critical Thinking', 
      'Creativity', 'Leadership', 'Problem Solving',
      'Independence', 'Responsibility', 'Empathy', 'Perseverance'
    ];
    
    const sampleNotes = [
      'Student showed exceptional understanding of algebraic concepts and helped peers.',
      'Demonstrated strong problem-solving skills during geometry exercises.',
      'Actively participated in class discussions and asked thoughtful questions.',
      'Worked collaboratively on group project and took initiative in planning.',
      'Showed perseverance when tackling challenging word problems.',
      'Displayed creative approach to solving mathematical equations.',
      'Took responsibility for explaining concepts to struggling classmates.',
      'Showed empathy by helping a new student feel welcome in class.',
      'Worked independently on advanced problems without needing assistance.',
      'Demonstrated leadership by organizing study group for upcoming test.'
    ];
    
    const batch = db.batch();
    let recordCount = 0;
    
    studentIds.forEach((studentId, index) => {
      // Create 3-4 records per student
      for (let i = 0; i < 3; i++) {
        const recordRef = db.collection('anecdotalRecords').doc();
        const noteIndex = (index * 3 + i) % sampleNotes.length;
        batch.set(recordRef, {
          studentId,
          authorId: teacherId,
          note: sampleNotes[noteIndex],
          valueTag: educationalValues[noteIndex % educationalValues.length],
          assessmentType: i % 2 === 0 ? 'FORMATIVE' : 'SUMMATIVE',
          isFlaggedForReport: index < 2 && i === 0, // Flag first record for first 2 students
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        recordCount++;
      }
    });
    
    await batch.commit();
    console.log(`✅ Created ${recordCount} anecdotal records for teacher`);
    
  } catch (error) {
    console.error('❌ Error creating teacher records:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Setting up Teacher User for Infinity Education...');
    console.log('='.repeat(60));
    
    // Create teacher user
    const teacherUser = await createTeacherUser();
    
    // Create teacher's class and students
    const classId = await createTeacherClass(teacherUser.uid);
    const studentIds = await createClassStudents(classId);
    await createTeacherRecords(teacherUser.uid, studentIds);
    
    console.log('\\n🎉 Teacher setup completed successfully!');
    console.log('='.repeat(60));
    console.log('\\n🔐 Login Information:');
    console.log('   URL: https://infinity-education-eyixv.kinsta.page');
    console.log('   Email: teacher@infinityeducation.com');
    console.log('   Password: TeacherPass123!');
    console.log('   Role: TEACHER');
    console.log('\\n📊 Teacher Data Created:');
    console.log('   - 1 Class (Math 101)');
    console.log('   - 6 Students');
    console.log('   - 18 Anecdotal Records');
    
  } catch (error) {
    console.error('💥 Teacher setup failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createTeacherUser, createTeacherClass, createClassStudents, createTeacherRecords };