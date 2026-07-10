import React from 'react';
import { KingdomCrossIcon } from '../../components/KingdomCrossIcon';
import { logOut } from '../../services/authService';
import { FileX } from 'lucide-react';

export default function RejectedPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f6] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <FileX className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="font-headline text-3xl text-[#040e2a]">Application Not Approved</h1>
          <p className="text-[#040e2a]/70 font-body">
            Unfortunately your application was not approved at this time. Contact support for more information.
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
