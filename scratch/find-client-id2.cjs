// Extract the Google OAuth web client ID from the Firebase Auth createAuthUri flow.
const API_KEY = 'AIzaSyDXfpTscwOXj_aWofLj3y5mzIQmrAoHoVE';

async function main() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerId: 'google.com',
      sessionId: 'probe-' + Date.now(),
      continueUrl: 'https://thekingdomalliances.com/finish',
    }),
  });
  const text = await res.text();
  console.log('status:', res.status);
  try {
    const data = JSON.parse(text);
    console.log('authUri:', data.authUri);
    const m = (data.authUri || '').match(/client_id=([^&]+)/);
    if (m) console.log('\nCLIENT ID:', decodeURIComponent(m[1]));
    else console.log('full response:', text.slice(0, 600));
  } catch { console.log(text.slice(0, 600)); }
}
main().catch((e) => console.log('ERR', e.message));
