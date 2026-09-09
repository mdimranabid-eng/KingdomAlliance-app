import os

path = "/Users/i.abid/Desktop/Money Apps/kingdom-alliance website/src/pages/ProfilePage.tsx"

with open(path, 'r') as f:
    lines = f.readlines()

# Lines 1431-1547 (0-indexed: 1430-1546) contain the old delete modal
# Replace them with the simplified OTP modal

new_text = """{/* Account Deletion OTP Verification Modal */}
      <AnimatePresence>
        {showAccountDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deletingAccount && setShowAccountDeleteConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="p-8 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600"/>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Delete Your Profile?</h2>

                <div className="text-sm text-slate-600 space-y-2 text-left bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p>\\u2022 Your account will be <strong>disabled immediately</strong> and hidden from all other members.</p>
                  <p>\\u2022 It will be <strong>permanently deleted after 7 days</strong> \\u2014 profile, photos, interests, messages and all data.</p>
                  <p>\\u2022 <strong>Changed your mind?</strong> Just log in during those 7 days to reactivate and restore everything.</p>
                </div>

                <p className="text-sm text-slate-600">
                  A verification code has been sent to your email. Enter it below to confirm deletion.
                </p>

                <div className="flex justify-center gap-2 py-2">
                  {accountDeleteOtpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { accountDeleteOtpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\\D/g, '');
                        const newCode = [...accountDeleteOtpCode];
                        newCode[idx] = val;
                        setAccountDeleteOtpCode(newCode);
                        if (val && idx < 5) accountDeleteOtpRefs.current[idx + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          accountDeleteOtpRefs.current[idx - 1]?.focus();
                        }
                      }}
                      disabled={deletingAccount}
                      className="w-10 h-12 text-center border-2 border-slate-200 rounded-lg font-bold text-lg outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                  ))}
                </div>

                {accountDeleteOtpError && (
                  <p className="text-error text-sm font-medium">{accountDeleteOtpError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowAccountDeleteConfirm(false); setAccountDeleteOtpCode(['','','','','','']); setAccountDeleteOtpError(null); }}
                    disabled={deletingAccount}
                    className="flex-1 px-6 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOtpVerify}
                    disabled={deletingAccount || accountDeleteOtpCode.join('').length !== 6}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingAccount && <Loader2 className="w-5 h-5 animate-spin" />}
                    Confirm & Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""

# Replace lines 1430-1547 (0-indexed 1429-1546)
del lines[1429:1547]
lines.insert(1429, new_text)

with open(path, 'w') as f:
    f.writelines(lines)

print("Done! New line count:", len(lines))