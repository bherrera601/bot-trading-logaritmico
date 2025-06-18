/**
 * Auditoría de Señales del Día - Análisis TP vs SL
 * Analiza qué señales de hoy cumplieron Take Profit vs Stop Loss
 */

import fs from 'fs';
import path from 'path';

async function auditTodaySignals() {
    console.log('\n🔍 AUDITORÍA DE SEÑALES DEL DÍA - 14 JUNIO 2025');
    console.log('═══════════════════════════════════════════════════════════');
    
    try {
        // Analizar múltiples fuentes de datos
        const today = '2025-06-14';
        console.log(`📅 Analizando señales del día: ${today}`);
        
        let allSignals = [];
        
        // 1. Revisar detailed_signals.csv
        const detailedPath = './detailed_signals.csv';
        if (fs.existsSync(detailedPath)) {
            console.log('\n📋 Analizando detailed_signals.csv...');
            const detailedData = fs.readFileSync(detailedPath, 'utf8');
            const detailedLines = detailedData.split('\n').filter(line => line.trim());
            
            for (let i = 1; i < detailedLines.length; i++) {
                const line = detailedLines[i];
                if (line.includes(today)) {
                    const parts = line.split(',');
                    if (parts.length >= 10) {
                        allSignals.push({
                            timestamp: parts[0],
                            symbol: parts[1],
                            entry_price: parseFloat(parts[2]),
                            take_profit: parseFloat(parts[3]),
                            stop_loss: parseFloat(parts[4]),
                            direction: parts[5],
                            confidence: parts[6],
                            leverage: parts[7],
                            strategy: parts[9],
                            source: 'detailed_signals'
                        });
                    }
                }
            }
        }
        
        // 2. Revisar historial_senales.csv 
        const historialPath = './historial_senales.csv';
        if (fs.existsSync(historialPath)) {
            console.log('📋 Analizando historial_senales.csv...');
            const historialData = fs.readFileSync(historialPath, 'utf8');
            const historialLines = historialData.split('\n').filter(line => line.trim());
            
            for (let i = 1; i < historialLines.length; i++) {
                const line = historialLines[i];
                if (line.includes(today)) {
                    const parts = line.split(',');
                    if (parts.length >= 6) {
                        allSignals.push({
                            timestamp: parts[0],
                            symbol: parts[1],
                            entry_price: parseFloat(parts[4]) || 0,
                            take_profit: parseFloat(parts[5]) || 0,
                            stop_loss: parseFloat(parts[8]) || 0,
                            direction: parts[3],
                            confidence: parts[9] || '0',
                            strategy: parts[2] || 'UNKNOWN',
                            source: 'historial_senales'
                        });
                    }
                }
            }
        }
        
        // Revisar signal_protection_log.csv para ver señales bloqueadas
        const protectionPath = './signal_protection_log.csv';
        let blockedCount = 0;
        if (fs.existsSync(protectionPath)) {
            const protectionData = fs.readFileSync(protectionPath, 'utf8');
            const protectionLines = protectionData.split('\n').filter(line => line.includes(today));
            blockedCount = protectionLines.length;
            
            if (blockedCount > 0) {
                const blockedBySymbol = {};
                const blockedReasons = {};
                
                protectionLines.forEach(line => {
                    const parts = line.split(',');
                    if (parts.length >= 3) {
                        const symbol = parts[1];
                        const reason = parts[parts.length - 1];
                        
                        blockedBySymbol[symbol] = (blockedBySymbol[symbol] || 0) + 1;
                        blockedReasons[reason] = (blockedReasons[reason] || 0) + 1;
                    }
                });
                
                console.log(`\n⚠️ Señales bloqueadas por sistema de protección: ${blockedCount}`);
                console.log('\n📊 ANÁLISIS DE SEÑALES BLOQUEADAS:');
                console.log('─'.repeat(60));
                
                console.log('\n🚫 Por símbolo:');
                Object.entries(blockedBySymbol).forEach(([symbol, count]) => {
                    console.log(`   ${symbol}: ${count} señales bloqueadas`);
                });
                
                console.log('\n🚫 Razones principales:');
                Object.entries(blockedReasons).slice(0, 3).forEach(([reason, count]) => {
                    const shortReason = reason.length > 60 ? reason.substring(0, 60) + '...' : reason;
                    console.log(`   ${count}x: ${shortReason}`);
                });
            }
        }
        
        console.log(`\n📊 Total de señales encontradas hoy: ${allSignals.length}`);
        console.log(`📊 Señales válidas ejecutadas: ${allSignals.length}`);
        console.log(`🚫 Señales bloqueadas: ${blockedCount}`);
        
        if (allSignals.length === 0) {
            console.log('\n⚠️ No se ejecutaron señales válidas durante el día de hoy');
            console.log('💡 Esto indica que el sistema de protección está funcionando correctamente');
            console.log('   bloqueando señales con problemas de configuración.');
            return;
        }
        
        // Analizar cada señal válida encontrada
        let tpReached = 0;
        let slReached = 0;
        let pending = 0;
        let totalPnL = 0;
        
        console.log('\n📋 ANÁLISIS DETALLADO DE SEÑALES:');
        console.log('─'.repeat(100));
        
        for (const signal of allSignals) {
            const symbol = signal.symbol || 'N/A';
            const direction = signal.direction || 'N/A';
            const entryPrice = signal.entry_price || 0;
            const takeProfit = signal.take_profit || 0;
            const stopLoss = signal.stop_loss || 0;
            const confidence = signal.confidence || 'N/A';
            const timestamp = signal.timestamp || 'N/A';
            const strategy = signal.strategy || 'N/A';
            
            // Obtener precio actual para verificar estado
            const currentPrice = await getCurrentPrice(symbol.replace('USDT', ''));
            let currentStatus = 'PENDING';
            let estimatedPnL = 0;
            
            if (currentPrice && entryPrice > 0 && takeProfit > 0 && stopLoss > 0) {
                // Verificar si alcanzó TP o SL
                if (direction === 'LONG') {
                    if (currentPrice >= takeProfit) {
                        currentStatus = 'TP_REACHED';
                        estimatedPnL = ((takeProfit - entryPrice) / entryPrice) * 100;
                    } else if (currentPrice <= stopLoss) {
                        currentStatus = 'SL_REACHED';
                        estimatedPnL = ((stopLoss - entryPrice) / entryPrice) * 100;
                    } else {
                        estimatedPnL = ((currentPrice - entryPrice) / entryPrice) * 100;
                    }
                } else if (direction === 'SHORT') {
                    if (currentPrice <= takeProfit) {
                        currentStatus = 'TP_REACHED';
                        estimatedPnL = ((entryPrice - takeProfit) / entryPrice) * 100;
                    } else if (currentPrice >= stopLoss) {
                        currentStatus = 'SL_REACHED';
                        estimatedPnL = ((entryPrice - stopLoss) / entryPrice) * 100;
                    } else {
                        estimatedPnL = ((entryPrice - currentPrice) / entryPrice) * 100;
                    }
                } else if (direction === 'NEUTRO') {
                    // Para NEUTRO, verificar si se movió en cualquier dirección
                    const upperTarget = Math.max(takeProfit, stopLoss);
                    const lowerTarget = Math.min(takeProfit, stopLoss);
                    
                    if (currentPrice >= upperTarget || currentPrice <= lowerTarget) {
                        if (Math.abs(currentPrice - takeProfit) < Math.abs(currentPrice - stopLoss)) {
                            currentStatus = 'TP_REACHED';
                            estimatedPnL = Math.abs(((takeProfit - entryPrice) / entryPrice) * 100);
                        } else {
                            currentStatus = 'SL_REACHED';
                            estimatedPnL = -Math.abs(((stopLoss - entryPrice) / entryPrice) * 100);
                        }
                    } else {
                        estimatedPnL = ((currentPrice - entryPrice) / entryPrice) * 100;
                    }
                }
            }
            
            // Contar resultados
            if (currentStatus === 'TP_REACHED') {
                tpReached++;
                totalPnL += estimatedPnL;
            } else if (currentStatus === 'SL_REACHED') {
                slReached++;
                totalPnL += estimatedPnL; // Ya es negativo
            } else {
                pending++;
            }
            
            // Mostrar detalles
            const statusEmoji = getStatusEmoji(currentStatus);
            const pnlDisplay = estimatedPnL ? `${estimatedPnL.toFixed(2)}%` : 'N/A';
            const timeOnly = timestamp.split('T')[1]?.split('.')[0] || timestamp.split(' ')[1] || 'N/A';
            
            console.log(`${statusEmoji} ${symbol} ${direction} | Entry: $${entryPrice.toFixed(6)} | TP: $${takeProfit.toFixed(6)} | SL: $${stopLoss.toFixed(6)}`);
            console.log(`   Status: ${currentStatus} | PnL: ${pnlDisplay} | Confianza: ${confidence} | ${timeOnly} | ${strategy}`);
            
            if (currentPrice) {
                console.log(`   Precio actual: $${currentPrice.toFixed(6)} | Variación: ${estimatedPnL.toFixed(2)}%`);
            }
            console.log('');
        }
        
        // Resumen estadístico
        console.log('\n📈 RESUMEN ESTADÍSTICO DEL DÍA:');
        console.log('═══════════════════════════════════════════');
        console.log(`✅ Señales que alcanzaron TP: ${tpReached} (${allSignals.length > 0 ? ((tpReached/allSignals.length)*100).toFixed(1) : 0}%)`);
        console.log(`❌ Señales que alcanzaron SL: ${slReached} (${allSignals.length > 0 ? ((slReached/allSignals.length)*100).toFixed(1) : 0}%)`);
        console.log(`⏳ Señales pendientes: ${pending} (${allSignals.length > 0 ? ((pending/allSignals.length)*100).toFixed(1) : 0}%)`);
        console.log(`💰 PnL total estimado: ${totalPnL.toFixed(2)}%`);
        console.log(`📊 Win Rate: ${(tpReached + slReached) > 0 ? ((tpReached/(tpReached+slReached))*100).toFixed(1) : 'N/A'}%`);
        
        // Análisis por tipo de señal
        const signalTypes = {};
        allSignals.forEach(signal => {
            const direction = signal.direction || 'N/A';
            if (!signalTypes[direction]) {
                signalTypes[direction] = { total: 0, tp: 0, sl: 0, pending: 0 };
            }
            signalTypes[direction].total++;
            
            // Determinar estado actual basado en precios
            const currentPrice = getCurrentPrice(signal.symbol.replace('USDT', ''));
            let status = 'PENDING';
            
            if (currentPrice && signal.entry_price > 0 && signal.take_profit > 0 && signal.stop_loss > 0) {
                if (direction === 'LONG') {
                    if (currentPrice >= signal.take_profit) status = 'TP_REACHED';
                    else if (currentPrice <= signal.stop_loss) status = 'SL_REACHED';
                } else if (direction === 'SHORT') {
                    if (currentPrice <= signal.take_profit) status = 'TP_REACHED';
                    else if (currentPrice >= signal.stop_loss) status = 'SL_REACHED';
                }
            }
            
            if (status === 'TP_REACHED') signalTypes[direction].tp++;
            else if (status === 'SL_REACHED') signalTypes[direction].sl++;
            else signalTypes[direction].pending++;
        });
        
        console.log('\n📊 ANÁLISIS POR TIPO DE SEÑAL:');
        console.log('─'.repeat(50));
        for (const [direction, stats] of Object.entries(signalTypes)) {
            const winRate = stats.tp + stats.sl > 0 ? ((stats.tp / (stats.tp + stats.sl)) * 100).toFixed(1) : 'N/A';
            console.log(`${direction}: ${stats.total} señales | TP: ${stats.tp} | SL: ${stats.sl} | Win Rate: ${winRate}%`);
        }
        
        // Recomendaciones
        console.log('\n💡 RECOMENDACIONES:');
        console.log('─'.repeat(50));
        
        if (tpReached > slReached) {
            console.log('✅ Buen desempeño general - más señales alcanzaron TP que SL');
        } else if (slReached > tpReached) {
            console.log('⚠️ Revisar estrategia - más señales alcanzaron SL que TP');
            console.log('   • Considerar ajustar los niveles de TP/SL');
            console.log('   • Revisar criterios de entrada');
        }
        
        if (pending > 0) {
            console.log(`⏳ ${pending} señales aún pendientes - monitorear de cerca`);
        }
        
    } catch (error) {
        console.error('❌ Error en auditoría:', error.message);
    }
}

async function getCurrentPrice(symbol) {
    try {
        // Simular obtención de precio actual
        // En implementación real, aquí se haría llamada a API
        const mockPrices = {
            'BTC': 105989.89,
            'ETH': 2569.68,
            'SOL': 148.43,
            'ADA': 0.6393,
            'DOGE': 0.1794,
            'SHIB': 0.00001348,
            'PEPE': 0.00001047,
            'FLOKI': 0.0001118,
            'BONK': 0.00001698
        };
        
        return mockPrices[symbol] || null;
    } catch (error) {
        return null;
    }
}

function getStatusEmoji(status) {
    switch (status) {
        case 'TP_REACHED': return '🎯';
        case 'SL_REACHED': return '🛑';
        case 'PENDING': return '⏳';
        default: return '❓';
    }
}

// Ejecutar auditoría
auditTodaySignals().catch(console.error);