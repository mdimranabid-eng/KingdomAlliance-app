import React from 'react';
import { KingdomCrossIcon } from '../../components/KingdomCrossIcon';
import { logOut } from '../../services/authService';
import { UserX } from 'lucide-react';

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f6] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="font-headline text-3xl text-[#040e2a]">Account Closed</h1>
          <p className="text-[#040e2a]/70 font-body">
            This account is no longer active. Please contact support if you believe this is an error.
          </p>
        </div>
        <button 
          onClick={logOut}
          className="text-[#d4af37] font-bold hover:underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
