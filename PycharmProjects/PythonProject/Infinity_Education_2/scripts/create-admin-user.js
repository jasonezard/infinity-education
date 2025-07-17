const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://infinity-education-26e2a.firebaseio.com'
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const adminUserData = {
      email: 'admin@infinityeducation.com',
      password: 'AdminPass123!',
      displayName: 'System Administrator'
    };
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser(adminUserData);
    console.log('✅ Admin user created in Firebase Auth:', userRecord.uid);
    
    // Create user profile in Firestore
    const userProfile = {
      id: userRecord.uid,
      name: adminUserData.displayName,
      email: adminUserData.email,
      role: 'ADMIN',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ Admin user profile created in Firestore');
    
    console.log('\\n📧 Admin User Credentials:');
    console.log(`   Email: ${adminUserData.email}`);
    console.log(`   Password: ${adminUserData.password}`);
    console.log(`   Role: ADMIN`);
    console.log(`   UID: ${userRecord.uid}`);
    
    return userRecord;
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Admin user already exists');
      
      // Update existing user role
      const existingUser = await auth.getUserByEmail('admin@infinityeducation.com');
      await db.collection('users').doc(existingUser.uid).update({
        role: 'ADMIN',
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated existing admin user role');
      return existingUser;
    } else {
      console.error('❌ Error creating admin user:', error);
      throw error;
    }
  }
}

// Create sample class for admin
async function createSampleClass(adminUserId) {
  try {
    console.log('\\nCreating sample class...');
    
    const classData = {
      name: 'Sample Class',
      teacherId: adminUserId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      studentCount: 0
    };
    
    const classRef = await db.collection('classes').add(classData);
    console.log('✅ Sample class created:', classRef.id);
    
    return classRef.id;
    
  } catch (error) {
    console.error('❌ Error creating sample class:', error);
    throw error;
  }
}

// Create sample students
async function createSampleStudents(classId) {
  try {
    console.log('\\nCreating sample students...');
    
    const students = [
      { fullName: 'Alice Johnson', classId, isActive: true },
      { fullName: 'Bob Smith', classId, isActive: true },
      { fullName: 'Charlie Brown', classId, isActive: true },
      { fullName: 'Diana Ross', classId, isActive: true },
      { fullName: 'Emily Davis', classId, isActive: true }
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
    console.log(`✅ Created ${students.length} sample students`);
    
    // Update class student count
    await db.collection('classes').doc(classId).update({
      studentCount: students.length
    });
    
    return studentIds;
    
  } catch (error) {
    console.error('❌ Error creating sample students:', error);
    throw error;
  }
}

// Create sample anecdotal records
async function createSampleRecords(adminUserId, studentIds) {
  try {
    console.log('\\nCreating sample anecdotal records...');
    
    const educationalValues = [
      'Communication', 'Collaboration', 'Critical Thinking', 
      'Creativity', 'Leadership', 'Problem Solving'
    ];
    
    const sampleNotes = [
      'Student demonstrated excellent communication skills during group discussion.',
      'Showed strong collaborative abilities while working on the science project.',
      'Applied critical thinking to solve complex math problems independently.',
      'Displayed creative approach to writing assignment with unique storyline.',
      'Exhibited natural leadership qualities during PE activities.',
      'Successfully problem-solved challenging puzzle with persistence.'
    ];
    
    const batch = db.batch();
    let recordCount = 0;
    
    studentIds.forEach((studentId, index) => {
      // Create 2-3 records per student
      for (let i = 0; i < 2; i++) {
        const recordRef = db.collection('anecdotalRecords').doc();
        batch.set(recordRef, {
          studentId,
          authorId: adminUserId,
          note: sampleNotes[index % sampleNotes.length],
          valueTag: educationalValues[index % educationalValues.length],
          assessmentType: i === 0 ? 'FORMATIVE' : 'SUMMATIVE',
          isFlaggedForReport: index === 0, // Flag first student's record
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        recordCount++;
      }
    });
    
    await batch.commit();
    console.log(`✅ Created ${recordCount} sample anecdotal records`);
    
  } catch (error) {
    console.error('❌ Error creating sample records:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Setting up Infinity Education with Admin User...');
    console.log('='.repeat(60));
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Create sample data
    const classId = await createSampleClass(adminUser.uid);
    const studentIds = await createSampleStudents(classId);
    await createSampleRecords(adminUser.uid, studentIds);
    
    console.log('\\n🎉 Setup completed successfully!');
    console.log('='.repeat(60));
    console.log('\\n🔐 Login Information:');
    console.log('   URL: https://infinity-education-eyixv.kinsta.page');
    console.log('   Email: admin@infinityeducation.com');
    console.log('   Password: AdminPass123!');
    console.log('   Role: ADMIN');
    console.log('\\n📊 Sample Data Created:');
    console.log('   - 1 Sample Class');
    console.log('   - 5 Sample Students');
    console.log('   - 10 Sample Anecdotal Records');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createAdminUser, createSampleClass, createSampleStudents, createSampleRecords };