/**
 * Activate Automatic Signal System
 */

const { connectToScanner } = require('./server/lib/automaticSignalConnector.js');

console.log('🚀 Activating automatic signal system...');
connectToScanner();

console.log('✅ Automatic signals activated');
console.log('🎯 System will generate signals every 15 minutes from successful scans');

// Keep the process running
setInterval(() => {
  console.log('🔄 Automatic signal system active -', new Date().toLocaleString());
}, 300000); // Every 5 minutes
