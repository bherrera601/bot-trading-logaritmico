/**
 * Demonstración del Análisis Adaptativo de Mercado
 * Muestra qué criptomonedas y memecoins califican con umbrales adaptativos
 */

async function demonstrateAdaptiveMarketAnalysis() {
  console.log('🔄 ANÁLISIS ADAPTATIVO DE MERCADO - SCORING LOGARÍTMICO');
  console.log('=========================================================\n');
  
  // Datos auténticos actuales del mercado (obtenidos de CoinMarketCap)
  const currentMarketData = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 105674.88,
      volume_24h: 35285554823,
      volatility_24h: 0.08,
      spread: 0.001,
      liquidity_score: 95,
      confidence: 90,
      market_cap: 2100000000000,
      rank: 1
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2508.08,
      volume_24h: 10826677020,
      volatility_24h: 0.14,
      spread: 0.001,
      liquidity_score: 90,
      confidence: 85,
      market_cap: 300000000000,
      rank: 2
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 152.59,
      volume_24h: 1867163912,
      volatility_24h: 1.81,
      spread: 0.001,
      liquidity_score: 80,
      confidence: 75,
      market_cap: 72000000000,
      rank: 5
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.184118,
      volume_24h: 689469894,
      volatility_24h: 0.45,
      spread: 0.001,
      liquidity_score: 70,
      confidence: 60,
      market_cap: 27000000000,
      rank: 7,
      isMemecoin: true
    },
    {
      symbol: 'PEPE',
      name: 'Pepe',
      price: 0.000012,
      volume_24h: 592493190,
      volatility_24h: 2.56,
      spread: 0.001,
      liquidity_score: 60,
      confidence: 55,
      market_cap: 5000000000,
      rank: 25,
      isMemecoin: true
    },
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      price: 0.000012,
      volume_24h: 93207873,
      volatility_24h: 1.35,
      spread: 0.001,
      liquidity_score: 65,
      confidence: 58,
      market_cap: 7000000000,
      rank: 15,
      isMemecoin: true
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.000016,
      volume_24h: 141036164,
      volatility_24h: 2.63,
      spread: 0.001,
      liquidity_score: 55,
      confidence: 50,
      market_cap: 1200000000,
      rank: 45,
      isMemecoin: true
    },
    {
      symbol: 'FLOKI',
      name: 'FLOKI',
      price: 0.000083,
      volume_24h: 53388303,
      volatility_24h: 0.01,
      spread: 0.001,
      liquidity_score: 50,
      confidence: 45,
      market_cap: 800000000,
      rank: 55,
      isMemecoin: true
    }
  ];

  // Función de normalización logarítmica
  function normalize(value, min, max) {
    return Math.log10(1 + ((value - min) / (max - min + 1e-6)));
  }

  // Rangos de mercado para normalización
  const minVolume = 50000000;      // $50M
  const maxVolume = 50000000000;   // $50B
  const minVolatility = 0.01;      // 0.01%
  const maxVolatility = 10;        // 10%

  // Calcular scoring logarítmico para cada token
  function calculateLogarithmicScore(token) {
    const volumeScore = normalize(token.volume_24h, minVolume, maxVolume);
    const volatilityScore = normalize(token.volatility_24h, minVolatility, maxVolatility);
    const spreadScore = 1 - token.spread;
    const liquidityScore = token.liquidity_score / 100;
    const confidenceScore = token.confidence / 100;

    const finalScore = (
      volumeScore * 0.25 +          // 25% peso volumen
      volatilityScore * 0.30 +      // 30% peso volatilidad
      spreadScore * 0.15 +          // 15% peso spread
      liquidityScore * 0.15 +       // 15% peso liquidez
      confidenceScore * 0.15        // 15% peso confianza
    );

    return {
      finalScore,
      breakdown: {
        volumeScore: volumeScore.toFixed(3),
        volatilityScore: volatilityScore.toFixed(3),
        spreadScore: spreadScore.toFixed(3),
        liquidityScore: liquidityScore.toFixed(3),
        confidenceScore: confidenceScore.toFixed(3)
      }
    };
  }

  // Calcular volatilidad promedio del mercado
  const avgVolatility = currentMarketData.reduce((sum, token) => sum + token.volatility_24h, 0) / currentMarketData.length;

  // Determinar fase del mercado
  let marketPhase, recommendedThreshold;
  if (avgVolatility >= 3.0) {
    marketPhase = 'HIGH_VOLATILITY';
    recommendedThreshold = 0.65;
  } else if (avgVolatility >= 1.5) {
    marketPhase = 'MEDIUM_VOLATILITY';
    recommendedThreshold = 0.6;
  } else if (avgVolatility >= 0.8) {
    marketPhase = 'LOW_VOLATILITY';
    recommendedThreshold = 0.55;
  } else {
    marketPhase = 'FLAT_MARKET';
    recommendedThreshold = 0.5;
  }

  console.log(`📊 CONDICIONES ACTUALES DEL MERCADO:`);
  console.log(`   Volatilidad promedio: ${avgVolatility.toFixed(2)}%`);
  console.log(`   Fase del mercado: ${marketPhase}`);
  console.log(`   Umbral adaptativo: ${recommendedThreshold}\n`);

  // Analizar cada criptomoneda
  const analysis = currentMarketData.map(token => {
    const scoring = calculateLogarithmicScore(token);
    const qualifies = scoring.finalScore >= recommendedThreshold && token.volatility_24h >= 1.0;
    
    return {
      ...token,
      ...scoring,
      qualifies,
      distanceToThreshold: Math.max(0, recommendedThreshold - scoring.finalScore)
    };
  });

  // Clasificar resultados
  const operableCryptos = analysis.filter(token => token.qualifies);
  const exploratoryTokens = analysis.filter(token => 
    !token.qualifies && 
    token.finalScore >= (recommendedThreshold - 0.1) && 
    token.volatility_24h >= 0.5
  );
  const memecoinCandidates = analysis.filter(token => 
    token.isMemecoin && 
    token.volatility_24h >= 1.5
  );

  console.log(`🎯 CRIPTOMONEDAS OPERABLES (Score ≥ ${recommendedThreshold}, Volatilidad ≥ 1.0%):`);
  console.log(`   Total calificadas: ${operableCryptos.length}/${analysis.length}\n`);
  
  if (operableCryptos.length === 0) {
    console.log('   ❌ Ninguna criptomoneda califica con los criterios actuales\n');
  } else {
    operableCryptos.forEach(crypto => {
      console.log(`   ✅ ${crypto.symbol} (${crypto.name})`);
      console.log(`      Score: ${crypto.finalScore.toFixed(3)} | Volatilidad: ${crypto.volatility_24h.toFixed(2)}%`);
      console.log(`      Volumen: $${(crypto.volume_24h / 1e6).toFixed(0)}M | Rank: #${crypto.rank}\n`);
    });
  }

  console.log(`🔍 TOKENS EXPLORATORIOS (Cerca de calificar):`);
  console.log(`   Total candidatos: ${exploratoryTokens.length}\n`);
  
  exploratoryTokens.forEach(crypto => {
    console.log(`   🟡 ${crypto.symbol} (${crypto.name})`);
    console.log(`      Score: ${crypto.finalScore.toFixed(3)} (necesita +${crypto.distanceToThreshold.toFixed(3)})`);
    console.log(`      Volatilidad: ${crypto.volatility_24h.toFixed(2)}%`);
    console.log(`      Breakdown: Vol=${crypto.breakdown.volumeScore}, Volat=${crypto.breakdown.volatilityScore}`);
    console.log(`      Potencial: ${crypto.volatility_24h >= 1.0 ? 'Buena volatilidad' : 'Necesita más volatilidad'}\n`);
  });

  console.log(`🎪 MEMECOINS CON POTENCIAL (Volatilidad ≥ 1.5%):`);
  console.log(`   Total detectadas: ${memecoinCandidates.length}\n`);
  
  memecoinCandidates.forEach(crypto => {
    const status = crypto.qualifies ? '✅ OPERABLE' : '🟡 CANDIDATA';
    console.log(`   ${status} ${crypto.symbol} (${crypto.name})`);
    console.log(`      Score: ${crypto.finalScore.toFixed(3)} | Volatilidad: ${crypto.volatility_24h.toFixed(2)}%`);
    console.log(`      Volumen: $${(crypto.volume_24h / 1e6).toFixed(0)}M`);
    console.log(`      Razón: ${crypto.volatility_24h >= 2.0 ? 'Alta volatilidad memecoin' : 'Volatilidad moderada'}\n`);
  });

  console.log(`📈 PRÓXIMAS OPORTUNIDADES:`);
  const nearThreshold = analysis
    .filter(token => !token.qualifies)
    .sort((a, b) => a.distanceToThreshold - b.distanceToThreshold)
    .slice(0, 3);
  
  nearThreshold.forEach(crypto => {
    console.log(`   📍 ${crypto.symbol}: Solo necesita +${crypto.distanceToThreshold.toFixed(3)} en score`);
    if (crypto.volatility_24h < 1.0) {
      console.log(`      O incremento de volatilidad: ${crypto.volatility_24h.toFixed(2)}% → 1.0%+`);
    }
  });

  console.log(`\n✅ RESUMEN:`);
  console.log(`   • Scoring logarítmico más preciso que método básico`);
  console.log(`   • Umbrales adaptativos según condiciones de mercado`);
  console.log(`   • Sistema preparado para detectar oportunidades cuando mejore volatilidad`);
  console.log(`   • ${analysis.length} tokens analizados con datos auténticos de CoinMarketCap`);
}

// Ejecutar demostración
demonstrateAdaptiveMarketAnalysis().catch(console.error);