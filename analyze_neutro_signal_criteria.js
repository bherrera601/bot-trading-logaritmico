/**
 * Analyze NEUTRO Signal Criteria
 * Investigate why only BTC NEUTRO was sent when 95 cryptos are operable
 */

import axios from 'axios';

async function analyzeNeutroSignalCriteria() {
  console.log('🔍 Analyzing NEUTRO signal criteria for all 95 operable cryptocurrencies...');
  
  try {
    const response = await axios.get('http://localhost:5000/api/rankings');
    const data = response.data;
    
    console.log(`📊 Total operable: ${data.operableCount}/${data.totalCount} cryptocurrencies`);
    
    // Analyze all operable cryptocurrencies for NEUTRO eligibility
    const neutroAnalysis = [];
    
    data.top_cryptos?.forEach((crypto, index) => {
      if (!crypto.isOperable) return;
      
      const volume = crypto.volume || 0;
      const volatility = crypto.volatility || 3.0;
      const price = crypto.price || 0;
      const spread = crypto.spread || 0.003;
      
      // Updated NEUTRO criteria from activate_neutro_signals.js
      const meetsVolumeCriteria = volume > 50000000; // $50M+
      const meetsVolatilityCriteria = volatility >= 2.5 && volatility <= 4.0; // 2.5-4%
      
      // Additional practical criteria
      const meetsPriceCriteria = price > 0.001; // Avoid micro-cap coins
      const meetsSpreadCriteria = spread < 0.01; // Max 1% spread
      
      const isNeutroEligible = meetsVolumeCriteria && meetsVolatilityCriteria && meetsPriceCriteria && meetsSpreadCriteria;
      
      neutroAnalysis.push({
        rank: index + 1,
        symbol: crypto.symbol,
        volume: volume,
        volatility: volatility,
        price: price,
        spread: spread,
        score: crypto.score,
        meetsVolumeCriteria,
        meetsVolatilityCriteria,
        meetsPriceCriteria,
        meetsSpreadCriteria,
        isNeutroEligible
      });
    });
    
    // Sort by eligibility and score
    neutroAnalysis.sort((a, b) => {
      if (a.isNeutroEligible !== b.isNeutroEligible) {
        return b.isNeutroEligible - a.isNeutroEligible;
      }
      return b.score - a.score;
    });
    
    const eligibleCount = neutroAnalysis.filter(crypto => crypto.isNeutroEligible).length;
    const ineligibleCount = neutroAnalysis.length - eligibleCount;
    
    console.log(`\n📈 NEUTRO Eligibility Analysis:`);
    console.log(`✅ Eligible for NEUTRO: ${eligibleCount} cryptocurrencies`);
    console.log(`❌ Not eligible: ${ineligibleCount} cryptocurrencies`);
    
    console.log(`\n🎯 Top 10 NEUTRO eligible cryptocurrencies:`);
    neutroAnalysis.filter(crypto => crypto.isNeutroEligible).slice(0, 10).forEach((crypto, i) => {
      console.log(`${i + 1}. ${crypto.symbol} - Vol: $${(crypto.volume/1000000).toFixed(1)}M - Volatility: ${crypto.volatility.toFixed(1)}% - Score: ${crypto.score.toFixed(1)}`);
    });
    
    if (eligibleCount > 1) {
      console.log(`\n🤔 WHY ONLY BTC WAS SENT:`);
      console.log(`The NEUTRO activation script only sends the TOP 1 signal (bestTarget = neutroTargets[0])`);
      console.log(`Even though ${eligibleCount} cryptocurrencies are eligible, only the highest-scored one is selected.`);
    }
    
    console.log(`\n❌ Reasons why ${ineligibleCount} cryptos are NOT eligible for NEUTRO:`);
    const reasons = {
      lowVolume: 0,
      highVolatility: 0,
      lowVolatility: 0,
      lowPrice: 0,
      highSpread: 0
    };
    
    neutroAnalysis.filter(crypto => !crypto.isNeutroEligible).forEach(crypto => {
      if (!crypto.meetsVolumeCriteria) reasons.lowVolume++;
      if (crypto.volatility > 4.0) reasons.highVolatility++;
      if (crypto.volatility < 2.5) reasons.lowVolatility++;
      if (!crypto.meetsPriceCriteria) reasons.lowPrice++;
      if (!crypto.meetsSpreadCriteria) reasons.highSpread++;
    });
    
    console.log(`   Low volume (<$50M): ${reasons.lowVolume} cryptos`);
    console.log(`   High volatility (>4%): ${reasons.highVolatility} cryptos`);
    console.log(`   Low volatility (<2.5%): ${reasons.lowVolatility} cryptos`);
    console.log(`   Low price (<$0.001): ${reasons.lowPrice} cryptos`);
    console.log(`   High spread (>1%): ${reasons.highSpread} cryptos`);
    
    console.log(`\n💡 SOLUTIONS TO GET MORE NEUTRO SIGNALS:`);
    console.log(`1. Send multiple NEUTRO signals (top 3-5 instead of just 1)`);
    console.log(`2. Relax volume criteria ($50M instead of $100M)`);
    console.log(`3. Expand volatility range (2.0%-5.0% instead of 2.5%-4.0%)`);
    console.log(`4. Increase signal frequency (every 10 minutes instead of 15)`);
    
    return {
      totalOperable: data.operableCount,
      neutroEligible: eligibleCount,
      reasons: reasons,
      topEligible: neutroAnalysis.filter(crypto => crypto.isNeutroEligible).slice(0, 5)
    };
    
  } catch (error) {
    console.error('❌ Error analyzing NEUTRO criteria:', error.message);
    return null;
  }
}

// Execute analysis
analyzeNeutroSignalCriteria()
  .then(result => {
    if (result) {
      console.log(`\n📋 SUMMARY:`);
      console.log(`Total operable: ${result.totalOperable}`);
      console.log(`NEUTRO eligible: ${result.neutroEligible}`);
      console.log(`Selection method: Only top 1 is sent`);
      
      if (result.neutroEligible > 1) {
        console.log(`\n🚀 RECOMMENDATION: Modify activation script to send multiple NEUTRO signals`);
        console.log(`This would utilize ${result.neutroEligible} eligible opportunities instead of just 1`);
      }
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });