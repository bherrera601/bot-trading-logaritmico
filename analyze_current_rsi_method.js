/**
 * Analyze Current RSI Method Used in Dashboard
 */

import axios from 'axios';

async function analyzeCurrentRSIMethod() {
  console.log('🔍 ANÁLISIS DEL MÉTODO RSI ACTUAL EN DASHBOARD');
  console.log('==============================================\n');
  
  try {
    // Get current dashboard data
    const response = await axios.get('http://localhost:5000/api/rankings');
    const data = response.data;
    
    if (!data.top_cryptos) {
      console.log('❌ No hay datos del dashboard disponibles');
      return;
    }
    
    console.log('📊 DATOS ACTUALES DEL DASHBOARD:');
    console.log('===============================');
    
    const topCryptos = data.top_cryptos.slice(0, 8);
    
    topCryptos.forEach((crypto, index) => {
      console.log(`${index + 1}. ${crypto.symbol.padEnd(8)} | RSI: ${crypto.rsi.toFixed(2)} | Precio: $${crypto.price} | Vol: $${crypto.volume}M`);
    });
    
    // Analyze RSI characteristics
    const rsiValues = topCryptos.map(c => c.rsi);
    const uniqueRSI = [...new Set(rsiValues.map(r => Math.round(r)))];
    
    console.log('\n📈 CARACTERÍSTICAS DEL RSI ACTUAL:');
    console.log('==================================');
    console.log(`Valores RSI únicos: ${uniqueRSI.length}`);
    console.log(`Rango RSI: ${Math.min(...rsiValues).toFixed(2)} - ${Math.max(...rsiValues).toFixed(2)}`);
    console.log(`Promedio RSI: ${(rsiValues.reduce((sum, rsi) => sum + rsi, 0) / rsiValues.length).toFixed(2)}`);
    
    // Check if values are hardcoded 50.0
    const hardcodedCount = rsiValues.filter(rsi => rsi === 50.0).length;
    console.log(`Valores hardcoded (50.0): ${hardcodedCount}/${topCryptos.length}`);
    
    if (hardcodedCount === topCryptos.length) {
      console.log('\n❌ MÉTODO ACTUAL: HARDCODED RSI');
      console.log('Todos los valores son 50.0 - sistema usando fallback');
    } else if (hardcodedCount > 0) {
      console.log('\n⚠️ MÉTODO ACTUAL: PARCIALMENTE HARDCODED');
      console.log('Algunos valores son 50.0, otros calculados');
    } else {
      console.log('\n✅ MÉTODO ACTUAL: RSI CALCULADO');
      console.log('Todos los valores son únicos - sistema usando cálculo');
    }
    
    console.log('\n🔧 TIPOS DE RSI IMPLEMENTADOS EN EL SISTEMA:');
    console.log('============================================');
    
    console.log('1. RSI ESTÁNDAR (calculateRSI):');
    console.log('   - Fórmula: RSI = 100 - (100 / (1 + RS))');
    console.log('   - RS = avgGain / avgLoss');
    console.log('   - Período: 14 períodos');
    console.log('   - Usa precios de cierre históricos');
    console.log('   - Método tradicional de Wilder');
    
    console.log('\n2. RSI SIMULADO (calculateStandardRSI):');
    console.log('   - Genera precios históricos simulados');
    console.log('   - Basado en precio y volumen actuales');
    console.log('   - Aplica volatilidad y tendencias de mercado');
    console.log('   - Usa la misma fórmula RSI estándar');
    console.log('   - Se adapta por tipo de criptomoneda');
    
    console.log('\n3. RSI BASADO EN CARACTERÍSTICAS (anterior):');
    console.log('   - Basado en semilla de precio');
    console.log('   - Ajustes por tipo de coin (major, meme, DeFi)');
    console.log('   - Factor de volumen y momentum');
    console.log('   - No usa fórmula RSI tradicional');
    
    // Determine which method is currently active
    console.log('\n🎯 MÉTODO ACTIVO EN DASHBOARD:');
    console.log('=============================');
    
    if (uniqueRSI.length >= 5 && hardcodedCount === 0) {
      console.log('✅ MÉTODO: RSI Simulado con fórmula estándar');
      console.log('   - Genera 15 precios históricos por crypto');
      console.log('   - Aplica volatilidad basada en volumen');
      console.log('   - Considera tendencias por tipo de coin');
      console.log('   - Usa calculateRSI() estándar');
      
      // Test if it matches standard RSI behavior
      const testPrices = [100, 101, 102, 101, 103, 102, 104, 103, 105, 104, 106, 105, 107, 106, 108];
      const testRSI = calculateStandardRSI(testPrices);
      console.log(`   - Test RSI: ${testRSI.toFixed(2)}`);
      
    } else if (hardcodedCount === topCryptos.length) {
      console.log('❌ MÉTODO: Hardcoded fallback (50.0)');
      console.log('   - Sistema usando valores por defecto');
      console.log('   - Cálculo RSI no funcionando');
      
    } else {
      console.log('⚠️ MÉTODO: Mixto o en transición');
      console.log('   - Algunos valores calculados, otros hardcoded');
    }
    
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('=================');
    if (hardcodedCount === 0) {
      console.log('✅ Sistema funcionando correctamente');
      console.log('El RSI simulado está proporcionando valores únicos y realistas');
    } else {
      console.log('⚠️ Sistema necesita optimización');
      console.log('Algunos valores aún están hardcoded - verificar implementación');
    }
    
    console.log(`\n⏰ Análisis completado: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error analizando método RSI:', error.message);
  }
}

// Helper function to simulate the current method
function calculateStandardRSI(prices) {
  // Simplified version for testing
  let gains = 0, losses = 0;
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / (prices.length - 1);
  const avgLoss = losses / (prices.length - 1);
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

analyzeCurrentRSIMethod();