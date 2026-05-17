/**
 * Puppeteer configuration for Kingdom Alliance workspace.
 * Configured specifically to use native macOS Safari runner.
 */
module.exports = {
  defaultViewport: {
    width: 1280,
    height: 800
  },
  // Point to native macOS Safari path
  executablePath: '/Applications/Safari.app/Contents/MacOS/Safari',
  // Safely removed chromium-specific arguments (like '--no-sandbox')
  args: []
};
