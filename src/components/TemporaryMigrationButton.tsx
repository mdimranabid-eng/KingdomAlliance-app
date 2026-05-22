import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState } from 'react';

export const TemporaryMigrationButton = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const runMigration = async () => {
    setIsMigrating(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let updateCount = 0;

      // Loop through every single user in the database
      const updatePromises = snapshot.docs.map(async (userDoc) => {
        const userRef = doc(db, 'users', userDoc.id);
        
        // This is the Master Schema payload with empty defaults
        const masterSchemaDefaults = {
          dob: "", age: 0, gender: "", height: "", weight: "", complexion: "", 
          motherTongue: "", nationality: "", maritalStatus: "", denomination: "", 
          churchName: "", ministryRole: "", mobileNumber: "", aboutMe: "", 
          education: "", fieldOfStudy: "", college: "", profession: "", 
          employmentType: "", annualIncome: "", fathersName: "", fathersOccupation: "", 
          mothersName: "", mothersOccupation: "", numberOfSiblings: "", familyType: "", 
          familyFaithBackground: "", hobbies: [], languagesKnown: [], dietaryHabits: "", 
          drinkingHabits: "", smokingHabits: "",
          partnerPreferences: {
            ageRange: "", heightRange: "", education: "", location: ""
          }
        };

        // setDoc with { merge: true } safely adds missing fields without deleting existing data!
        await setDoc(userRef, masterSchemaDefaults, { merge: true });
        updateCount++;
      });

      // Wait for all users to be updated
      await Promise.all(updatePromises);
      
      alert(`Migration Complete! Successfully upgraded ${updateCount} users to the Master Schema.`);
    } catch (error) {
      console.error("Migration failed: ", error);
      alert("Error running migration. Check console.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-6">
      <h3 className="text-red-800 font-bold mb-2">⚠️ Admin Tool: One-Time Database Migration</h3>
      <p className="text-sm text-red-600 mb-4">Click this ONCE to upgrade all existing users to the new Master Schema. Delete this button from the code after use.</p>
      <button 
        onClick={runMigration}
        disabled={isMigrating}
        className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
      >
        {isMigrating ? "Upgrading Database..." : "Run Migration Script"}
      </button>
    </div>
  );
};
