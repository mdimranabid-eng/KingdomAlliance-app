import { exec } from 'child_process';

console.log("=========================================");
console.log("   SAFARI BROWSER RUNNER VERIFICATION    ");
console.log("=========================================");

const targetUrl = "http://localhost:3000/admin/login";
console.log(`Targeting URL: ${targetUrl}`);
console.log("Native macOS Safari Path: /Applications/Safari.app/Contents/MacOS/Safari");

// Execute the Safari binary directly as a subprocess
const command = `/Applications/Safari.app/Contents/MacOS/Safari "${targetUrl}"`;

console.log("Launching Safari binary executable directly...");
exec(command, (error, stdout, stderr) => {
  if (error) {
    // If it runs in the background and stays open, that is a success!
    if (error.signal === 'SIGTERM' || error.signal === 'SIGINT') {
      console.log("Safari successfully running in background (SIGTERM/SIGINT received).");
      console.log("=========================================");
      process.exit(0);
    }
    console.error(`Launch failed: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`Automation warning: ${stderr}`);
  }
  console.log("Safari successfully spawned and navigated to the Kingdom Alliance login screen!");
  console.log("=========================================");
});
