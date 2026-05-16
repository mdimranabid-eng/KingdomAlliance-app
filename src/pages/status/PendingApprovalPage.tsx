import React from 'react';
import { KingdomCrossIcon } from '../../components/KingdomCrossIcon';
import { logOut } from '../../services/authService';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f6] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <KingdomCrossIcon size="lg" />
        </div>
        <div className="space-y-4">
          <h1 className="font-headline text-3xl text-[#040e2a]">Application Under Review</h1>
          <p className="text-[#040e2a]/70 font-body">
            Thank you for joining Kingdom Alliance. Your profile is being reviewed by our team. 
            You will receive an email once approved.
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
