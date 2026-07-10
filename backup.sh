#!/bin/bash

# Configuration
PROJECT_ID="kingdom-alliance-v2"
BUCKET_NAME="kingdom-alliance-v2.firebasestorage.app"
DB_BUCKET_NAME="kingdom-alliance-v2-firestore-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_$TIMESTAMP"

echo "=========================================="
echo "Starting Firebase Backup for: $PROJECT_ID"
echo "Backup ID: $BACKUP_NAME"
echo "=========================================="

# Check if gcloud is authenticated
echo -e "\nChecking Google Cloud CLI authentication..."
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status=ACTIVE --format="value(account)" 2>/dev/null)
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo "🔒 No active Google Cloud session found. Launching authentication..."
  gcloud auth login
else
  echo "✔ Logged in as: $ACTIVE_ACCOUNT"
fi

# Set active project
echo "Configuring gcloud project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

# Check if Firebase CLI is authenticated
echo -e "\nChecking Firebase CLI authentication..."
if ! npx firebase projects:list &>/dev/null; then
  echo "🔒 No active Firebase CLI session found. Launching authentication..."
  npx firebase login
else
  echo "✔ Firebase CLI is authenticated."
fi

# 1. Compile & Backup Web App Deployed Files
echo -e "\n[1/4] Building and packaging Web App..."
npm run build -- --mode production
if [ $? -eq 0 ]; then
  echo "✔ Web App compiled successfully."
  zip -r "web_app_${BACKUP_NAME}.zip" dist > /dev/null
  echo "Uploading Web App package to Cloud Storage..."
  gcloud storage cp "web_app_${BACKUP_NAME}.zip" "gs://${BUCKET_NAME}/web_app_backups/web_app_${BACKUP_NAME}.zip" --project="${PROJECT_ID}"
  rm "web_app_${BACKUP_NAME}.zip"
  echo "✔ Web App backup uploaded successfully."
else
  echo "✘ Web App compilation failed. Skipping Web App backup."
fi

# 2. Backup Firestore Database
echo -e "\n[2/4] Backing up Firestore Database..."
gcloud firestore export "gs://${DB_BUCKET_NAME}/firestore_backups/${BACKUP_NAME}" --project="${PROJECT_ID}"

if [ $? -eq 0 ]; then
  echo "✔ Firestore Database backup completed successfully."
else
  echo "✘ Firestore Database backup failed."
  exit 1
fi

# 3. Backup Firebase Authentication User Accounts
echo -e "\n[3/4] Exporting Authentication User Accounts..."
mkdir -p auth_backups
npx firebase auth:export "auth_backups/${BACKUP_NAME}.json" --project="${PROJECT_ID}"

if [ $? -eq 0 ]; then
  echo "✔ Authentication User Accounts backup completed successfully."
  echo "Backup saved locally to: auth_backups/${BACKUP_NAME}.json"
else
  echo "✘ Authentication User Accounts backup failed."
  exit 1
fi

# 4. Upload Auth Backup to Cloud Storage
echo -e "\n[4/4] Uploading Auth backup to Cloud Storage..."
gcloud storage cp "auth_backups/${BACKUP_NAME}.json" "gs://${BUCKET_NAME}/auth_backups/${BACKUP_NAME}.json" --project="${PROJECT_ID}"

if [ $? -eq 0 ]; then
  echo "✔ Auth backup uploaded successfully to Cloud Storage."
else
  echo "✘ Uploading Auth backup to Cloud Storage failed."
fi

echo "=========================================="
echo "Backup completed successfully!"
echo "Web App Location: gs://${BUCKET_NAME}/web_app_backups/web_app_${BACKUP_NAME}.zip"
echo "Database Location: gs://${DB_BUCKET_NAME}/firestore_backups/${BACKUP_NAME}"
echo "Auth Location: gs://${BUCKET_NAME}/auth_backups/${BACKUP_NAME}.json"
echo "=========================================="
