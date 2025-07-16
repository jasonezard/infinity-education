const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function clearCollection(collectionName, preserveAdmins = false) {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  
  const querySnapshot = await getDocs(collection(db, collectionName));
  let deletedCount = 0;
  let preservedCount = 0;
  
  for (const docSnapshot of querySnapshot.docs) {
    const data = docSnapshot.data();
    
    // Preserve admin users
    if (preserveAdmins && collectionName === 'users' && data.role === 'ADMIN') {
      console.log(`🔒 Preserving admin user: ${data.name} (${data.email})`);
      preservedCount++;
      continue;
    }
    
    await deleteDoc(doc(db, collectionName, docSnapshot.id));
    deletedCount++;
  }
  
  console.log(`✅ Deleted ${deletedCount} documents from ${collectionName}`);
  if (preservedCount > 0) {
    console.log(`🔒 Preserved ${preservedCount} admin users`);
  }
}

async function clearDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    console.log('⚠️  This will remove all test data but preserve admin users\n');
    
    // Clear in reverse dependency order
    await clearCollection('anecdotal_records');
    await clearCollection('students');  
    await clearCollection('classes');
    await clearCollection('users', true); // Preserve admin users
    
    console.log('\n🎉 Database cleanup complete!');
    console.log('✅ All test data removed, admin users preserved');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

// Get command line argument
const confirmArg = process.argv[2];

if (confirmArg !== '--confirm') {
  console.log('🚨 WARNING: This will delete ALL data from your database!');
  console.log('🔒 Admin users will be preserved');
  console.log('');
  console.log('To proceed, run:');
  console.log('   node clear-database.js --confirm');
  process.exit(0);
}

console.log('🧹 Infinity Education - Database Cleanup');
console.log('=' .repeat(50));
clearDatabase()
  .then(() => {
    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });