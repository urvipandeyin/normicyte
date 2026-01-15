# Supabase to Firebase Migration Guide

## Prerequisites

1. Your old Supabase credentials (you had them in your .env before)
2. Firebase project set up with Firestore enabled
3. Firebase Admin SDK service account key

## Step 1: Get Supabase Credentials

Your old Supabase credentials were:
- Project ID: `adjmsxnwofgiomwuzwfm`
- URL: `https://adjmsxnwofgiomwuzwfm.supabase.co`
- Anon Key: (the key you had)

## Step 2: Set Up Firebase Admin

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `serviceAccountKey.json` in the `scripts/` folder
4. **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore`

## Step 3: Run the Migration

```bash
# Install migration dependencies
cd scripts
npm install

# Run migration
npm run migrate
```

## What Gets Migrated

- **profiles** - User profiles
- **cases** - Cyber detective cases
- **case_evidence** - Evidence for each case
- **case_questions** - Questions for each case
- **user_case_progress** - User progress on cases
- **user_activity** - User activity logs

## Post-Migration

1. Verify data in Firebase Console → Firestore
2. Update your `.env` with Firebase credentials
3. Test the application

## Troubleshooting

- If you get authentication errors, ensure your Supabase anon key is still valid
- Firebase service account needs "Cloud Datastore User" role
