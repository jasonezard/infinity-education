const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_oar2BqxEZ1fvPTa0CBx9xvWPrqBrMdU",
  authDomain: "infinity-education-26e2a.firebaseapp.com",
  projectId: "infinity-education-26e2a",
  storageBucket: "infinity-education-26e2a.firebasestorage.app",
  messagingSenderId: "848919414951",
  appId: "1:848919414951:web:260e7a364ea90e0221f382"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data
const sampleTeachers = [
  {
    id: 'teacher1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    role: 'TEACHER'
  },
  {
    id: 'teacher2', 
    name: 'Michael Brown',
    email: 'michael.brown@school.edu',
    role: 'TEACHER'
  },
  {
    id: 'teacher3',
    name: 'Lisa Garcia',
    email: 'lisa.garcia@school.edu', 
    role: 'TEACHER'
  },
  {
    id: 'teacher4',
    name: 'David Wilson',
    email: 'david.wilson@school.edu',
    role: 'TEACHER'
  }
];

const sampleClasses = [
  {
    name: 'Grade 3A - Morning Class',
    teacherId: 'teacher1'
  },
  {
    name: 'Grade 3B - Afternoon Class', 
    teacherId: 'teacher1'
  },
  {
    name: 'Grade 4A - Advanced Math',
    teacherId: 'teacher2'
  },
  {
    name: 'Grade 4B - Reading Focus',
    teacherId: 'teacher2'
  },
  {
    name: 'Grade 5A - Science Explorers',
    teacherId: 'teacher3'
  },
  {
    name: 'Grade 2A - Early Learners',
    teacherId: 'teacher4'
  }
];

const sampleStudents = [
  // Grade 3A Students
  { fullName: 'Emma Thompson', grade: '3A' },
  { fullName: 'Noah Martinez', grade: '3A' },
  { fullName: 'Olivia Davis', grade: '3A' },
  { fullName: 'Liam Anderson', grade: '3A' },
  { fullName: 'Sophia Rodriguez', grade: '3A' },
  { fullName: 'Lucas Miller', grade: '3A' },
  
  // Grade 3B Students  
  { fullName: 'Isabella Wilson', grade: '3B' },
  { fullName: 'Mason Garcia', grade: '3B' },
  { fullName: 'Ava Taylor', grade: '3B' },
  { fullName: 'Ethan Johnson', grade: '3B' },
  { fullName: 'Charlotte Brown', grade: '3B' },
  
  // Grade 4A Students
  { fullName: 'James Moore', grade: '4A' },
  { fullName: 'Amelia Jackson', grade: '4A' },
  { fullName: 'Benjamin Lee', grade: '4A' },
  { fullName: 'Harper White', grade: '4A' },
  { fullName: 'Alexander Harris', grade: '4A' },
  
  // Grade 4B Students
  { fullName: 'Evelyn Clark', grade: '4B' },
  { fullName: 'William Lewis', grade: '4B' },
  { fullName: 'Abigail Walker', grade: '4B' },
  { fullName: 'Henry Hall', grade: '4B' },
  
  // Grade 5A Students
  { fullName: 'Emily Allen', grade: '5A' },
  { fullName: 'Sebastian Young', grade: '5A' },
  { fullName: 'Madison King', grade: '5A' },
  { fullName: 'Owen Wright', grade: '5A' },
  
  // Grade 2A Students
  { fullName: 'Lily Green', grade: '2A' },
  { fullName: 'Carter Adams', grade: '2A' },
  { fullName: 'Zoe Baker', grade: '2A' },
  { fullName: 'Grayson Nelson', grade: '2A' }
];

const valueTagOptions = [
  'Responsibility', 'Creativity', 'Collaboration', 'Communication', 
  'Critical Thinking', 'Perseverance', 'Empathy', 'Leadership',
  'Problem Solving', 'Independence', 'Curiosity', 'Kindness'
];

const sampleNotes = [
  'Demonstrated excellent teamwork during group project, actively listening to peers and contributing valuable ideas.',
  'Showed remarkable perseverance when solving challenging math problems, working through multiple attempts.',
  'Displayed strong leadership skills by helping struggling classmates understand the lesson.',
  'Exhibited creative thinking in art class, coming up with unique solutions to design challenges.',
  'Communicated ideas clearly during class discussion, asking thoughtful questions.',
  'Showed responsibility by completing homework on time and organizing materials effectively.',
  'Demonstrated empathy by comforting a classmate who was upset during recess.',
  'Applied critical thinking skills to analyze the story characters\' motivations.',
  'Showed curiosity by asking follow-up questions and seeking additional learning resources.',
  'Worked independently on research project, staying focused and managing time well.',
  'Displayed kindness by sharing supplies with classmates who forgot theirs.',
  'Problem-solved effectively when faced with a technical challenge during computer class.'
];

async function populateTestData() {
  try {
    console.log('🚀 Starting test data population...');
    console.log('⚠️  WARNING: This will add test data to your Firestore database');
    console.log('📧 Make sure your admin user (jezard@gmail.com) exists first!\n');

    // Create teachers first
    console.log('👨‍🏫 Creating sample teachers...');
    for (const teacher of sampleTeachers) {
      await setDoc(doc(db, 'users', teacher.id), {
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      });
      console.log(`✅ Created teacher: ${teacher.name}`);
    }

    // Create classes and store their IDs
    console.log('\n🏫 Creating sample classes...');
    const classIds = [];
    for (const classData of sampleClasses) {
      const classRef = await addDoc(collection(db, 'classes'), classData);
      classIds.push({ id: classRef.id, name: classData.name });
      console.log(`✅ Created class: ${classData.name} (ID: ${classRef.id})`);
    }

    // Create students and assign to classes
    console.log('\n👨‍🎓 Creating sample students...');
    const studentIds = [];
    for (const studentData of sampleStudents) {
      // Find matching class based on grade
      const matchingClass = classIds.find(c => c.name.includes(studentData.grade));
      if (matchingClass) {
        const studentRef = await addDoc(collection(db, 'students'), {
          fullName: studentData.fullName,
          classId: matchingClass.id
        });
        studentIds.push({
          id: studentRef.id,
          name: studentData.fullName,
          classId: matchingClass.id,
          className: matchingClass.name
        });
        console.log(`✅ Created student: ${studentData.fullName} → ${matchingClass.name}`);
      }
    }

    // Create sample anecdotal records
    console.log('\n📝 Creating sample anecdotal records...');
    let recordCount = 0;
    for (const student of studentIds) {
      // Create 2-4 records per student
      const numRecords = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numRecords; i++) {
        const randomNote = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
        const randomValueTag = valueTagOptions[Math.floor(Math.random() * valueTagOptions.length)];
        const randomAssessmentType = Math.random() > 0.7 ? 'SUMMATIVE' : 'FORMATIVE';
        const randomFlagged = Math.random() > 0.8; // 20% chance of being flagged
        
        // Random date within last 30 days
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - randomDaysAgo);
        
        await addDoc(collection(db, 'anecdotal_records'), {
          studentId: student.id,
          authorId: 'teacher1', // Default to Sarah Johnson as author
          note: randomNote,
          valueTag: randomValueTag,
          assessmentType: randomAssessmentType,
          isFlaggedForReport: randomFlagged,
          createdAt: Timestamp.fromDate(recordDate)
        });
        
        recordCount++;
      }
      console.log(`✅ Created ${numRecords} records for ${student.name}`);
    }

    console.log('\n🎉 Test data population complete!');
    console.log('📊 Summary:');
    console.log(`   👨‍🏫 Teachers: ${sampleTeachers.length}`);
    console.log(`   🏫 Classes: ${classIds.length}`);
    console.log(`   👨‍🎓 Students: ${studentIds.length}`);
    console.log(`   📝 Anecdotal Records: ${recordCount}`);
    console.log('\n✨ Your database is now populated with realistic test data!');
    console.log('🚀 You can now test the admin dashboard functionality.');

  } catch (error) {
    console.error('❌ Error populating test data:', error);
    process.exit(1);
  }
}

// Run the script
console.log('📚 Infinity Education - Test Data Population');
console.log('=' .repeat(50));
populateTestData()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });