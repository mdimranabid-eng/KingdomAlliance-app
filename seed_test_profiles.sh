#!/bin/bash

# Kingdom Alliance Test Data Seeder
# Adds 10 Bride and 10 Groom profiles to Firestore

PROJECT_ID="kingdom-alliance-v2"
COLLECTION="users"
BASE_URL="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}"

echo "------------------------------------------------"
echo "Kingdom Alliance: Seeding Test Profiles"
echo "Project: $PROJECT_ID"
echo "------------------------------------------------"

# Function to generate a random UID-like string
gen_uid() {
  cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 28 | head -n 1
}

# Data Arrays
MALE_NAMES=("Gabriel" "Nathaniel" "Samuel" "Caleb" "Isaac" "Joshua" "Elijah" "Daniel" "Luke" "Matthew")
FEMALE_NAMES=("Seraphina" "Evangeline" "Grace" "Hope" "Faith" "Charity" "Mercy" "Patience" "Verity" "Felicity")
SURNAMES=("Smith" "Johnson" "Williams" "Brown" "Jones" "Miller" "Davis" "Garcia" "Rodriguez" "Wilson")
DENOMS=("Catholic" "Orthodox" "Protestant" "Pentecostal" "Baptist" "Methodist" "Anglican")
PROFS=("Software Engineer" "Medical Doctor" "High School Teacher" "Architect" "Project Manager" "UX Designer" "Pharmacist" "Graphic Artist" "Registered Nurse" "Senior Accountant")
LOCS=("Riyadh, SA" "Jeddah, SA" "Dammam, SA" "Dubai, UAE" "Abu Dhabi, UAE" "London, UK")

seed_profiles() {
  TYPE=$1
  COUNT=$2
  
  echo "Seeding $COUNT ${TYPE}s..."
  
  for ((i=1; i<=COUNT; i++)); do
    UID=$(gen_uid)
    if [ "$TYPE" == "groom" ]; then
      GENDER="male"
      FIRST_NAME=${MALE_NAMES[$((i-1))]}
    else
      GENDER="female"
      FIRST_NAME=${FEMALE_NAMES[$((i-1))]}
    fi
    
    LAST_NAME=${SURNAMES[$((RANDOM % 10))]}
    NAME="$FIRST_NAME $LAST_NAME"
    LOWER_NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '.')
    EMAIL="${LOWER_NAME}.test$((100 + RANDOM % 900))@example.com"
    AGE=$((22 + RANDOM % 15))
    DENOM=${DENOMS[$((RANDOM % 7))]}
    PROF=${PROFS[$((RANDOM % 10))]}
    LOC=${LOCS[$((RANDOM % 6))]}
    AVATAR="https://api.dicebear.com/7.x/avataaars/svg?seed=${NAME}${UID}"
    
    DATA=$(cat <<EOF
{
  "fields": {
    "uid": {"stringValue": "$UID"},
    "name": {"stringValue": "$NAME"},
    "email": {"stringValue": "$EMAIL"},
    "emailVerified": {"booleanValue": true},
    "gender": {"stringValue": "$GENDER"},
    "profileType": {"stringValue": "$TYPE"},
    "age": {"integerValue": "$AGE"},
    "maritalStatus": {"stringValue": "Never Married"},
    "denomination": {"stringValue": "$DENOM"},
    "profession": {"stringValue": "$PROF"},
    "education": {"stringValue": "University Graduate"},
    "location": {"stringValue": "$LOC"},
    "aboutMe": {"stringValue": "I am a devout Christian looking for a God-fearing partner. I enjoy church activities, traveling, and community service."},
    "isApproved": {"booleanValue": true},
    "photoStatus": {"stringValue": "approved"},
    "photoUrl": {"stringValue": "$AVATAR"},
    "role": {"stringValue": "user"},
    "createdAt": {"timestampValue": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"},
    "updatedAt": {"timestampValue": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"},
    "isFeatured": {"booleanValue": false},
    "isOnline": {"booleanValue": false},
    "churchName": {"stringValue": "Kingdom Alliance Church"},
    "height": {"integerValue": "175"},
    "motherTongue": {"arrayValue": {"values": [{"stringValue": "English"}]}},
    "status": {"stringValue": "active"}
  }
}
EOF
)

    # Note: We use the UID as the document ID for consistency
    /usr/bin/curl -s -X PATCH "${BASE_URL}/${UID}?updateMask.fieldPaths=uid&updateMask.fieldPaths=name&updateMask.fieldPaths=email&updateMask.fieldPaths=emailVerified&updateMask.fieldPaths=gender&updateMask.fieldPaths=profileType&updateMask.fieldPaths=age&updateMask.fieldPaths=maritalStatus&updateMask.fieldPaths=denomination&updateMask.fieldPaths=profession&updateMask.fieldPaths=education&updateMask.fieldPaths=location&updateMask.fieldPaths=aboutMe&updateMask.fieldPaths=isApproved&updateMask.fieldPaths=photoStatus&updateMask.fieldPaths=photoUrl&updateMask.fieldPaths=role&updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=isFeatured&updateMask.fieldPaths=isOnline&updateMask.fieldPaths=churchName&updateMask.fieldPaths=height&updateMask.fieldPaths=motherTongue&updateMask.fieldPaths=status" \
      -H "Content-Type: application/json" \
      -d "$DATA" > /dev/null
    
    echo "  [+] Added $NAME ($TYPE)"
  done
}

seed_profiles "groom" 10
seed_profiles "bride" 10

echo "------------------------------------------------"
echo "Success! 20 profiles have been seeded."
echo "Refresh your Admin Panel to see the new users."
echo "------------------------------------------------"
