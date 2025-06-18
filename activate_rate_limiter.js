/**
 * Activate Emergency Rate Limiter
 */

require('./server/lib/emergencyRateLimiter.js');

console.log('🚨 Emergency rate limiter activated');
console.log('📊 Max calls per minute: 45 (conservative)');
console.log('🛡️ Emergency blocks: 2 minutes when exceeded');

// Generar señal de prueba después de activar
setTimeout(async () => {
  console.log('🎯 Testing signal generation with rate limiter...');
  
  try {
    const signal = {
      symbol: 'SOLUSDT',
      type: 'NEUTRO',
      entryPrice: 148,
      stopLoss: 151,
      takeProfit: 145,
      leverage: 5,
      confidence: 68,
      rsi: 48,
      reasoning: 'SOL en zona neutral (RSI 48), condiciones favorables para NEUTRO scalping'
    };

    const message = `🟡 SEÑAL NEUTRO

🪙 ${signal.symbol} ${signal.type}
💰 Entrada: $${signal.entryPrice}
🔴 Stop Loss: $${signal.stopLoss} (+2.0%)
🟢 Take Profit: $${signal.takeProfit} (-2.0%)
⚡ Apalancamiento: ${signal.leverage}x
📊 RSI: ${signal.rsi} (Neutral)
🎯 Confianza: ${signal.confidence}%

📝 ${signal.reasoning}

⏰ ${new Date().toLocaleString('es-ES')}
🛡️ Rate Limiter Protegido`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SOL NEUTRO signal sent - Message ID:', result.result.message_id);
    }

  } catch (error) {
    console.error('❌ Test signal error:', error.message);
  }
}, 3000);
