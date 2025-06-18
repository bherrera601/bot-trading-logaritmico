/**
 * Emergency Audit: Global Signal Controller Conflict Detection
 * Investigating why BTC LONG and SHORT signals are being generated simultaneously
 */

async function auditConflictSystem() {
  console.log('🚨 EMERGENCY AUDIT: Conflict Detection System');
  console.log('=============================================\n');

  try {
    // 1. Check recent BTC signals from CSV
    console.log('📊 Step 1: Analyzing Recent BTC Signals from CSV');
    console.log('------------------------------------------------');
    
    const fs = require('fs');
    const csvContent = fs.readFileSync('historial_senales.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Find all BTC signals in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBTCSignals = [];
    
    lines.forEach((line, index) => {
      if (line.includes('BTC,')) {
        const parts = line.split(',');
        const timestamp = new Date(parts[0]);
        const symbol = parts[1];
        const direction = parts[2];
        
        if (timestamp > oneHourAgo) {
          recentBTCSignals.push({
            lineNumber: index + 1,
            timestamp: timestamp.toISOString(),
            symbol,
            direction,
            timeOnly: timestamp.toLocaleTimeString()
          });
        }
      }
    });
    
    console.log(`Found ${recentBTCSignals.length} recent BTC signals:`);
    recentBTCSignals.forEach(signal => {
      console.log(`  Line ${signal.lineNumber}: ${signal.timeOnly} - BTC ${signal.direction}`);
    });
    
    // 2. Check for conflicts in recent signals
    console.log('\n🔍 Step 2: Conflict Analysis');
    console.log('---------------------------');
    
    const conflicts = [];
    for (let i = 0; i < recentBTCSignals.length - 1; i++) {
      const current = recentBTCSignals[i];
      const next = recentBTCSignals[i + 1];
      
      const timeDiff = (new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()) / 1000;
      
      if (timeDiff < 300) { // Less than 5 minutes
        conflicts.push({
          first: current,
          second: next,
          timeDiffSeconds: timeDiff,
          isDirectionConflict: current.direction !== next.direction
        });
      }
    }
    
    if (conflicts.length > 0) {
      console.log('🚨 CONFLICTS DETECTED:');
      conflicts.forEach((conflict, index) => {
        console.log(`\nConflict ${index + 1}:`);
        console.log(`  First:  ${conflict.first.timeOnly} - BTC ${conflict.first.direction}`);
        console.log(`  Second: ${conflict.second.timeOnly} - BTC ${conflict.second.direction}`);
        console.log(`  Time gap: ${conflict.timeDiffSeconds} seconds`);
        console.log(`  Direction conflict: ${conflict.isDirectionConflict ? 'YES' : 'NO'}`);
        console.log(`  VIOLATION: ${conflict.timeDiffSeconds < 300 ? 'Cooldown period violated' : 'Within cooldown'}`);
      });
    } else {
      console.log('✅ No timing conflicts found in recent signals');
    }
    
    // 3. Test Global Signal Controller directly
    console.log('\n🛡️ Step 3: Testing Global Signal Controller');
    console.log('-------------------------------------------');
    
    try {
      // Simulate the exact conflict scenario
      console.log('Testing BTC signal permission requests...');
      
      // Try to request LONG permission
      const longPermission = await fetch('http://localhost:5000/test-signal-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTC',
          direction: 'LONG',
          source: 'audit-test'
        })
      }).catch(() => null);
      
      if (longPermission) {
        console.log('📡 Global Signal Controller API endpoint found');
      } else {
        console.log('⚠️ Global Signal Controller API endpoint not accessible via HTTP');
      }
      
    } catch (error) {
      console.log('❌ Error testing Global Signal Controller:', error.message);
    }
    
    // 4. Check automatic signal generator logs
    console.log('\n📝 Step 4: Checking Signal Generation Pattern');
    console.log('--------------------------------------------');
    
    // Analyze the timing pattern of conflicts
    const conflictPattern = recentBTCSignals.reduce((pattern, signal, index) => {
      if (index > 0) {
        const prevSignal = recentBTCSignals[index - 1];
        const timeDiff = (new Date(signal.timestamp).getTime() - new Date(prevSignal.timestamp).getTime()) / 1000;
        pattern.push({
          gap: timeDiff,
          directions: `${prevSignal.direction} → ${signal.direction}`,
          timestamp: signal.timeOnly
        });
      }
      return pattern;
    }, []);
    
    console.log('Signal generation pattern:');
    conflictPattern.forEach((pattern, index) => {
      console.log(`  ${index + 1}. ${pattern.directions} (${pattern.gap}s gap) at ${pattern.timestamp}`);
      if (pattern.gap < 300 && pattern.directions.includes('LONG') && pattern.directions.includes('SHORT')) {
        console.log(`     🚨 CRITICAL: Conflicting directions within cooldown period!`);
      }
    });
    
    // 5. Root cause analysis
    console.log('\n🔬 Step 5: Root Cause Analysis');
    console.log('------------------------------');
    
    console.log('Potential causes of conflict:');
    console.log('1. Global Signal Controller not being consulted before signal generation');
    console.log('2. Race condition between multiple signal generation processes');
    console.log('3. Test signals bypassing the Global Signal Controller');
    console.log('4. Signal cooldown map not being updated properly');
    console.log('5. Manual signal generation overriding automatic protection');
    
    // 6. Check for test signal sources
    const testSignals = recentBTCSignals.filter(signal => {
      // Check if any recent signals were test signals
      const csvLine = lines.find(line => line.includes(signal.timestamp.substring(0, 19)));
      return csvLine && (csvLine.includes('TEST') || csvLine.includes('MANUAL'));
    });
    
    if (testSignals.length > 0) {
      console.log('\n⚠️ TEST SIGNALS DETECTED:');
      testSignals.forEach(signal => {
        console.log(`  ${signal.timeOnly} - BTC ${signal.direction} (Test/Manual)`);
      });
      console.log('ROOT CAUSE: Test signals may be bypassing Global Signal Controller');
    }
    
    console.log('\n🎯 AUDIT SUMMARY:');
    console.log('================');
    console.log(`• Total recent BTC signals: ${recentBTCSignals.length}`);
    console.log(`• Conflicts detected: ${conflicts.length}`);
    console.log(`• Test/Manual signals: ${testSignals.length}`);
    console.log(`• Cooldown violations: ${conflicts.filter(c => c.timeDiffSeconds < 300).length}`);
    
    if (conflicts.length > 0) {
      console.log('\n🚨 IMMEDIATE ACTION REQUIRED:');
      console.log('• Global Signal Controller is NOT preventing conflicts');
      console.log('• Multiple BTC signals being generated within cooldown period');
      console.log('• Test signals may be bypassing protection systems');
    }
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  }
}

auditConflictSystem().catch(console.error);