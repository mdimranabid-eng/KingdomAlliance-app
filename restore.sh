#!/bin/bash

# Configuration
PROJECT_ID="kingdom-alliance-v2"
BUCKET_NAME="kingdom-alliance-v2.firebasestorage.app"
DB_BUCKET_NAME="kingdom-alliance-v2-firestore-backups"

echo "=========================================="
echo "Firebase Restore Utility"
echo "Project ID: $PROJECT_ID"
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

# List available Web App backups from GCS
echo "Available Web App Backups on Cloud Storage:"
gcloud storage ls "gs://${BUCKET_NAME}/web_app_backups/" --project="${PROJECT_ID}" 2>/dev/null

# List available Firestore backups from GCS
echo -e "\nAvailable Firestore Database Backups on Cloud Storage:"
gcloud storage ls "gs://${DB_BUCKET_NAME}/firestore_backups/" --project="${PROJECT_ID}" 2>/dev/null

echo -e "\nAvailable Local Authentication Backups (JSON files):"
ls -1 auth_backups/ 2>/dev/null

echo "=========================================="
read -p "Enter the backup ID to restore (e.g. backup_20260710_050000): " BACKUP_NAME
echo "=========================================="

if [ -z "$BACKUP_NAME" ]; then
  echo "Error: No backup name entered."
  exit 1
fi

echo -e "\nWhat would you like to restore?"
echo "1) Everything (Web App, Firestore Database & Auth Accounts)"
echo "2) Only Web App (Frontend)"
echo "3) Only Firestore Database"
echo "4) Only Authentication Accounts"
read -p "Select option (1-4): " OPTION

# Restore Web App
if [ "$OPTION" -eq 1 ] || [ "$OPTION" -eq 2 ]; then
  echo -e "\n[Web App] Downloading and restoring Web App package from Cloud Storage..."
  gcloud storage cp "gs://${BUCKET_NAME}/web_app_backups/web_app_${BACKUP_NAME}.zip" "web_app_${BACKUP_NAME}.zip" --project="${PROJECT_ID}"
  
  if [ -f "web_app_${BACKUP_NAME}.zip" ]; then
    echo "Extracting Web App files..."
    rm -rf dist
    unzip -q "web_app_${BACKUP_NAME}.zip"
    rm "web_app_${BACKUP_NAME}.zip"
    
    echo "Deploying restored Web App to Firebase Hosting..."
    npx firebase deploy --only hosting --project="${PROJECT_ID}"
    if [ $? -eq 0 ]; then
      echo "✔ Web App deployed and restored successfully."
    else
      echo "✘ Web App deployment failed."
    fi
  else
    echo "✘ Error: Web App backup package gs://${BUCKET_NAME}/web_app_backups/web_app_${BACKUP_NAME}.zip not found."
  fi
fi

# Restore Firestore
if [ "$OPTION" -eq 1 ] || [ "$OPTION" -eq 3 ]; then
  echo -e "\n[Firestore] Importing Database from gs://${DB_BUCKET_NAME}/firestore_backups/${BACKUP_NAME}..."
  gcloud firestore import "gs://${DB_BUCKET_NAME}/firestore_backups/${BACKUP_NAME}/" --project="${PROJECT_ID}"
  if [ $? -eq 0 ]; then
    echo "✔ Firestore Database restore completed successfully."
  else
    echo "✘ Firestore Database restore failed."
  fi
fi

# Restore Auth
if [ "$OPTION" -eq 1 ] || [ "$OPTION" -eq 4 ]; then
  AUTH_FILE="auth_backups/${BACKUP_NAME}.json"
  
  # Check local file first; if missing, try downloading from GCS bucket
  if [ ! -f "$AUTH_FILE" ]; then
    echo "Local Auth backup not found. Downloading from Cloud Storage..."
    gcloud storage cp "gs://${BUCKET_NAME}/auth_backups/${BACKUP_NAME}.json" "$AUTH_FILE" --project="${PROJECT_ID}" 2>/dev/null
  fi

  if [ -f "$AUTH_FILE" ]; then
    echo -e "\n[Auth] Restoring Authentication accounts from ${AUTH_FILE}..."
    npx firebase auth:import "${AUTH_FILE}" --project="${PROJECT_ID}"
    if [ $? -eq 0 ]; then
      echo "✔ Authentication accounts restore completed successfully."
    else
      echo "✘ Authentication accounts restore failed."
    fi
  else
    echo -e "\n✘ Error: Authentication backup file '${AUTH_FILE}' not found locally or in Cloud Storage."
  fi
fi

echo -e "\n=========================================="
echo "Restore operation finished."
echo "=========================================="
