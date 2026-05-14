#!/bin/bash

PROJECT_ID="kingdom-alliance-v2"
COLLECTION="users"
BASE_URL="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}"

MALE_NAMES=("John" "Peter" "David" "Matthew" "Mark" "Luke" "Paul" "James" "Andrew" "Simon")
FEMALE_NAMES=("Mary" "Elizabeth" "Ruth" "Sarah" "Rachel" "Rebecca" "Esther" "Martha" "Joanna" "Lydia")
SURNAMES=("Smith" "Johnson" "Williams" "Brown" "Jones" "Miller" "Davis" "Garcia" "Rodriguez" "Wilson")
DENOMINATIONS=("Catholic" "Orthodox" "Protestant" "Pentecostal" "Baptist" "Methodist" "Anglican")
PROFESSIONS=("Engineer" "Teacher" "Doctor" "Nurse" "Accountant" "Architect" "Manager" "Designer" "Pharmacist" "Artist")
LOCATIONS=("Riyadh, Saudi Arabia" "Jeddah, Saudi Arabia" "Dammam, Saudi Arabia" "Dubai, UAE" "Abu Dhabi, UAE" "London, UK")

echo "Seeding 20 profiles..."

for i in {1..20}; do
  if [ $i -le 10 ]; then
    GENDER="male"
    FIRST_NAME=${MALE_NAMES[$((RANDOM % 10))]}
    TYPE="groom"
  else
    GENDER="female"
    FIRST_NAME=${FEMALE_NAMES[$((RANDOM % 10))]}
    TYPE="bride"
  fi
  
  LAST_NAME=${SURNAMES[$((RANDOM % 10))]}
  NAME="${FIRST_NAME} ${LAST_NAME}"
  
  LOWER_FIRST=$(echo "$FIRST_NAME" | tr '[:upper:]' '[:lower:]')
  LOWER_LAST=$(echo "$LAST_NAME" | tr '[:upper:]' '[:lower:]')
  EMAIL="${LOWER_FIRST}.${LOWER_LAST}.$((100 + RANDOM % 900))@example.com"
  DENOM=${DENOMINATIONS[$((RANDOM % 7))]}
  PROF=${PROFESSIONS[$((RANDOM % 10))]}
  LOC=${LOCATIONS[$((RANDOM % 6))]}
  AGE=$((22 + RANDOM % 15))
  AVATAR="https://api.dicebear.com/7.x/avataaars/svg?seed=${FIRST_NAME}${LAST_NAME}"

  DATA=$(cat <<EOF
{
  "fields": {
    "name": {"stringValue": "$NAME"},
    "email": {"stringValue": "$EMAIL"},
    "gender": {"stringValue": "$GENDER"},
    "profileType": {"stringValue": "$TYPE"},
    "age": {"integerValue": "$AGE"},
    "maritalStatus": {"stringValue": "Never Married"},
    "denomination": {"stringValue": "$DENOM"},
    "profession": {"stringValue": "$PROF"},
    "education": {"stringValue": "University Graduate"},
    "location": {"stringValue": "$LOC"},
    "aboutMe": {"stringValue": "I am a devout $DENOM looking for a God-fearing partner. I am active in my local church and enjoy helping others."},
    "isApproved": {"booleanValue": false},
    "photoStatus": {"stringValue": "pending"},
    "pendingPhotoUrl": {"stringValue": "$AVATAR"},
    "role": {"stringValue": "user"},
    "createdAt": {"timestampValue": "2026-05-13T12:00:00Z"},
    "isFeatured": {"booleanValue": false},
    "isOnline": {"booleanValue": false},
    "churchName": {"stringValue": "St. Peters Church"},
    "height": {"integerValue": "175"},
    "motherTongue": {"arrayValue": {"values": [{"stringValue": "English"}]}}
  }
}
EOF
)

  /usr/bin/curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA" > /dev/null

  echo "Added: $NAME ($GENDER)"
done

echo "Done!"
