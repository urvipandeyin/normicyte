/**
 * Supabase to Firebase Migration Script
 * Usage:
 *   npm run migrate          # Run the migration
 *   npm run migrate:dry-run  # Preview what would be migrated without making changes
 */

import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

const DRY_RUN = process.env.DRY_RUN === 'true';

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase setup
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const fullServiceAccountPath = join(__dirname, serviceAccountPath);

if (!existsSync(fullServiceAccountPath)) {
  console.error(`❌ Firebase service account key not found at: ${fullServiceAccountPath}`);
  console.error('   Download it from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(fullServiceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Collection mappings (Supabase table → Firebase collection)
const COLLECTIONS = {
  profiles: 'profiles',
  cases: 'cases',
  case_evidence: 'case_evidence',
  case_questions: 'case_questions',
  user_case_progress: 'user_case_progress',
  user_activity: 'user_activity',
};

/**
 * Fetch all data from a Supabase table
 */
async function fetchFromSupabase(tableName) {
  console.log(`📥 Fetching from Supabase: ${tableName}...`);
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
  
  if (error) {
    console.error(`   ❌ Error fetching ${tableName}:`, error.message);
    return [];
  }
  
  console.log(`   ✅ Found ${data.length} records`);
  return data;
}

/**
 * Write data to Firebase Firestore
 */
async function writeToFirebase(collectionName, data) {
  if (data.length === 0) {
    console.log(`   ⏭️  No data to migrate for ${collectionName}`);
    return;
  }

  console.log(`📤 Writing to Firebase: ${collectionName}...`);
  
  if (DRY_RUN) {
    console.log(`   🔍 [DRY RUN] Would write ${data.length} documents`);
    return;
  }

  const batch = db.batch();
  let batchCount = 0;
  let totalWritten = 0;
  
  for (const record of data) {
    const docRef = db.collection(collectionName).doc(record.id);
    
    // Convert timestamps and clean data
    const cleanedRecord = cleanRecord(record);
    batch.set(docRef, cleanedRecord);
    
    batchCount++;
    
    // Firestore batches are limited to 500 operations
    if (batchCount >= 500) {
      await batch.commit();
      totalWritten += batchCount;
      console.log(`   📝 Committed batch (${totalWritten}/${data.length})`);
      batchCount = 0;
    }
  }
  
  // Commit remaining documents
  if (batchCount > 0) {
    await batch.commit();
    totalWritten += batchCount;
  }
  
  console.log(`   ✅ Wrote ${totalWritten} documents to ${collectionName}`);
}

/**
 * Clean and transform record for Firebase
 */
function cleanRecord(record) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(record)) {
    // Convert timestamp strings to Firestore Timestamps
    if (key.endsWith('_at') && typeof value === 'string') {
      cleaned[key] = admin.firestore.Timestamp.fromDate(new Date(value));
    }
    // Handle null values
    else if (value === null) {
      cleaned[key] = null;
    }
    // Handle arrays and objects
    else if (typeof value === 'object') {
      cleaned[key] = value;
    }
    // Handle primitives
    else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * Migrate a single collection
 */
async function migrateCollection(supabaseTable, firebaseCollection) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Migrating: ${supabaseTable} → ${firebaseCollection}`);
  console.log('='.repeat(50));
  
  const data = await fetchFromSupabase(supabaseTable);
  await writeToFirebase(firebaseCollection, data);
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n🚀 Starting Supabase to Firebase Migration');
  console.log(`   Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes will be made)' : '⚡ LIVE'}`);
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Firebase Project: ${serviceAccount.project_id}`);
  
  const startTime = Date.now();
  
  try {
    // Migrate each collection
    for (const [supabaseTable, firebaseCollection] of Object.entries(COLLECTIONS)) {
      await migrateCollection(supabaseTable, firebaseCollection);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration completed successfully!');
    console.log(`   Duration: ${duration}s`);
    console.log('='.repeat(50));
    
    if (DRY_RUN) {
      console.log('\n💡 This was a dry run. Run without DRY_RUN=true to perform actual migration.');
    } else {
      console.log('\n📋 Next steps:');
      console.log('   1. Verify data in Firebase Console → Firestore');
      console.log('   2. Update your main .env file with Firebase credentials');
      console.log('   3. Test the application');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migration
migrate();
