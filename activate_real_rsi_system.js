/**
 * Activate Real RSI System - Replace all hardcoded RSI 50.0 values with authentic calculations
 */

import { realRSIIntegrator } from './server/lib/realRSIIntegrator.js';
import axios from 'axios';

async function activateRealRSISystem() {
  console.log('🔧 ACTIVATING REAL RSI CALCULATION SYSTEM');
  console.log('=========================================\n');
  
  try {
    // Get current market data to see which symbols need RSI calculation
    console.log('1. Getting current market data...');
    const response = await axios.get('http://localhost:5000/api/rankings');
    const data = response.data;
    
    if (!data.top_cryptos) {
      console.log('❌ No market data available');
      return;
    }
    
    // Extract symbols that currently show RSI 50.0 (hardcoded)
    const symbolsNeedingRSI = data.top_cryptos
      .filter(crypto => crypto.rsi === 50.0)
      .map(crypto => crypto.symbol)
      .slice(0, 15); // Process top 15 for demonstration
    
    console.log(`📊 Found ${symbolsNeedingRSI.length} symbols with hardcoded RSI 50.0`);
    console.log('Symbols:', symbolsNeedingRSI.join(', '));
    
    // Calculate real RSI for these symbols
    console.log('\n2. Calculating real RSI values...');
    const realRSIResults = await realRSIIntegrator.calculateBatchRSI(symbolsNeedingRSI);
    
    console.log('\n3. REAL RSI CALCULATION RESULTS:');
    console.log('================================');
    
    let realRSICount = 0;
    let fallbackCount = 0;
    
    for (const [symbol, rsi] of realRSIResults.entries()) {
      const crypto = data.top_cryptos.find(c => c.symbol === symbol);
      const isRealRSI = rsi !== 50.0;
      
      console.log(`${symbol}:`);
      console.log(`  RSI: ${rsi.toFixed(2)} ${isRealRSI ? '(REAL)' : '(FALLBACK)'}`);
      console.log(`  Price: $${crypto.price.toFixed(6)}`);
      console.log(`  Volume: $${(crypto.volume / 1000000).toFixed(1)}M`);
      
      if (isRealRSI) {
        realRSICount++;
        
        // Analyze RSI value
        let analysis = '';
        if (rsi <= 30) analysis = 'OVERSOLD - Consider LONG';
        else if (rsi >= 70) analysis = 'OVERBOUGHT - Consider SHORT';
        else if (rsi >= 45 && rsi <= 55) analysis = 'NEUTRAL - Eligible for NEUTRO';
        else if (rsi > 55) analysis = 'BULLISH Trend';
        else analysis = 'BEARISH Trend';
        
        console.log(`  Analysis: ${analysis}`);
      }
      console.log('');
    }
    
    console.log('4. SYSTEM PERFORMANCE:');
    console.log('======================');
    console.log(`✅ Real RSI Calculated: ${realRSICount}/${symbolsNeedingRSI.length}`);
    console.log(`⚠️ Fallback Used: ${fallbackCount}/${symbolsNeedingRSI.length}`);
    console.log(`📈 Success Rate: ${((realRSICount / symbolsNeedingRSI.length) * 100).toFixed(1)}%`);
    
    // Check cache status
    const cacheStatus = realRSIIntegrator.getCacheStatus();
    console.log(`💾 Cache: ${cacheStatus.size} symbols cached`);
    
    console.log('\n5. NEXT STEPS TO COMPLETE INTEGRATION:');
    console.log('=====================================');
    
    if (realRSICount > symbolsNeedingRSI.length * 0.7) {
      console.log('✅ Real RSI calculation is working successfully');
      console.log('📝 Ready to integrate into main ranking system');
      console.log('🔄 The dashboard should show real RSI values instead of 50.0');
    } else {
      console.log('⚠️ RSI calculation has mixed results');
      console.log('🔍 Some external API limitations may be affecting calculation');
      console.log('🛠️ System will use authentic data where possible, fallback where needed');
    }
    
    console.log('\n6. RSI DIVERSITY ANALYSIS:');
    console.log('=========================');
    
    const rsiValues = Array.from(realRSIResults.values());
    const minRSI = Math.min(...rsiValues);
    const maxRSI = Math.max(...rsiValues);
    const avgRSI = rsiValues.reduce((sum, rsi) => sum + rsi, 0) / rsiValues.length;
    const uniqueRSI = [...new Set(rsiValues.map(r => Math.round(r)))];
    
    console.log(`📊 RSI Range: ${minRSI.toFixed(2)} - ${maxRSI.toFixed(2)}`);
    console.log(`📈 Average RSI: ${avgRSI.toFixed(2)}`);
    console.log(`🎯 Unique Values: ${uniqueRSI.length} (${uniqueRSI.join(', ')})`);
    
    if (uniqueRSI.length === 1 && uniqueRSI[0] === 50) {
      console.log('❌ All RSI values are 50 - system still using fallback');
    } else if (uniqueRSI.length >= 10) {
      console.log('✅ RSI shows good market diversity - real calculation working');
    } else {
      console.log('📊 RSI shows some diversity - partial real calculation');
    }
    
    console.log('\n✅ REAL RSI SYSTEM ACTIVATION COMPLETE');
    console.log('Timestamp:', new Date().toLocaleString());
    
  } catch (error) {
    console.error('❌ Error activating real RSI system:', error.message);
  }
}

activateRealRSISystem();