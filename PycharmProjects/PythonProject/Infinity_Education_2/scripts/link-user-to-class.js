const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://infinity-education-26e2a.firebaseio.com'
  });
}

const db = admin.firestore();

async function linkUserToClass(userEmail, className) {
  try {
    console.log(`Linking user ${userEmail} to class ${className}...`);
    
    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', userEmail).get();
    
    if (usersSnapshot.empty) {
      throw new Error(`User with email ${userEmail} not found`);
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Find class by name
    const classesSnapshot = await db.collection('classes').where('name', '==', className).get();
    
    if (classesSnapshot.empty) {
      throw new Error(`Class with name ${className} not found`);
    }
    
    const classDoc = classesSnapshot.docs[0];
    const classData = classDoc.data();
    
    // Update class with teacher ID
    await db.collection('classes').doc(classDoc.id).update({
      teacherId: userDoc.id
    });
    
    console.log('✅ User linked to class successfully');
    console.log(`   User: ${userData.name} (${userData.email})`);
    console.log(`   Class: ${classData.name}`);
    console.log(`   Class ID: ${classDoc.id}`);
    
    return {
      userId: userDoc.id,
      classId: classDoc.id,
      userData,
      classData
    };
    
  } catch (error) {
    console.error('❌ Error linking user to class:', error);
    throw error;
  }
}

async function listUsersAndClasses() {
  try {
    console.log('\\n📋 Available Users:');
    console.log('='.repeat(40));
    
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\\n📋 Available Classes:');
    console.log('='.repeat(40));
    
    const classesSnapshot = await db.collection('classes').get();
    classesSnapshot.forEach(doc => {
      const classData = doc.data();
      console.log(`   ${classData.name} - Teacher ID: ${classData.teacherId || 'None'}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users and classes:', error);
    throw error;
  }
}

async function createClassAssignments() {
  try {
    console.log('🔗 Creating class assignments...');
    
    // Get all users and classes
    const [usersSnapshot, classesSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('classes').get()
    ]);
    
    const teachers = [];
    const classes = [];
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.role === 'TEACHER') {
        teachers.push({ id: doc.id, ...user });
      }
    });
    
    classesSnapshot.forEach(doc => {
      const classData = doc.data();
      classes.push({ id: doc.id, ...classData });
    });
    
    console.log(`Found ${teachers.length} teachers and ${classes.length} classes`);
    
    // Assign teachers to classes
    const assignments = [];
    
    for (let i = 0; i < Math.min(teachers.length, classes.length); i++) {
      const teacher = teachers[i];
      const classData = classes[i];
      
      // Update class with teacher ID
      await db.collection('classes').doc(classData.id).update({
        teacherId: teacher.id
      });
      
      assignments.push({
        teacher: teacher.name,
        class: classData.name,
        teacherId: teacher.id,
        classId: classData.id
      });
      
      console.log(`✅ Assigned ${teacher.name} to ${classData.name}`);
    }
    
    return assignments;
    
  } catch (error) {
    console.error('❌ Error creating class assignments:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('🚀 Infinity Education - User Class Linking Tool');
      console.log('='.repeat(50));
      
      await listUsersAndClasses();
      await createClassAssignments();
      
      console.log('\\n🎉 Class assignments completed!');
      
    } else if (args.length === 2) {
      const [userEmail, className] = args;
      
      console.log('🚀 Infinity Education - User Class Linking Tool');
      console.log('='.repeat(50));
      
      await linkUserToClass(userEmail, className);
      
      console.log('\\n🎉 User linked to class successfully!');
      
    } else {
      console.log('Usage: node link-user-to-class.js [userEmail] [className]');
      console.log('   OR: node link-user-to-class.js (to auto-assign all)');
      console.log('\\nExamples:');
      console.log('   node link-user-to-class.js teacher@infinityeducation.com "Math 101"');
      console.log('   node link-user-to-class.js admin@infinityeducation.com "Sample Class"');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Operation failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { linkUserToClass, listUsersAndClasses, createClassAssignments };