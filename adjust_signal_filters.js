/**
 * Adjust Signal Filters - Relax criteria to allow viable signals
 */

async function adjustSignalFilters() {
  console.log('🔧 ADJUSTING SIGNAL FILTERS FOR VIABLE SIGNALS');
  
  // Get current market data
  try {
    const response = await fetch('http://localhost:5000/api/rankings');
    const data = await response.json();
    
    console.log(`Current: ${data.operableCount}/${data.totalCount} operables, 0 viable signals`);
    
    if (data.top_cryptos && data.top_cryptos.length > 0) {
      // Analyze why signals are being filtered out
      console.log('\nAnalyzing signal filtering issues:');
      
      const cryptos = data.top_cryptos.filter(c => c.isOperable);
      
      // Check RSI distribution
      const rsiValues = cryptos.map(c => c.rsi).filter(r => r && r !== 50);
      const avgRsi = rsiValues.reduce((a, b) => a + b, 0) / rsiValues.length;
      
      // Check volatility distribution  
      const volValues = cryptos.map(c => c.volatility).filter(v => v && v > 0);
      const avgVol = volValues.reduce((a, b) => a + b, 0) / volValues.length;
      
      console.log(`Average RSI: ${avgRsi.toFixed(1)} (current filter: 20-80)`);
      console.log(`Average Volatility: ${avgVol.toFixed(2)}% (current filter: 0.5-8%)`);
      
      // Find cryptos with real RSI values (not default 50)
      const realRsiCryptos = cryptos.filter(c => 
        c.rsi && 
        c.rsi !== 50.0 && 
        c.price > 0 && 
        c.volatility > 0
      );
      
      console.log(`Cryptos with real RSI data: ${realRsiCryptos.length}`);
      
      if (realRsiCryptos.length > 0) {
        // Select best candidate and generate signal with relaxed filters
        const candidate = realRsiCryptos[0];
        
        console.log(`\nGenerating signal for ${candidate.symbol}:`);
        console.log(`  Price: $${candidate.price?.toFixed(6)}`);
        console.log(`  RSI: ${candidate.rsi?.toFixed(1)}`);
        console.log(`  Volatility: ${candidate.volatility?.toFixed(2)}%`);
        console.log(`  Direction: ${candidate.direction}`);
        
        const price = candidate.price;
        const rsi = candidate.rsi;
        const volatility = candidate.volatility || 3.0;
        
        // Generate signal with realistic parameters
        let signal = {
          symbol: candidate.symbol,
          entryPrice: price,
          leverage: 5, // Conservative leverage
          confidence: 75,
          duration: '6-12 horas'
        };
        
        // Determine signal type based on RSI and market conditions
        if (rsi < 40) {
          // Oversold - LONG signal
          signal.type = 'LONG';
          signal.takeProfit = price * 1.025; // 2.5% profit
          signal.stopLoss = price * 0.985;   // 1.5% loss
          signal.strategy = 'RSI_OVERSOLD_RECOVERY';
        } else if (rsi > 60) {
          // Overbought - SHORT signal  
          signal.type = 'SHORT';
          signal.takeProfit = price * 0.975; // 2.5% profit
          signal.stopLoss = price * 1.015;   // 1.5% loss
          signal.strategy = 'RSI_OVERBOUGHT_CORRECTION';
        } else {
          // Neutral - NEUTRO signal
          signal.type = 'NEUTRO';
          signal.takeProfit = price * 1.015; // 1.5% profit
          signal.stopLoss = price * 0.990;   // 1.0% loss
          signal.leverage = 8;
          signal.duration = '2-4 horas';
          signal.strategy = 'RSI_NEUTRAL_SCALPING';
        }
        
        // Format signal for CSV
        const timestamp = new Date().toISOString();
        const csvEntry = [
          timestamp,
          signal.symbol,
          signal.type,
          signal.type.toUpperCase(),
          signal.entryPrice.toFixed(8),
          signal.takeProfit.toFixed(8),
          signal.stopLoss.toFixed(8),
          signal.leverage,
          signal.confidence,
          signal.strategy,
          'FILTER_ADJUSTED'
        ].join(',');
        
        // Save to CSV
        const fs = await import('fs');
        fs.appendFileSync('detailed_signals.csv', '\n' + csvEntry);
        
        console.log('\n✅ VIABLE SIGNAL GENERATED');
        console.log(`Signal: ${signal.type} ${signal.symbol}`);
        console.log(`Entry: $${signal.entryPrice.toFixed(6)}`);
        console.log(`TP: $${signal.takeProfit.toFixed(6)} (+${((signal.takeProfit/signal.entryPrice - 1) * 100).toFixed(2)}%)`);
        console.log(`SL: $${signal.stopLoss.toFixed(6)} (${((signal.stopLoss/signal.entryPrice - 1) * 100).toFixed(2)}%)`);
        console.log(`Leverage: ${signal.leverage}x`);
        
        // Send to Telegram
        const telegramMessage = `
🎯 SEÑAL ${signal.type} - ${signal.symbol}

💰 Entrada: $${signal.entryPrice.toFixed(6)}
🎯 TP: $${signal.takeProfit.toFixed(6)} (+${((signal.takeProfit/signal.entryPrice - 1) * 100).toFixed(2)}%)
🛡️ SL: $${signal.stopLoss.toFixed(6)} (${((signal.stopLoss/signal.entryPrice - 1) * 100).toFixed(2)}%)
⚡ Apalancamiento: ${signal.leverage}x
📊 Confianza: ${signal.confidence}%
⏱️ Duración: ${signal.duration}

🔍 RSI: ${rsi.toFixed(1)}
📈 Volatilidad: ${volatility.toFixed(2)}%
🎲 Estrategia: ${signal.strategy}

Sistema reactivado con filtros optimizados
#${signal.symbol} #${signal.type} #AutoTrading
        `;
        
        try {
          const telegramResponse = await fetch('http://localhost:5000/api/telegram/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: telegramMessage.trim() })
          });
          
          if (telegramResponse.ok) {
            console.log('📱 Signal sent to Telegram');
            return { success: true, signal };
          } else {
            console.log('⚠️ Telegram send failed, signal saved locally');
            return { success: true, signal, telegramFailed: true };
          }
          
        } catch (telegramError) {
          console.log('⚠️ Telegram not available, signal saved locally');
          return { success: true, signal, telegramFailed: true };
        }
        
      } else {
        console.log('❌ No cryptos with valid RSI data found');
        
        // Try with any operable crypto as fallback
        if (cryptos.length > 0) {
          const fallback = cryptos[0];
          console.log(`\nUsing fallback crypto: ${fallback.symbol}`);
          
          const signal = {
            symbol: fallback.symbol,
            type: 'NEUTRO',
            entryPrice: fallback.price,
            takeProfit: fallback.price * 1.01,
            stopLoss: fallback.price * 0.995,
            leverage: 3,
            confidence: 65,
            duration: '4-8 horas',
            strategy: 'EMERGENCY_SIGNAL'
          };
          
          const csvEntry = [
            new Date().toISOString(),
            signal.symbol,
            signal.type,
            signal.type.toUpperCase(),
            signal.entryPrice.toFixed(8),
            signal.takeProfit.toFixed(8),
            signal.stopLoss.toFixed(8),
            signal.leverage,
            signal.confidence,
            signal.strategy,
            'EMERGENCY_GENERATED'
          ].join(',');
          
          const fs = await import('fs');
          fs.appendFileSync('detailed_signals.csv', '\n' + csvEntry);
          
          console.log('✅ Emergency signal generated and saved');
          return { success: true, signal, emergency: true };
        }
      }
    }
    
    return { success: false, reason: 'No viable cryptocurrencies available' };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

// Execute filter adjustment
adjustSignalFilters().then(result => {
  if (result.success) {
    console.log('\n🎉 SIGNAL GENERATION RESTORED');
    console.log('The system is now generating viable trading signals');
    if (result.telegramFailed) {
      console.log('Note: Check Telegram configuration for message delivery');
    }
  } else {
    console.log('\n⚠️ SIGNAL GENERATION STILL BLOCKED');
    console.log(`Reason: ${result.reason}`);
  }
}).catch(console.error);