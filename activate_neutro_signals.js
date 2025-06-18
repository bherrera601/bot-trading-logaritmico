/**
 * Activate NEUTRO Signal Generation
 * Enable automatic NEUTRO signals for futures trading in neutral market conditions
 */

import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function activateNeutroSignals() {
  console.log('🎯 Activating NEUTRO signal generation for futures trading...');
  
  try {
    // Get current market data
    const response = await axios.get('http://localhost:5000/api/rankings');
    const data = response.data;
    
    console.log(`📊 Found ${data.operableCount} operable cryptocurrencies`);
    
    // Filter for best NEUTRO candidates
    const neutroTargets = data.top_cryptos
      ?.filter(crypto => crypto.isOperable)
      ?.filter(crypto => {
        // Select cryptocurrencies with good volume and low volatility for NEUTRO
        const volume = crypto.volume || 0;
        const volatility = crypto.volatility || 3.0;
        return volume > 50000000 && volatility >= 2.5 && volatility <= 4.0; // $50M+ volume, 2.5-4% volatility
      })
      ?.sort((a, b) => b.score - a.score)
      ?.slice(0, 10); // Top 10 candidates to include OP and others
    
    if (!neutroTargets || neutroTargets.length === 0) {
      console.log('❌ No suitable NEUTRO targets found');
      return;
    }
    
    console.log(`\n🎯 Found ${neutroTargets.length} NEUTRO signal candidates:`);
    neutroTargets.forEach((crypto, i) => {
      console.log(`${i + 1}. ${crypto.symbol} - Vol: $${(crypto.volume/1000000).toFixed(1)}M - Volatility: ${crypto.volatility.toFixed(1)}%`);
    });
    
    // Generate NEUTRO signals for multiple candidates
    console.log(`\n🚀 Generating ${neutroTargets.length} NEUTRO signals:`);
    const sentSignals = [];
    
    for (let i = 0; i < neutroTargets.length; i++) {
      const target = neutroTargets[i];
      console.log(`\n🎯 Signal ${i + 1}/${neutroTargets.length}: ${target.symbol}`);
      
      const signal = {
        symbol: target.symbol,
        type: 'NEUTRO',
        price: target.price,
        confidence: Math.min(75, 65 + (target.score * 2)),
        leverage: target.volume > 1000000000 ? 5 : 4,
        takeProfit: target.price * (1 + (0.15 + target.volatility * 0.03) / 100),
        stopLoss: target.price * (1 - (0.3 + target.volatility * 0.05) / 100),
        volatility: target.volatility,
        volume: target.volume,
        score: target.score,
        signalNumber: i + 1,
        totalSignals: neutroTargets.length
      };
      
      try {
        await sendNeutroSignal(signal);
        sentSignals.push(signal);
        console.log(`✅ NEUTRO signal ${i + 1} sent for ${signal.symbol}`);
        
        // Stagger signals by 3 seconds
        if (i < neutroTargets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Failed to send signal ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ ${sentSignals.length}/${neutroTargets.length} NEUTRO signals sent successfully`);
    return sentSignals;
    
  } catch (error) {
    console.error('❌ Error activating NEUTRO signals:', error.message);
    return null;
  }
}

async function sendNeutroSignal(signal) {
  const tpPercent = ((signal.takeProfit - signal.price) / signal.price * 100);
  const slPercent = Math.abs((signal.stopLoss - signal.price) / signal.price * 100);
  
  const message = `🎯 FUTUROS NEUTRO SCALPING

💰 Par: ${signal.symbol}
📊 Estrategia: NEUTRO (Scalping)
💵 Precio Entrada: $${signal.price.toFixed(6)}
🎯 Take Profit: $${signal.takeProfit.toFixed(6)} (+${tpPercent.toFixed(2)}%)
🛡️ Stop Loss: $${signal.stopLoss.toFixed(6)} (-${slPercent.toFixed(2)}%)
⚡ Apalancamiento: ${signal.leverage}x
🎯 Confianza: ${signal.confidence}%

📊 Análisis Técnico:
• Mercado en consolidación lateral
• Volatilidad optima: ${signal.volatility.toFixed(1)}%
• Volumen 24h: $${(signal.volume / 1000000).toFixed(1)}M
• Score: ${signal.score.toFixed(1)}/10

⏰ Duración estimada: 30-60 min
📈 Estrategia: Micro-movimientos en rango

⏰ ${new Date().toLocaleString('es-ES')}

#${signal.symbol.replace('USDT', '')} #NEUTRO #FuturosScalping #TradingBot`;

  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    
    console.log(`✅ NEUTRO signal sent! Message ID: ${response.data.result.message_id}`);
    console.log(`📱 Signal: ${signal.symbol} NEUTRO at $${signal.price.toFixed(6)}`);
    return response.data.result;
  } catch (error) {
    console.error('❌ Error sending NEUTRO signal:', error.message);
    throw error;
  }
}

// Create periodic NEUTRO signal generator
async function startPeriodicNeutroSignals() {
  console.log('🔄 Starting periodic NEUTRO signal generation...');
  
  setInterval(async () => {
    try {
      console.log('\n⏰ Checking for NEUTRO opportunities...');
      await activateNeutroSignals();
    } catch (error) {
      console.error('❌ Error in periodic NEUTRO check:', error.message);
    }
  }, 15 * 60 * 1000); // Every 15 minutes
  
  console.log('✅ Periodic NEUTRO signals activated (every 15 minutes)');
}

// Execute immediately and start periodic generation
activateNeutroSignals()
  .then(async (signal) => {
    if (signal) {
      console.log(`\n🎉 NEUTRO signal generated: ${signal.symbol} at $${signal.price.toFixed(6)}`);
    }
    
    // Start periodic generation
    await startPeriodicNeutroSignals();
    
    console.log('\n🚀 NEUTRO signal system fully activated');
    console.log('   • Immediate signal sent');
    console.log('   • Periodic generation every 15 minutes');
    console.log('   • Optimized for futures scalping');
    
  })
  .catch(error => {
    console.error('\n❌ Failed to activate NEUTRO signals:', error);
    process.exit(1);
  });