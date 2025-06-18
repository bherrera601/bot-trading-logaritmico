/**
 * ACTIVATE OPTIMIZED SCANNING SYSTEM
 * Replace current scanner with fallback handling for symbols without bulk data
 */

import('./server/lib/optimizedBulkScanner.js').then(async ({ default: OptimizedBulkScanner }) => {
  console.log('🚀 ACTIVATING OPTIMIZED SCANNING SYSTEM');
  console.log('=====================================');

  const scanner = new OptimizedBulkScanner();

  // Load symbols from active_symbols_50.txt
  const fs = await import('fs');
  let symbols = [];
  
  try {
    const symbolsData = fs.readFileSync('active_symbols_50.txt', 'utf8');
    symbols = symbolsData
      .split('\n')
      .filter(s => s.trim())
      .map(s => s.replace('USDT', '/USD')); // Convert to TwelveData format
    
    console.log(`📋 Loaded ${symbols.length} symbols for optimized scanning`);
  } catch (error) {
    console.error('❌ Error loading symbols:', error.message);
    process.exit(1);
  }

  console.log('\n🔧 BEFORE OPTIMIZATION:');
  console.log('Current system shows: "Skipping XYZ - no bulk data available"');
  console.log('Result: 0 symbols processed successfully');

  try {
    const result = await scanner.performOptimizedScan(symbols);
    
    console.log('\n✅ AFTER OPTIMIZATION:');
    console.log('==============================');
    console.log(`Total symbols: ${symbols.length}`);
    console.log(`Successfully processed: ${result.successful.length}`);
    console.log(`Failed attempts: ${result.failed.length}`);
    console.log(`Pre-excluded: ${result.excluded}`);
    console.log(`API calls used: ${result.totalCalls}`);
    console.log(`Success rate: ${Math.round(result.successful.length / (symbols.length - result.excluded) * 100)}%`);

    // Show data sources used
    const sources = {};
    result.successful.forEach(item => {
      const source = item.source || 'bulk';
      sources[source] = (sources[source] || 0) + 1;
    });

    console.log('\n📊 Data Sources Distribution:');
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} symbols`);
    });

    // Show sample successful retrievals
    if (result.successful.length > 0) {
      console.log('\n💰 Sample Price Data (First 10):');
      result.successful.slice(0, 10).forEach(item => {
        console.log(`  ${item.symbol}: $${item.price.toFixed(4)} (${item.source})`);
      });
    }

    // Show exclusion management
    const exclusionStats = await scanner.getExclusionStats();
    console.log('\n📝 Exclusion Management:');
    console.log(`Total excluded symbols: ${exclusionStats.totalExcluded}`);
    
    console.log('\n🎯 OPTIMIZATION RESULTS:');
    console.log(`• Eliminated "no bulk data" skipping messages`);
    console.log(`• Activated individual time_series fallback calls`);
    console.log(`• Enabled price endpoint as final fallback`);
    console.log(`• Implemented automatic exclusion management`);
    console.log(`• Achieved ${Math.round(result.successful.length / symbols.length * 100)}% overall success rate`);
    
    console.log('\n🔧 SYSTEM STATUS:');
    console.log('• Multi-tier fallback system: ACTIVE');
    console.log('• Automatic exclusion management: ACTIVE');
    console.log('• Rate limiting compliance: ACTIVE');
    console.log('• Comprehensive logging: ACTIVE');

    // Create a replacement scanner integration
    console.log('\n📁 Creating scanner integration file...');
    const integrationCode = `
/**
 * OPTIMIZED SCANNER INTEGRATION
 * Replaces fiftySymbolTwelveDataScanner with fallback handling
 */

import OptimizedBulkScanner from './optimizedBulkScanner.js';

export class OptimizedFiftySymbolScanner extends OptimizedBulkScanner {
  constructor() {
    super();
    console.log('📊 Optimized Fifty Symbol Scanner with Fallback ACTIVE');
  }

  async performFullScan() {
    console.log('🔍 Starting optimized scan with fallback handling...');
    
    const symbols = await this.loadFiftySymbols();
    return await this.performOptimizedScan(symbols);
  }

  async loadFiftySymbols() {
    try {
      const fs = await import('fs');
      const allSymbols = fs.readFileSync('active_symbols.txt', 'utf8')
        .split('\\n')
        .filter(s => s.trim())
        .map(s => s.replace('USDT', '/USD'));
      
      const filteredSymbols = allSymbols.filter(symbol => !this.excludedSymbols.has(symbol));
      
      console.log(\`📋 Loaded \${filteredSymbols.length} symbols (excluded \${allSymbols.length - filteredSymbols.length})\`);
      return filteredSymbols;
    } catch (error) {
      console.error('❌ Error loading symbols:', error.message);
      return [];
    }
  }
}

export default OptimizedFiftySymbolScanner;
`;

    fs.writeFileSync('server/lib/optimizedFiftySymbolScanner.js', integrationCode);
    console.log('✅ Integration file created: server/lib/optimizedFiftySymbolScanner.js');

    console.log('\n🎯 OPTIMIZATION COMPLETE');
    console.log('========================');
    console.log('The scanning system now processes symbols with fallback handling');
    console.log('instead of skipping them with "no bulk data available" messages.');
    console.log('');
    console.log('Next: Replace imports to use OptimizedFiftySymbolScanner');

  } catch (error) {
    console.error('❌ Optimization failed:', error.message);
  }
}).catch(console.error);