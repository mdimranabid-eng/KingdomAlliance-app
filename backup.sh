#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="kingdom-alliance"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$HOME/Desktop"
OUTPUT="$BACKUP_DIR/${PROJECT_NAME}-backup-${TIMESTAMP}.zip"

echo "Backing up project..."
echo "Source: $SCRIPT_DIR"
echo "Output: $OUTPUT"
echo ""

cd "$SCRIPT_DIR"

zip -r "$OUTPUT" . \
  -x ".git/*" \
  -x ".git/**" \
  -x "node_modules/*" \
  -x "node_modules/**" \
  -x "functions/node_modules/*" \
  -x "functions/node_modules/**" \
  -x "functions/lib/*" \
  -x "functions/lib/**" \
  -x "dist/*" \
  -x "dist/**" \
  -x "*.zip" \
  -x ".DS_Store" \
  -x "**/.DS_Store" \
  -x "Backup of old webpages/*" \
  -x "Json Service account Pvt Key File/*" \
  -x "backup.sh" \
  -x ".kilo/*" \
  -x "scratch/*" \
  -x "auth_backups/*" \
  -x "mockup/*" \
  -x "mockups/*" \
  -x "firestore-debug.log" \
  -x "metadata.json"

SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')

echo ""
echo "Backup complete!"
echo "File: $OUTPUT"
echo "Size: $SIZE"
