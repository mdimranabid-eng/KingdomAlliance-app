#!/bin/bash

# Clear screen for clean output
clear

echo "============================================="
echo "        Kingdom Alliance Git Backup"
echo "============================================="

# Show current status
echo -e "\nChecking Git status..."
git status -s

# Prompt user for commit message
echo -e "\n---------------------------------------------"
echo "Enter a commit message describing your changes:"
read -p "> " commit_msg

# If message is empty, use a default timestamp message
if [ -z "$commit_msg" ]; then
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  commit_msg="Auto backup - $TIMESTAMP"
  echo "No message entered. Using default: '$commit_msg'"
fi

# Stage all files
echo -e "\n[1/3] Staging all changes..."
git add .
echo "✔ All files staged."

# Commit changes
echo -e "\n[2/3] Committing changes..."
git commit -m "$commit_msg"

# Push to remote repository
echo -e "\n[3/3] Pushing to remote repository..."
git push

if [ $? -eq 0 ]; then
  echo -e "\n============================================="
  echo "🎉 Git Backup Completed Successfully!"
  echo "============================================="
else
  echo -e "\n============================================="
  echo "❌ Git Push Failed. Please check the error above."
  echo "============================================="
fi
