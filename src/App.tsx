/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  TrendingUp, 
  Dices, 
  DollarSign, 
  Users, 
  Info,
  RotateCcw,
  Play,
  Trophy,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Constants from provided PDF ---
const TOTAL_STICKERS = 980;
const STICKERS_PER_PACK = 7;
const PACK_PRICE = 25; // MXN
const ALBUM_PRICE_SOFT = 99; // MXN

// --- Types ---
type Step = 'intro' | 'central' | 'facets' | 'dispersion' | 'stats_lab' | 'montecarlo_intro' | 'probability_curves' | 'law_of_large_numbers' | 'montecarlo' | 'results' | 'mc_explicacion';

// --- Components ---

const MCExplicacion = ({ onRestartClass }: { onRestartClass: () => void }) => {
  const [activeStep, setActiveStep] = useState(1);

  // --- Step 1 State ---
  const [isP1Simulating, setIsP1Simulating] = useState(false);
  const [p1Result, setP1Result] = useState<{
    unique: number;
    duplicates: number;
    percent: string;
    packs: number;
    totalStickers: number;
  } | null>(null);

  const handleP1Simulate = () => {
    setIsP1Simulating(true);
    setTimeout(() => {
      const collected = new Set<number>();
      const totalStickersToOpen = 140 * 7;
      for (let i = 0; i < totalStickersToOpen; i++) {
        const item = Math.floor(Math.random() * 980);
        collected.add(item);
      }
      setP1Result({
        unique: collected.size,
        duplicates: totalStickersToOpen - collected.size,
        percent: ((collected.size / 980) * 100).toFixed(1),
        packs: 140,
        totalStickers: totalStickersToOpen
      });
      setIsP1Simulating(false);
    }, 600);
  };

  // --- Step 2 State ---
  const [p2Commutes, setP2Commutes] = useState<{ day: number; scenario: string; time: number }[]>([]);
  const p2Average = useMemo(() => {
    if (p2Commutes.length === 0) return 0;
    return Math.round(p2Commutes.reduce((acc, c) => acc + c.time, 0) / p2Commutes.length);
  }, [p2Commutes]);

  const handleP2SimulateCommute = () => {
    const scenarios = [
      { name: "☀️ Despejado (Normal)", base: 20, dev: 3 },
      { name: "🚗 Accidente en la avenida", base: 45, dev: 8 },
      { name: "🌧️ Lluvia torrencial", base: 35, dev: 6 },
      { name: "🚦 Semáforo descompuesto", base: 28, dev: 4 },
      { name: "🌾 Día festivo (Vacío)", base: 15, dev: 2 }
    ];
    const r = Math.random();
    let selected = scenarios[0];
    if (r > 0.45 && r <= 0.65) selected = scenarios[1];
    else if (r > 0.65 && r <= 0.80) selected = scenarios[2];
    else if (r > 0.80 && r <= 0.93) selected = scenarios[3];
    else if (r > 0.93) selected = scenarios[4];

    const val = Math.max(10, selected.base + Math.round((Math.random() * 2 - 1) * selected.dev));
    setP2Commutes(prev => [...prev, { day: prev.length + 1, scenario: selected.name, time: val }]);
  };

  const handleP2Clear = () => setP2Commutes([]);

  // --- Step 3 State ---
  const [miniAlbum, setMiniAlbum] = useState<boolean[]>([false, false, false, false, false]);
  const [miniLogs, setMiniLogs] = useState<{
    packNum: number;
    cards: number[];
    newCards: number[];
    totalUnique: number;
    cost: number;
  }[]>([]);
  const isMiniCompleted = useMemo(() => miniAlbum.every(v => v), [miniAlbum]);

  const handleBuyMiniPack = () => {
    if (isMiniCompleted) return;
    const packNum = miniLogs.length + 1;
    const card1 = Math.floor(Math.random() * 5) + 1;
    const card2 = Math.floor(Math.random() * 5) + 1;
    const cards = [card1, card2];
    
    const newCards: number[] = [];
    const nextAlbum = [...miniAlbum];
    cards.forEach(c => {
      const idx = c - 1;
      if (!nextAlbum[idx]) {
        nextAlbum[idx] = true;
        newCards.push(c);
      }
    });

    setMiniAlbum(nextAlbum);
    setMiniLogs(prev => [
      ...prev,
      {
        packNum,
        cards,
        newCards,
        totalUnique: nextAlbum.filter(v => v).length,
        cost: packNum * 25
      }
    ]);
  };

  useEffect(() => {
    if (isMiniCompleted && miniLogs.length > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [isMiniCompleted, miniLogs.length]);

  const handleResetMini = () => {
    setMiniAlbum([false, false, false, false, false]);
    setMiniLogs([]);
  };

  // --- Step 4 State ---
  const [trialsCount, setTrialsCount] = useState(100);
  const [p3SimResults, setP3SimResults] = useState<{
    avgPacks: number;
    avgCost: number;
    minPacks: number;
    maxPacks: number;
    simulationsRun: number;
    history: number[];
  } | null>(null);
  const [isP3Simulating, setIsP3Simulating] = useState(false);

  const handleRunP3Massive = () => {
    setIsP3Simulating(true);
    setTimeout(() => {
      let totalPacks = 0;
      let minPacks = Infinity;
      let maxPacks = -Infinity;
      const history: number[] = [];

      for (let s = 0; s < trialsCount; s++) {
        const album = new Set<number>();
        let packs = 0;
        while (album.size < 5) {
          packs++;
          album.add(Math.floor(Math.random() * 5) + 1);
          album.add(Math.floor(Math.random() * 5) + 1);
        }
        totalPacks += packs;
        history.push(packs);
        if (packs < minPacks) minPacks = packs;
        if (packs > maxPacks) maxPacks = packs;
      }

      setP3SimResults({
        avgPacks: totalPacks / trialsCount,
        avgCost: (totalPacks / trialsCount) * 25,
        minPacks,
        maxPacks,
        simulationsRun: trialsCount,
        history
      });
      setIsP3Simulating(false);
    }, 400);
  };

  // --- Step 5 State ---
  const [ownedStickers, setOwnedStickers] = useState(500);
  const p5Stats = useMemo(() => {
    const missing = 980 - ownedStickers;
    if (missing <= 0) return { probNewSingle: 0, probPack: 0, expectedPacks: 0 };
    const probNewSingle = missing / 980;
    const probPack = 1 - Math.pow(ownedStickers / 980, STICKERS_PER_PACK);
    const expectedPacks = 1 / probPack;
    return {
      probNewSingle: probNewSingle * 100,
      probPack: probPack * 100,
      expectedPacks
    };
  }, [ownedStickers]);

  // --- Step 6 State ---
  const [p6GroupSize, setP6GroupSize] = useState<1 | 2 | 5>(1);
  const p6Stats = useMemo(() => {
    if (p6GroupSize === 1) {
      return { cost: 32500, packs: 1300, info: "Estás completamente solo. Te quedas con todas tus repetidísimas leyendas sin piedad." };
    } else if (p6GroupSize === 2) {
      return { cost: 18200, packs: 728, info: "Compartes repetidas con 1 amigo. La probabilidad de que tus repetidas le sirvan a él, y viceversa, es alta reduciendo gastos casi a la mitad." };
    } else {
      return { cost: 9600, packs: 384, info: "¡Gran Sinergia! Con un grupo de 5 amigos cooperando, el excedente se divide eficientemente y cada cromo beneficiará a alguno de tus compañeros." };
    }
  }, [p6GroupSize]);

  const stepsList = [
    { num: 1, title: "1. El Problema", icon: BookOpen },
    { num: 2, title: "2. ¿Qué es Monte Carlo?", icon: Dices },
    { num: 3, title: "3. Aplicar al Álbum", icon: Play },
    { num: 4, title: "4. ¿Por qué funciona?", icon: TrendingUp },
    { num: 5, title: "5. Álbum 2026", icon: Calculator },
    { num: 6, title: "6. Realidad e Intercambios", icon: Users }
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-serif italic font-black text-slate-900">Paso 1: Entender el Problema</h3>
            <p className="font-serif italic text-lg text-slate-700 leading-relaxed">
              Pregunta clave: <strong>"¿Cuánto me costará en promedio completar el álbum de Panini si cada sobre tiene 7 estampas aleatorias y cuesta $25 MXN?"</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 block mb-1">Total Estampas Únicas</span>
                <span className="text-3xl font-black italic font-serif text-slate-900">980</span>
              </div>
              <div className="bg-slate-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 block mb-1">Cromos por Sobre</span>
                <span className="text-3xl font-black italic font-serif text-slate-900">7</span>
              </div>
              <div className="bg-slate-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 block mb-1">Precio por Sobre</span>
                <span className="text-3xl font-black italic font-serif text-emerald-600">$25 MXN</span>
              </div>
            </div>
            <div className="bg-amber-50 border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black uppercase text-amber-800 text-sm flex items-center gap-2"><Info size={16} /> ¿Dónde está la dificultad?</h4>
              <p className="text-sm leading-relaxed text-amber-950 font-medium">
                No es solo comprar <strong>980 / 7 ≈ 140 sobres</strong> (que costarían <strong>$3,500 MXN</strong>). 
                La probabilidad de obtener estampas repetidas crece exponencialmente a medida que tu álbum se llena. Necesitamos un método sólido para estimar el costo real.
              </p>
              <div className="pt-2">
                <Button variant="outline" disabled={isP1Simulating} onClick={handleP1Simulate} className="bg-white border-black text-black">
                  {isP1Simulating ? "Abriendo Sobres..." : "Abrir 140 Sobres de Prueba"}
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {p1Result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950 text-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <h4 className="text-amber-400 font-serif italic text-2xl mb-2">Simulación de tu primer intento (140 sobres):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-emerald-400 block font-bold">Sobres Abiertos:</span>
                      <span className="text-lg font-black text-white">{p1Result.packs}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">Estampas Totales:</span>
                      <span className="text-lg font-black text-white">{p1Result.totalStickers}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">Estampas Únicas:</span>
                      <span className="text-lg font-black text-emerald-400">{p1Result.unique} / 980</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">Estampas Repetidas:</span>
                      <span className="text-lg font-black text-rose-400">{p1Result.duplicates} ({((p1Result.duplicates / p1Result.totalStickers)*100).toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-4 border-2 border-black mt-4 overflow-hidden relative">
                    <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${p1Result.percent}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{p1Result.percent}% COMPLETADO</span>
                  </div>
                  <p className="text-xs italic text-slate-300 mt-4 leading-normal">
                    ¿Ves? Con 140 sobres (980 estampas en total) solo llenaste un {p1Result.percent}% del álbum. Las otras {p1Result.duplicates} estampas fueron completamente repetidas. ¡Por eso necesitamos a Monte Carlo!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-serif italic font-black text-slate-900">Paso 2: ¿Qué es una Simulación de Monte Carlo?</h3>
            <div className="border-l-4 border-emerald-500 pl-4 py-1 italic text-slate-700 font-serif text-lg leading-relaxed">
              "Montecarlo es como jugar a la ruleta (de ahí el nombre, por el casino de Mónaco). Simulación = Repetir un experimento muchas veces para ver qué pasa en promedio."
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Definición sencilla:</strong> "Es un método para resolver problemas difíciles usando azares controlados (como tirar dados o abrir sobres de estampas) y repetirlo miles de veces en una computadora para ver qué pasa en promedio."
            </p>
            <div className="bg-slate-50 border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black uppercase text-xs tracking-widest text-slate-500">Ejemplo de Tránsito Cotidiano</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supón que quieres saber cuánto tardarás en llegar a la escuela considerando el tráfico. 
                Si simulas 5 viajes con diferentes condiciones de tráfico (lluvias, incidentes, despejado), el promedio te dará una estimación muy madura.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleP2SimulateCommute} className="bg-white border-black text-black">
                  🚗 Simular Viaje de un Día
                </Button>
                {p2Commutes.length > 0 && (
                  <Button variant="outline" onClick={handleP2Clear} className="border-rose-500 text-rose-500 bg-white">
                    Limpiar Historial
                  </Button>
                )}
              </div>
              {p2Commutes.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black text-white p-4 border-2 border-black flex flex-col justify-center items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-[10px] uppercase font-black text-emerald-400">Promedio de Viaje (Estimado MC)</span>
                      <span className="text-3xl font-serif italic font-black text-white">{p2Average} minutos</span>
                      <span className="text-[9px] font-mono opacity-80 mt-1">Con base en {p2Commutes.length} viajes simulados</span>
                    </div>
                    <div className="max-h-[120px] overflow-y-auto border-2 border-black bg-white p-3 space-y-1 font-mono text-[10px]">
                      {p2Commutes.map((c, i) => (
                        <div key={i} className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                          <span>Viaje #{c.day}: {c.scenario}</span>
                          <span className="font-bold text-emerald-600">{c.time} mins</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-serif italic font-black text-slate-900">Paso 3: Aplicarlo al Álbum de Panini</h3>
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-tighter text-emerald-600 text-sm">🔹 Paso 3.1: Definir las Reglas del Juego</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 font-medium leading-normal">
                <li>Cada sobre tiene 7 estampas aleatorias (pueden ser repetidas).</li>
                <li>Empiezas con 0 estampas pegadas.</li>
                <li>Compras un sobre, abres las 7 estampas y las agregas a tu colección (las repetidas se descartan).</li>
                <li>Repites hasta tener las 980 estampas únicas.</li>
              </ul>
            </div>

            <div className="border-t-2 border-black/10 pt-6">
              <h4 className="font-black uppercase tracking-tighter text-blue-600 text-sm mb-3">🔹 Paso 3.2: Simular un Intento Simplificado (Ejemplo Manual)</h4>
              <p className="text-xs text-slate-500 mb-4 font-medium">Visualizaremos el proceso interactivo real con un mini-álbum de <strong>5 cromos totales</strong> y <strong>2 estampas por sobre</strong> (costo de $25 por sobre):</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                {/* Album Slots */}
                <div className="lg:col-span-5 space-y-4 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-black text-slate-400">Álbum de 5 Cromos</span>
                  <div className="flex justify-between gap-2">
                    {miniAlbum.map((pegado, i) => (
                      <div 
                        key={i} 
                        className={`w-12 h-16 border-2 border-black flex flex-col items-center justify-center font-black text-xs shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          pegado ? 'bg-emerald-500 text-white translate-y-[-2px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-solid' : 'bg-white text-slate-300 border-dashed border-slate-300'
                        }`}
                      >
                        <span className="text-[8px] opacity-70">SLOT</span>
                        <span className="text-lg">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={isMiniCompleted ? "outline" : "primary"} 
                      onClick={handleBuyMiniPack} 
                      disabled={isMiniCompleted}
                      className="w-full text-xs py-2 h-10"
                    >
                      {isMiniCompleted ? "¡Completado! 🎉" : "🛒 Comprar Sobre ($25)"}
                    </Button>
                    <Button variant="outline" onClick={handleResetMini} className="text-xs py-2 h-10 bg-white">
                      Reiniciar
                    </Button>
                  </div>
                  {isMiniCompleted && (
                    <div className="p-3 bg-emerald-100 border border-emerald-500 text-[11px] font-bold text-emerald-900 leading-snug italic">
                      ¡Completamos el álbum en {miniLogs.length} sobres (${miniLogs.length * 25} MXN)! Pero esto fue solo una simulación. Si lo repetimos, el resultado variará.
                    </div>
                  )}
                </div>

                {/* Simulation Logs Table */}
                <div className="lg:col-span-7 flex flex-col">
                  <span className="text-[10px] uppercase font-black text-slate-400 mb-2">Tabla de Simulación del Intento</span>
                  <div className="border border-black bg-white max-h-[160px] overflow-y-auto text-[10px] font-mono leading-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-100 text-[8px] uppercase border-b border-black">
                          <th className="p-1.5 border-r border-black text-center">Sobre #</th>
                          <th className="p-1.5 border-r border-black text-center">Estampas</th>
                          <th className="p-1.5 border-r border-black text-left">Faltantes</th>
                          <th className="p-1.5 border-r border-black text-center">Totales</th>
                          <th className="p-1.5 text-right">Costo Acumulado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {miniLogs.map((log, index) => (
                          <tr key={index} className="border-b border-slate-200">
                            <td className="p-1 border-r border-black text-center font-bold">{log.packNum}</td>
                            <td className="p-1 border-r border-black text-center font-semibold text-slate-600">[{log.cards.join(', ')}]</td>
                            <td className="p-1 border-r border-black font-bold text-emerald-600 text-[9px]">
                              {log.newCards.length > 0 ? `[${log.newCards.join(', ')}]` : "Ninguna (Repetida)"}
                            </td>
                            <td className="p-1 border-r border-black text-center font-bold">{log.totalUnique}</td>
                            <td className="p-1 text-right font-bold">${log.cost}</td>
                          </tr>
                        ))}
                        {miniLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 italic font-sans text-xs">Abre sobres interactivos para simular.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-serif italic font-black text-slate-900">Paso 4: ¿Por qué funciona esto?</h3>
            <p className="text-sm font-medium text-slate-600 leading-normal">
              Monte Carlo aprovecha el poder y velocidad del microprocesador para evitar ecuaciones de cálculo estocástico extremadamente hostiles. Sus pilares fundamentales:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-xs uppercase text-emerald-800 mb-2">1. Ley de Grandes Números</h4>
                  <p className="text-[10px] leading-relaxed text-emerald-950 font-medium">Entre más veces repitas el experimento, el promedio de los costos computados se acerca y estabiliza al valor real esperado.</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border-2 border-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-xs uppercase text-blue-800 mb-2">2. Aleatoriedad Controlada</h4>
                  <p className="text-[10px] leading-relaxed text-blue-950 font-medium">Cada experimento es totalmente independiente y modela de manera exacta las condiciones reales del mercado de sobres.</p>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border-2 border-amber-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-xs uppercase text-amber-800 mb-2">3. No requiere Fórmulas</h4>
                  <p className="text-[10px] leading-relaxed text-amber-950 font-medium">La computadora ejecuta el trabajo repetitivo de abrir sobres 10,000 o 100,000 veces para darnos una respuesta exacta.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white border-2 border-black p-6 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">🔬 Paso 3.3: Repetir el experimento MILES de veces</h4>
              <p className="text-[11px] text-slate-300">Simulemos rápidamente miles de intentos completos del mini-álbum de 5 cromos para ver el costo promedio esperado:</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Repeticiones:</span>
                  <select 
                    value={trialsCount} 
                    onChange={(e) => setTrialsCount(Number(e.target.value))}
                    className="bg-slate-800 border-2 border-white px-2 py-1 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value={10}>10 Simulaciones</option>
                    <option value={100}>100 Simulaciones</option>
                    <option value={1000}>1,000 Simulaciones</option>
                    <option value={5000}>5,000 Simulaciones</option>
                  </select>
                </div>
                <Button variant="secondary" onClick={handleRunP3Massive} disabled={isP3Simulating} className="text-xs py-2 w-full sm:w-auto h-10">
                  {isP3Simulating ? "Pensando..." : "🚀 Correr Simulaciones masivas"}
                </Button>
              </div>

              {p3SimResults && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-800 border border-white/20 text-xs font-mono shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)]">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[9px] uppercase">Ensayos Realizados:</span>
                    <span className="text-lg font-black text-slate-100">{p3SimResults.simulationsRun}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 block font-semibold text-[9px] uppercase">Sobres Promedio:</span>
                    <span className="text-lg font-black text-emerald-400">{p3SimResults.avgPacks.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-amber-400 block font-semibold text-[9px] uppercase">Costo Promedio MXN:</span>
                    <span className="text-lg font-black text-amber-400">${p3SimResults.avgCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[9px] uppercase">Sobres Min/Max:</span>
                    <span className="text-lg font-black text-slate-100">[{p3SimResults.minPacks} - {p3SimResults.maxPacks}]</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-serif italic font-black text-slate-900">📈 Paso 5: Resultado para el Álbum 2026</h3>
            <div className="border-l-4 border-emerald-500 pl-4 py-1 italic bg-slate-50 text-slate-800 font-serif text-lg leading-relaxed">
               "Se estima estadísticamente que se requieren entre <strong>1,200 y 1,400 sobres</strong> para completarlo en solitario, con un costo de <strong>$30,000 - $35,000 MXN</strong>."
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-sans mt-4">
              <div className="p-4 border-2 border-black bg-white space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black uppercase tracking-tighter text-rose-600 block">🛑 ¿Por qué es tan costoso?</span>
                <p className="text-slate-600 font-medium">
                  Las últimas estampas son las más difíciles de que salgan nuevas por repetición. Cuando tu colección tiene 970 estampas pegadas, la grandísima mayoría de lo que abras en sobres serán repetidos.
                </p>
              </div>

              <div className="p-4 border-2 border-black bg-white space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black uppercase tracking-tighter text-amber-600 block">⭐ Cromos Rápidos y Especiales</span>
                <p className="text-slate-600 font-medium">
                  Determinadas estampas (como los escudos dorados o jugadores ultra-estrellas) cuentan con densidades de impresión de distribución inferior, estirando los valores máximos de la simulación.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black uppercase tracking-tighter text-emerald-950 text-sm mb-4">🔮 Simulador Interactivo de la "Última Estampita"</h4>
              <p className="text-xs text-slate-600 mb-4 font-medium">Modifica la barra para indicar cuántas estampas ya tienes pegadas de las 980 totales, y observa de forma interactiva la decaída de probabilidades en tu siguiente sobre:</p>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-[11px] font-mono font-bold w-48 text-slate-600">Estampas pegadas: {ownedStickers} / 980</span>
                  <input 
                    type="range" 
                    min={0} 
                    max={979} 
                    value={ownedStickers} 
                    onChange={(e) => setOwnedStickers(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 border border-black rounded-lg cursor-pointer accent-emerald-600"
                  />
                </div>
                {ownedStickers > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-300 pt-4 text-xs font-mono">
                    <div className="bg-white p-3 border border-black">
                      <span className="text-slate-400 block font-bold text-[8px] uppercase">P(Un cromo único sea nuevo):</span>
                      <span className="text-base font-black text-rose-600">{p5Stats.probNewSingle.toFixed(3)}%</span>
                    </div>
                    <div className="bg-white p-3 border border-black">
                      <span className="text-slate-400 block font-bold text-[8px] uppercase">P(Al menos 1 nuevo por sobre):</span>
                      <span className="text-base font-black text-emerald-600">{p5Stats.probPack.toFixed(2)}%</span>
                    </div>
                    <div className="bg-white p-3 border border-black">
                      <span className="text-slate-400 block font-bold text-[8px] uppercase">Sobres esperados para la NEXT nueva:</span>
                      <span className="text-base font-black text-blue-600">~{Math.max(1, Math.round(p5Stats.expectedPacks))} sobres (${Math.max(1, Math.round(p5Stats.expectedPacks)) * 25} MXN)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-serif italic font-black text-slate-900">Paso 6: Limitaciones y Realidad</h3>
            <p className="text-sm font-medium text-slate-600 leading-normal">
              La simulación clásica de Monte Carlo pura asume un escenario hostil donde compras solo en una burbuja. Pero en el mundo real, los humanos tomamos decisiones colectivas e intercambiamos repetidos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mt-4">
              <div className="p-4 bg-slate-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black uppercase text-amber-600 block mb-2">🤝 1. Intercambio de Repetidas</span>
                <p className="text-slate-500 font-medium font-serif italic">"En la vida real, el intercambio reduce el costo del álbum en un 70%. Las simulaciones puras no consideran esto inicialmente."</p>
              </div>
              <div className="p-4 bg-slate-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black uppercase text-rose-600 block mb-2">⭐ 2. Estampas raras</span>
                <p className="text-slate-500 font-medium font-serif italic">"Algunas estampas (como las doradas) tienen probabilidades diferentes, lo que puede requerir ajustes más finos en la simulación matemática."</p>
              </div>
              <div className="p-4 bg-slate-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black uppercase text-blue-600 block mb-2">🍀 3. Suerte Extrema</span>
                <p className="text-slate-500 font-medium font-serif italic">"El costo real neto varía mucho por el azar: algunos suertudos completan con $20,000 MXN, otros con infortunio gastan $50,000+ MXN."</p>
              </div>
            </div>

            <div className="p-6 bg-slate-900 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-sans">
              <h4 className="text-amber-400 font-black text-sm uppercase mb-4">🙌 Selector de Estrategia: ¿Cómo afecta cooperar en el gasto?</h4>
              <p className="text-xs text-slate-300 mb-4 leading-normal">Selecciona cuántas personas comprarán sobres colectivamente para intercambiar todos sus repetidos:</p>
              
              <div className="flex gap-4 mb-6">
                {[1, 2, 5].map((gSize) => (
                  <button 
                    key={gSize}
                    onClick={() => setP6GroupSize(gSize as 1 | 2 | 5)}
                    className={`flex-1 py-2 px-4 border-2 font-mono text-xs font-bold transition-all uppercase rounded-none ${
                      p6GroupSize === gSize ? 'bg-amber-400 text-black border-black font-black' : 'bg-slate-800 text-slate-300 border-white/20 hover:bg-slate-700'
                    }`}
                  >
                    {gSize === 1 ? "1. Solitario" : `${gSize} Coleccionistas`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/20 pt-4 items-center">
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-mono font-bold">Efecto del Trading:</p>
                  <p className="text-xs italic font-serif leading-relaxed text-slate-200">
                    "{p6Stats.info}"
                  </p>
                </div>
                <div className="bg-slate-800 border border-white/10 p-4 text-center font-mono space-y-1 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]">
                  <span className="text-[9px] text-slate-400 block font-bold leading-none">Costo por Individuo:</span>
                  <span className="text-2xl font-black text-emerald-400 block leading-tight">${p6Stats.cost.toLocaleString()} MXN</span>
                  <span className="text-[9px] text-slate-400 block">(~{p6Stats.packs} sobres)</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col bg-white overflow-y-auto"
    >
      <header className="p-10 border-b-2 border-black flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 text-white gap-4">
        <div>
          <span className="text-sm uppercase tracking-widest font-black text-emerald-400 block mb-1">Módulo de Cierre Conclusivo</span>
          <h2 className="text-5xl font-serif italic font-black">Monte Carlo <span className="text-emerald-500">Paso a Paso</span></h2>
          <p className="text-sm font-medium text-slate-400 max-w-2xl mt-3 italic font-serif">
             "En el archivo guía: Explicaciones didácticas paso a paso del método Monte Carlo aplicados al álbum Panini."
          </p>
        </div>
        <Button onClick={onRestartClass} variant="outline" className="border-emerald-400 text-emerald-400 bg-black hover:bg-slate-900 border-2">
          <RotateCcw size={14} /> Reiniciar Clase
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-black">
        {/* Navigation Sidebar */}
        <section className="lg:col-span-3 p-6 bg-slate-50 space-y-6 flex flex-col h-full overflow-y-auto shrink-0">
          <span className="text-xs uppercase tracking-widest font-black text-slate-400 block border-b border-black pb-2">Índice del Módulo</span>
          <div className="space-y-1.5 font-mono text-xs flex-1">
            {stepsList.map(st => {
              const Icon = st.icon;
              const isActive = activeStep === st.num;
              return (
                <button 
                  key={st.num}
                  onClick={() => setActiveStep(st.num)}
                  className={`w-full flex items-center gap-3 p-3 text-left border-2 font-bold transition-all relative ${
                    isActive ? 'bg-emerald-600 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-slate-100 border-black/10 text-slate-600'
                  }`}
                >
                  <Icon size={14} />
                  <span>{st.title}</span>
                  {isActive && <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-emerald-50 border-2 border-emerald-500 font-serif italic text-[11px] leading-snug text-emerald-950">
             <b>💡 Didáctica de Monte Carlo:</b> Consiste en repetir un experimento con variables aleatorias controladas miles de veces, para calcular un promedio fiable cuando la matemática pura es muy difícil.
          </div>
        </section>

        {/* Contents */}
        <section className="lg:col-span-9 p-8 sm:p-10 bg-white flex flex-col justify-between">
          <div className="flex-1">
            {renderStepContent()}
          </div>

          {/* Navigation buttons */}
          <div className="border-t-2 border-black pt-6 mt-8 flex justify-between items-center bg-white">
            <Button 
              variant="outline" 
              onClick={() => setActiveStep(p => Math.max(1, p - 1))}
              disabled={activeStep === 1}
              className="text-xs py-2 h-10 px-4 bg-white border-black text-black"
            >
              <ChevronLeft size={14} /> Anterior
            </Button>
            <span className="font-mono text-[10px] text-slate-400 font-bold">PASO {activeStep} DE 6</span>
            {activeStep < 6 ? (
              <Button 
                variant="primary" 
                onClick={() => setActiveStep(p => Math.min(6, p + 1))}
                className="text-xs py-2 h-10 px-4"
              >
                Siguiente <ChevronRight size={14} />
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={onRestartClass}
                className="text-xs py-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-black"
              >
                Terminar <RotateCcw size={14} />
              </Button>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

const StatsLab = ({ onContinue }: { onContinue: () => void }) => {
  const [labData, setLabData] = useState<number[]>([1, 1.2, 0.8, 1.5, 0.9, 1.1, 15]);
  
  const stats = useMemo(() => {
    if (labData.length === 0) return null;
    const sorted = [...labData].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / sorted.length;
    const median = sorted.length % 2 !== 0 
      ? sorted[Math.floor(sorted.length / 2)] 
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    
    // Mode
    const counts: Record<number, number> = {};
    labData.forEach(v => counts[v] = (counts[v] || 0) + 1);
    let maxCount = 0;
    let modes: number[] = [];
    Object.entries(counts).forEach(([val, count]) => {
      if (count > maxCount) {
        maxCount = count;
        modes = [Number(val)];
      } else if (count === maxCount) {
        modes.push(Number(val));
      }
    });
    const mode = modes.length === labData.length ? null : modes;

    // Variance & StdDev
    const variance = labData.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / labData.length;
    const stdDev = Math.sqrt(variance);
    const stdError = stdDev / Math.sqrt(labData.length);
    const range = sorted[sorted.length - 1] - sorted[0];

    return { mean, median, mode, variance, stdDev, stdError, range };
  }, [labData]);

  const addSample = (val: number) => setLabData([...labData, val]);
  const removeSample = (index: number) => setLabData(labData.filter((_, i) => i !== index));
  const clearData = () => setLabData([]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col bg-white overflow-y-auto"
    >
      <header className="p-10 border-b-2 border-black flex justify-between items-center bg-slate-900 text-white">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-emerald-400 block mb-1">Módulo 2.5: El Sandbox Estadístico</span>
          <h2 className="text-5xl font-serif italic font-black">Laboratorio de <span className="text-emerald-500">Tendencia Central</span></h2>
          <p className="text-sm font-medium text-slate-400 max-w-2xl mt-4 italic font-serif">
             "Juega con los números para entender por qué la media miente cuando hay superestrellas, y por qué la mediana es más honesta."
          </p>
        </div>
        <Button onClick={onContinue} className="bg-emerald-500 border-none shadow-none hover:bg-emerald-400">
          Continuar a Monte Carlo <ChevronRight size={16} />
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 divide-x-2 divide-black">
        {/* Sidebar Controls */}
        <section className="lg:col-span-3 p-8 bg-slate-50 space-y-8 h-full overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-tighter border-b border-black pb-2">Panel de Control</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-[10px] py-2 px-0" onClick={() => addSample(Math.round((Math.random() * 2 + 0.5) * 10) / 10)}>+ Atleta Promedio</Button>
              <Button variant="outline" className="text-[10px] py-2 px-0 bg-amber-400" onClick={() => addSample(Math.round((Math.random() * 50 + 50) * 10) / 10)}>+ Superestrella</Button>
            </div>
            <Button variant="outline" className="w-full text-[10px] py-2 border-rose-500 text-rose-500" onClick={clearData}>Limpiar Dataset</Button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 relative group overflow-hidden">
              <h4 className="font-black text-xs uppercase text-emerald-700 flex items-center gap-2 mb-2">
                <Calculator size={14} /> El Promedio (Media)
              </h4>
              <p className="text-[10px] leading-tight text-emerald-900 mb-2">Suma de todos ÷ cantidad. Es muy sensible a valores extremos.</p>
              <p className="text-[10px] font-bold italic">"Se usa cuando los datos son simétricos y sin outliers."</p>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-500 relative group overflow-hidden">
              <h4 className="font-black text-xs uppercase text-blue-700 flex items-center gap-2 mb-2">
                <BarChart3 size={14} /> La Mediana
              </h4>
              <p className="text-[10px] leading-tight text-blue-900 mb-2">El valor central exacto. No le importa si un jugador gana 1B.</p>
              <p className="text-[10px] font-bold italic">"Se usa en distribuciones desiguales (como salarios)."</p>
            </div>

            <div className="p-4 bg-slate-900 text-white border-2 border-white relative group overflow-hidden">
              <h4 className="font-black text-xs uppercase text-slate-300 flex items-center gap-2 mb-2">
                <RotateCcw size={14} /> La Moda
              </h4>
              <p className="text-[10px] leading-tight text-slate-400 mb-2">El valor que más se repite.</p>
              <p className="text-[10px] font-bold italic">"Ideal para variables categóricas o precios fijos."</p>
            </div>
          </div>
        </section>

        {/* Visualization Area */}
        <section className="lg:col-span-6 p-10 bg-white flex flex-col items-center">
           <div className="w-full flex-1 flex flex-col">
              <div className="mb-8 flex justify-between items-end border-b-2 border-black pb-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Dataset: <span className="text-emerald-600">{labData.length} Jugadores</span></h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                      <span className="text-[10px] font-bold uppercase">Jugador</span>
                   </div>
                </div>
              </div>

              <div className="flex-1 relative bg-slate-50 border-4 border-black p-8 overflow-hidden">
                 {/* Data points visualization */}
                 <div className="flex flex-wrap gap-4 justify-center items-center h-full content-center">
                   <AnimatePresence>
                     {labData.map((val, idx) => (
                       <motion.div 
                         key={`sample-${idx}`}
                         initial={{ scale: 0, rotate: -20 }}
                         animate={{ scale: 1, rotate: 0 }}
                         exit={{ scale: 0, opacity: 0 }}
                         className={`relative group cursor-help w-12 h-12 flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 ${val > 10 ? 'bg-amber-400 scale-125' : 'bg-emerald-500'}`}
                         onClick={() => removeSample(idx)}
                       >
                         <span className="text-[10px] font-black">{val}M</span>
                         <div className="absolute -top-1 w-2 h-2 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
                 
                 {/* Measurement Overlays */}
                 {stats && labData.length > 0 && (
                   <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-2 pointer-events-none">
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-[2px] bg-emerald-500 relative">
                           <div className="absolute left-1/2 -top-2 w-1.5 h-4 bg-emerald-500 border border-black" />
                           <span className="absolute left-1/2 top-4 -translate-x-1/2 text-[9px] font-black text-emerald-600 whitespace-nowrap bg-white px-1">MEDIA: ${stats.mean.toFixed(2)}M</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-[2px] bg-blue-500 relative">
                           <div className="absolute left-[45%] -top-2 w-1.5 h-4 bg-blue-500 border border-black" />
                           <span className="absolute left-[45%] top-4 -translate-x-1/2 text-[9px] font-black text-blue-600 whitespace-nowrap bg-white px-1">MEDIANA: ${stats.median.toFixed(2)}M</span>
                        </div>
                     </div>
                   </div>
                 )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-8 text-[11px] leading-relaxed text-slate-500 font-serif italic border-t-2 border-black pt-8">
                 <p>
                   <b>¿Cuándo usar el promedio?</b> Cuando buscas el valor típico en una población uniforme. Si todos ganan parecido, el promedio es el rey.
                 </p>
                 <p>
                   <b>¿Cuándo usar la mediana?</b> Cuando tienes outliers (Mbappé). La mediana te dice qué gana el "jugador de en medio", ignorando los extremos.
                 </p>
              </div>
           </div>
        </section>

        {/* Right Statistics Section (Dispersion Focus) */}
        <section className="lg:col-span-3 p-8 bg-slate-900 text-white space-y-10 overflow-y-auto">
           <div className="space-y-6">
              <h3 className="text-amber-400 font-black text-sm uppercase tracking-tighter border-b border-white/20 pb-2 italic">Medidas de Dispersión</h3>
              
              <div className="space-y-4">
                 <div className="space-y-1">
                    <div className="flex justify-between items-end font-black text-xs uppercase tracking-tighter">
                       <span className="text-slate-400">Rango</span>
                       <span className="text-xl text-white font-serif">{stats?.range.toFixed(2)}M</span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Distancia entre el más rico y el más pobre.</p>
                 </div>

                 <div className="space-y-1">
                    <div className="flex justify-between items-end font-black text-xs uppercase tracking-tighter">
                       <span className="text-slate-400">Desv. Estándar (σ)</span>
                       <span className="text-xl text-emerald-400 font-serif">{stats?.stdDev.toFixed(2)}M</span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">¿Qué tan lejos están los datos de la media?</p>
                 </div>

                 <div className="space-y-1">
                    <div className="flex justify-between items-end font-black text-xs uppercase tracking-tighter">
                       <span className="text-slate-400">Varianza (σ²)</span>
                       <span className="text-xl text-amber-500 font-serif">{stats?.variance.toFixed(2)}M</span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">El promedio de los errores al cuadrado.</p>
                 </div>

                 <div className="p-4 bg-white/5 border border-white/20 text-xs italic leading-tight space-y-2">
                     <p><b>¿Para qué sirve σ?</b> Si la desviación es pequeña, el promedio es "confiable". Si es grande, el promedio es una ficción matemática.</p>
                     <p className="text-amber-400"><b>Error Estándar:</b> {stats?.stdError.toFixed(3)} - Indica cuánta incertidumbre hay en nuestra media calculada.</p>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-emerald-600 border-2 border-black rotate-1 text-black">
              <h4 className="font-black uppercase text-xl italic tracking-tighter mb-2">Conclusión Clave:</h4>
              <p className="text-[11px] font-bold leading-snug">
                "En el mercado de sobres, la dispersión es lo que hace que abrir 1,000 sobres sea predecible (Error bajo), pero abrir 1 sea un caos total."
              </p>
           </div>
        </section>
      </div>
    </motion.div>
  );
};

const WorldMap = ({ confederations }: { confederations: typeof CONFEDERATION_DATA }) => {
  return (
    <div className="relative w-full aspect-[2/1] bg-slate-900 border-2 border-black p-0 overflow-hidden group">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/a/a8/World_Map_FIFA2.svg" 
        alt="Mapa Mundial FIFA"
        className="w-full h-full object-cover opacity-80 mix-blend-screen grayscale contrast-125"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
      
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-x-2 gap-y-1 bg-black/40 backdrop-blur-sm p-1.5 border border-white/10">
        {confederations.map(c => (
          <div key={c.name} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.5)]" style={{ backgroundColor: c.color }} />
            <span className="text-[7px] font-black text-white/70 uppercase tracking-tighter">{c.name}</span>
          </div>
        ))}
      </div>
      
      <div className="absolute top-2 right-2 text-[8px] font-mono text-emerald-400 bg-black/60 px-1.5 py-0.5 border border-emerald-500/30 backdrop-blur-sm tracking-widest">
        LIVE_SAT_FEEED_v2.0
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline',
  disabled?: boolean,
  className?: string
}) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 border-2 border-black',
    secondary: 'bg-black text-emerald-400 hover:bg-slate-900 border-2 border-emerald-400',
    outline: 'border-2 border-black text-black hover:bg-slate-100 font-bold uppercase tracking-widest text-xs'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-3 font-black uppercase tracking-tighter transition-all duration-200 flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Stats & Data ---

const CONFEDERATION_DATA = [
  { name: 'UEFA', avg: 2.25, top: 72, topPlayer: 'K. Mbappé', color: '#10b981', info: 'Salarios más altos del mundo.' },
  { name: 'CONMEBOL', avg: 0.85, top: 7, topPlayer: 'M. Depay', color: '#3b82f6', info: 'Alta competencia en Brasil y Argentina.' },
  { name: 'CONCACAF', avg: 0.4, top: 28.3, topPlayer: 'L. Messi', color: '#f59e0b', info: 'Liderado por México y MLS.' },
  { name: 'AFC', avg: 0.325, top: 200, topPlayer: 'C. Ronaldo', color: '#8b5cf6', info: 'Gran variación (Arabia Saudí vs otros).' },
  { name: 'CAF', avg: 0.125, top: 3, topPlayer: 'A. Maaloul', color: '#f43f5e', info: 'Ligas de Egipto y Sudáfrica lideran.' },
  { name: 'OFC', avg: 0.065, top: 0.3, topPlayer: 'G. May', color: '#6366f1', info: 'Oceanía tiene los salarios más bajos.' }
];

const GLOBAL_SAMPLES = [
  { name: 'OFC Avg', value: 0.065, type: 'avg' },
  { name: 'CAF Avg', value: 0.125, type: 'avg' },
  { name: 'AFC Avg', value: 0.325, type: 'avg' },
  { name: 'CONCACAF Avg', value: 0.4, type: 'avg' },
  { name: 'CONMEBOL Avg', value: 0.85, type: 'avg' },
  { name: 'UEFA Avg', value: 2.25, type: 'avg' },
  { name: 'Messi', value: 28.3, type: 'top' },
  { name: 'K. Mbappé', value: 72, type: 'top' },
  { name: 'C. Ronaldo', value: 200, type: 'top' },
];

const meanSalary = GLOBAL_SAMPLES.reduce((acc, curr) => acc + curr.value, 0) / GLOBAL_SAMPLES.length;
const sortedSalaries = [...GLOBAL_SAMPLES].sort((a, b) => a.value - b.value);
const medianSalary = sortedSalaries[Math.floor(sortedSalaries.length / 2)].value;

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simResults, setSimResults] = useState<number[]>([]);
  const [llnData, setLlnData] = useState<{ x: number, y: number }[]>([]);
  const [showTopPlayers, setShowTopPlayers] = useState(true);
  const [viewMode, setViewMode] = useState<'bars' | 'histogram'>('histogram');

  const filteredSamples = useMemo(() => {
    return GLOBAL_SAMPLES.filter(s => showTopPlayers || s.type === 'avg');
  }, [showTopPlayers]);

  const histogramData = useMemo(() => {
    // Simulated log-normal distribution for millions of players
    // Most earn very little, a few earn millions
    const bins = [
      { bin: '0-0.1M', count: 85, desc: 'Ligas menores / Juveniles' },
      { bin: '0.1-0.5M', count: 40, desc: 'Profesionales regionales' },
      { bin: '0.5-2M', count: 15, desc: 'UEFA / MLS / Liga MX' },
      { bin: '2-10M', count: 5, desc: 'Estrellas de Selección' },
      { bin: '10M+', count: 1, desc: 'Superestrellas (Outliers)' },
    ];
    return bins;
  }, []);

  // Simulation parameters for Monte Carlo
  const NUM_SIMULATIONS = 500;

  // 2. Monte Carlo Simulation Logic
  const runMonteCarlo = async () => {
    setSimRunning(true);
    setSimProgress(0);
    const results: number[] = [];
    
    // Process in chunks to keep UI responsive
    for (let s = 0; s < NUM_SIMULATIONS; s++) {
      let stickersCollected = new Set<number>();
      let packsOpened = 0;
      
      while (stickersCollected.size < TOTAL_STICKERS) {
        packsOpened++;
        for (let i = 0; i < STICKERS_PER_PACK; i++) {
          const stickerId = Math.floor(Math.random() * TOTAL_STICKERS);
          stickersCollected.add(stickerId);
        }
        // Safety break if it takes way too long (shouldn't happen with these numbers)
        if (packsOpened > 20000) break;
      }
      results.push(packsOpened);
      
      if (s % 50 === 0) {
        setSimProgress(Math.round((s / NUM_SIMULATIONS) * 100));
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    setSimResults(results);
    setSimRunning(false);
    setSimProgress(100);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    setCurrentStep('results');
  };

  // 3. Process Results
  const resultsStats = useMemo(() => {
    if (simResults.length === 0) return null;
    const sorted = [...simResults].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;
    const med = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    // Frequency for histogram
    const bins: Record<string, number> = {};
    const step = 50;
    sorted.forEach(val => {
      const bin = Math.floor(val / step) * step;
      bins[bin] = (bins[bin] || 0) + 1;
    });
    
    const chartData = Object.entries(bins).map(([bin, count]) => ({
      bin: Number(bin),
      count
    })).sort((a, b) => a.bin - b.bin);

    return { avg, med, min, max, chartData };
  }, [simResults]);

  // --- Render Steps ---

  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col items-center justify-center p-8 max-w-5xl mx-auto space-y-12"
    >
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-black text-emerald-600">Introducción al Módulo</span>
        <h2 className="text-6xl md:text-8xl font-serif italic font-black leading-tight">
          La Ciencia de <br /> <span className="text-emerald-500">Coleccionar</span>
        </h2>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          Un experimento social y matemático sobre cómo el azar, la escasez y el dinero se entrelazan en un pedazo de cartón.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black divide-y-2 md:divide-y-0 md:divide-x-2 divide-black w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-8 bg-white space-y-2">
          <Trophy className="text-emerald-600 mb-4" size={32} />
          <h3 className="font-black text-xl uppercase tracking-tighter">980 Únicas</h3>
          <p className="text-xs text-slate-500 leading-relaxed">El reto más grande en la historia de Panini. 48 países compitiendo por espacio.</p>
        </div>
        <div className="p-8 bg-slate-50 space-y-2">
          <DollarSign className="text-emerald-600 mb-4" size={32} />
          <h3 className="font-black text-xl uppercase tracking-tighter">$25 MXN</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Un sobre contiene 7 estampas. El álbum de pasta suave cuesta $99.</p>
        </div>
        <div className="p-8 bg-white space-y-2">
          <Calculator className="text-emerald-600 mb-4" size={32} />
          <h3 className="font-black text-xl uppercase tracking-tighter">Monte Carlo</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Simularemos 500 intentos para encontrar el costo real de la suerte.</p>
        </div>
      </div>

      <div className="pt-8">
        <Button onClick={() => setCurrentStep('central')}>
          Abrir Laboratorio <ChevronRight size={20} />
        </Button>
      </div>
    </motion.div>
  );

  const renderCentralTendency = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full grid grid-cols-1 lg:grid-cols-4 divide-x-2 divide-black"
    >
      <section className="p-10 flex flex-col bg-white overflow-y-auto">
        <div className="mb-8">
          <span className="text-8xl font-serif font-black text-slate-100 block leading-none mb-2">01</span>
          <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight italic">
            Geografía <br /><span className="text-emerald-600">Salarial</span>
          </h2>
        </div>
        
        <div className="flex-1 space-y-6">
          <WorldMap confederations={CONFEDERATION_DATA} />

          <div className="bg-slate-100 p-4 border-l-4 border-emerald-500">
            <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Métricas Globales (M USD)</p>
            <div className="space-y-4">
              <div className="flex justify-between border-b-2 border-dotted border-slate-300 pb-2">
                <span className="text-xs font-mono italic font-bold">Media Teorética:</span>
                <span className="text-sm font-black text-slate-900">${meanSalary.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between border-b-2 border-dotted border-emerald-300 pb-2 bg-emerald-50 px-2 -mx-2">
                <span className="text-xs font-mono italic font-bold text-emerald-700 underline">Mediana Real:</span>
                <span className="text-sm font-black text-emerald-700">${medianSalary.toFixed(2)}M</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400">Controles de Visualización</p>
            <button 
              onClick={() => setShowTopPlayers(!showTopPlayers)}
              className={`w-full p-3 text-xs font-black uppercase flex justify-between items-center border-2 border-black transition-colors ${showTopPlayers ? 'bg-emerald-600 text-white' : 'bg-white text-black'}`}
            >
              <span>{showTopPlayers ? 'Ocultar' : 'Mostrar'} Outliers</span>
              <Users size={14} />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setViewMode('bars')}
                className={`p-2 text-[10px] font-black uppercase border-2 border-black ${viewMode === 'bars' ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                Barras
              </button>
              <button 
                onClick={() => setViewMode('histogram')}
                className={`p-2 text-[10px] font-black uppercase border-2 border-black ${viewMode === 'histogram' ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                Histograma
              </button>
            </div>
          </div>

          <p className="text-[10px] leading-relaxed text-slate-500 italic font-medium bg-slate-50 p-4 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            "Filtra a los outliers para ver cómo cambia la percepción de la escala. Sin Messi o CR7, el gráfico es mucho más balanceado."
          </p>
        </div>

        <div className="mt-8">
          <Button variant="outline" className="w-full" onClick={() => setCurrentStep('intro')}>
            <ChevronLeft size={16} /> Regresar
          </Button>
        </div>
      </section>

      <section className="col-span-3 p-10 bg-slate-50 flex flex-col shrink-0">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h3 className="text-4xl font-black uppercase tracking-tighter italic">
              {viewMode === 'bars' ? 'Escala de Ingresos' : 'Distribución Poblacional'}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              {viewMode === 'bars' ? 'Comparando promedios continentales contra las superestrellas mundiales.' : '¿En qué rango salarial se encuentra la mayoría de los 128,000 profesionales?'}
            </p>
          </div>
          <Button onClick={() => setCurrentStep('facets')}>
            Siguiente: Facetas <ChevronRight size={16} />
          </Button>
        </div>

        <div className="flex-1 bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'bars' ? (
              <BarChart data={filteredSamples} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#000', strokeWidth: 2 }}
                  tick={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={{ stroke: '#000', strokeWidth: 2 }}
                  tick={{ fontWeight: 'bold', fontSize: 12 }}
                  label={{ value: 'M USD', angle: -90, position: 'insideLeft', offset: 0 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#059669" radius={[0, 0, 0, 0]} barSize={40}>
                  {filteredSamples.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'top' ? '#f59e0b' : '#059669'} stroke="#000" strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bin" axisLine={{ stroke: '#000', strokeWidth: 2 }} tick={{ fontWeight: 'bold' }} />
                <YAxis axisLine={{ stroke: '#000', strokeWidth: 2 }} hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
                  formatter={(val, name, props) => [`${val}% de los jugadores`, 'Frecuencia']}
                  labelFormatter={(value) => `Rango Salarial: ${value}`}
                />
                <Bar dataKey="count" fill="#3b82f6" stroke="#000" strokeWidth={2}>
                   {histogramData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : (index === 4 ? '#f43f5e' : '#3b82f6')} />
                   ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );

  const renderDispersion = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full grid grid-cols-1 lg:grid-cols-4 divide-x-2 divide-black"
    >
      <section className="p-10 flex flex-col bg-slate-50">
        <div className="mb-8">
          <span className="text-8xl font-serif font-black text-emerald-100 block leading-none mb-2">02</span>
          <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight italic">
            Dispersión <br /><span className="text-emerald-600">Extrema</span>
          </h2>
        </div>
        
        <div className="flex-1 space-y-6">
          <p className="text-sm font-black text-slate-700 uppercase tracking-tighter underline">Riesgo y Abismo</p>
          <p className="text-xs font-medium text-slate-600">
            En el fútbol profesional, la brecha entre el suelo y el cielo es abismal. Analicemos el <b>Rango</b> y la <b>Varianza</b>.
          </p>
          
          <div className="space-y-3">
            <div className="p-4 bg-black text-white border-2 border-emerald-400 space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Rango Global</span>
              <p className="text-xl font-serif italic text-white">$199.9M USD</p>
            </div>
            <div className="p-4 bg-white border-2 border-black space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Coef. Variación</span>
              <p className="text-xl font-serif italic text-black">Muy Alto (Outliers)</p>
            </div>
          </div>

          <div className="bg-amber-400 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h5 className="font-black text-xs uppercase mb-1 underline">Lección de Varianza:</h5>
            <p className="text-xs font-bold leading-tight italic">
              "Si el salario de Ronaldo se triplica, la mediana NO cambia, pero la varianza EXPLOTA."
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={() => setCurrentStep('central')}>
            <ChevronLeft size={16} /> Regresar
          </Button>
        </div>
      </section>

      <section className="col-span-3 p-10 bg-white grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div>
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Brecha de Desigualdad</h3>
            <p className="text-slate-500 text-sm font-bold">¿Cuánto tardaría un jugador de Oceanía en ganar lo que Ronaldo en UN DÍA?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 text-emerald-400 border-2 border-black space-y-2">
              <h4 className="text-[10px] uppercase font-black">OFC (Auckland FC)</h4>
              <p className="text-2xl font-black italic">$0.3M</p>
              <p className="text-[9px] opacity-70 uppercase font-bold">Salario Anual</p>
            </div>
            <div className="p-6 bg-emerald-600 text-white border-2 border-black space-y-2 relative overflow-hidden">
              <h4 className="text-[10px] uppercase font-black">AFC (Al-Nassr)</h4>
              <p className="text-2xl font-black italic">$200M</p>
              <p className="text-[9px] opacity-100 uppercase font-bold">Salario Anual</p>
              <div className="absolute top-0 right-0 p-1 bg-black text-[8px] font-black italic">TOP SEED</div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 border-2 border-black divide-y divide-slate-300">
             <div className="py-2 flex justify-between font-bold text-xs uppercase">
               <span>Población Total</span>
               <span>~128,694 Pro</span>
             </div>
             <div className="py-2 flex justify-between font-bold text-xs uppercase italic text-emerald-600">
               <span>Concentración UEFA</span>
               <span>~40%</span>
             </div>
             <div className="py-2 flex justify-between font-bold text-xs uppercase opacity-40">
               <span>Concentración OFC</span>
               <span>~1%</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="bg-slate-900 border-4 border-emerald-500 p-8 text-white space-y-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-2xl uppercase tracking-tighter italic border-b-2 border-emerald-500 pb-2">El Abismo Estadístico</h4>
            <div className="space-y-4">
               <div className="bg-emerald-950 p-3 border border-emerald-400 text-[10px] leading-relaxed italic">
                 "El salario de un solo jugador (CR7) representa más que la nómina entera de cientos de clubes en confederaciones menores."
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-emerald-400"></div>
                 <span className="text-[10px] font-black uppercase text-emerald-300">σ (Desviación) = Inmensa</span>
               </div>
            </div>
          </div>

          <div className="mt-8">
            <Button className="w-full h-16 text-xl" onClick={() => setCurrentStep('stats_lab')}>
              Siguiente: Laboratorio Interactivo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  );

  const renderMonteCarloIntro = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col bg-slate-900 text-white overflow-y-auto"
    >
      <div className="p-10 max-w-6xl mx-auto w-full space-y-12">
        <div className="space-y-4 text-center">
          <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">Módulo 03: Teoría de Simulación</span>
          <h2 className="text-5xl md:text-7xl font-serif italic font-black">El Método <span className="text-emerald-500">Monte Carlo</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            ¿Cómo predecir el futuro cuando hay demasiadas variables? Usamos la fuerza bruta del azar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-emerald-500 text-black flex items-center justify-center rounded-lg font-black text-xl">1</div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Muestreo Aleatorio</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              En lugar de resolver una ecuación compleja, "jugamos" el juego miles de veces. Cada simulación es como un coleccionista real abriendo sobres al azar.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-emerald-500 text-black flex items-center justify-center rounded-lg font-black text-xl">2</div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Probabilidad Variable</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Al inicio, cualquier estampa es nueva (P=100%). Al final, cuando solo te falta una, la probabilidad de encontrarla en un sobre es mínima (aprox. 0.7%).
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-emerald-500 text-black flex items-center justify-center rounded-lg font-black text-xl">3</div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Ley de Grandes Números</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Si simulamos 1 o 2 personas, el resultado es caótico. Si simulamos masivamente, el promedio comienza a estabilizarse en el valor real esperado.
            </p>
          </div>
        </div>

        <div className="bg-emerald-600 p-8 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h4 className="text-2xl font-black uppercase italic tracking-tighter">El Reto del Coleccionista</h4>
              <p className="text-sm font-medium leading-relaxed">
                Este fenómeno se conoce en estadística como el <b>Problema del Coleccionista de Cupones</b>. 
                Demuestra que el mayor costo no está al inicio, sino en las últimas 10 estampas "imposibles".
              </p>
            </div>
            <div className="flex-none bg-black p-6 border-2 border-white rotate-2 shrink-0">
               <div className="text-center">
                 <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">Probabilidad del último cromo</p>
                 <p className="text-4xl font-serif italic font-black text-white">1 / 980</p>
                 <p className="text-[10px] font-mono text-emerald-500 mt-2">Dificultad Extrema</p>
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8">
           <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => setCurrentStep('dispersion')}>
             <ChevronLeft size={16} /> Regresar
           </Button>
           <Button onClick={() => setCurrentStep('probability_curves')} className="bg-emerald-500 hover:bg-emerald-400">
             Entendido, ver Probabilidades <ChevronRight size={16} />
           </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderProbabilityCurves = () => {
    const probabilityData = Array.from({ length: 50 }, (_, i) => {
      const k = (i / 49) * (TOTAL_STICKERS - 1);
      const prob = ((TOTAL_STICKERS - k) / TOTAL_STICKERS) * 100;
      return { k: Math.round(k), prob };
    });

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full grid grid-cols-1 lg:grid-cols-4 divide-x-2 divide-black"
      >
        <section className="p-10 flex flex-col bg-amber-50">
          <div className="mb-8">
            <span className="text-8xl font-serif font-black text-amber-200 block leading-none mb-2">3.1</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight italic">
              Curva de <br /><span className="text-amber-600">Dificultad</span>
            </h2>
          </div>
          
          <div className="flex-1 space-y-6">
            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
              "La probabilidad de éxito no es estática. Cada estampa nueva que consigues hace que la siguiente sea más difícil de encontrar."
            </p>

            <div className="space-y-4">
              <div className="bg-white border-2 border-black p-4">
                <span className="text-[10px] font-black text-slate-400 uppercase">Inicio (0 Estampas)</span>
                <p className="text-2xl font-serif italic text-emerald-600">P = 100%</p>
                <p className="text-[9px] font-medium text-slate-400">Cualquier estampa es útil.</p>
              </div>

              <div className="bg-white border-2 border-black p-4">
                <span className="text-[10px] font-black text-slate-400 uppercase">Media (490 Estampas)</span>
                <p className="text-2xl font-serif italic text-amber-500">P = 50%</p>
                <p className="text-[9px] font-medium text-slate-400">1 de cada 2 es repetida.</p>
              </div>

              <div className="bg-white border-2 border-black p-4">
                <span className="text-[10px] font-black text-slate-400 uppercase">Final (979 Estampas)</span>
                <p className="text-2xl font-serif italic text-rose-600">P = 0.1%</p>
                <p className="text-[9px] font-medium text-slate-400">Necesitas ~980 estmparas para ver la última.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => setCurrentStep('montecarlo_intro')}>
              <ChevronLeft size={16} /> Regresar
            </Button>
            <Button className="w-full" onClick={() => setCurrentStep('law_of_large_numbers')}>
              Ver Ley de Grandes Números <ChevronRight size={16} />
            </Button>
          </div>
        </section>

        <section className="col-span-3 p-10 bg-white flex flex-col">
          <div className="mb-8">
            <h3 className="text-4xl font-black uppercase tracking-tighter italic">Decaimiento de Probabilidad</h3>
            <p className="text-slate-500 text-sm font-medium">Relación entre estampas obtenidas y la probabilidad de que el siguiente cromo sea nuevo.</p>
          </div>

          <div className="flex-1 bg-slate-50 border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={probabilityData}>
                <defs>
                  <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="k" 
                  label={{ value: 'Estampas en el Álbum', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold' }}
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  label={{ value: 'P(Nueva) %', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold' }}
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ border: '2px solid black', fontWeight: 'bold' }}
                  formatter={(val: number) => [`${val.toFixed(1)}%`, "Prob. Nueva"]}
                  labelFormatter={(val) => `Tienes ${val} estampas`}
                />
                <Area 
                  type="monotone" 
                  dataKey="prob" 
                  stroke="#000" 
                  strokeWidth={3} 
                  fill="url(#colorProb)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 bg-slate-900 p-6 text-white border-4 border-black border-l-amber-400">
             <div className="flex items-center gap-4">
               <Info className="text-amber-400 shrink-0" size={32} />
               <p className="text-[11px] leading-relaxed font-bold italic tracking-wide">
                 ¿Ves cómo la curva cae en picada? Esto explica por qué los últimos 50 espacios del álbum consumen el 90% de tu presupuesto. La estadística nos dice que coleccionar solo es eficiente si intercambias.
               </p>
             </div>
          </div>
        </section>
      </motion.div>
    );
  };

  const renderLawOfLargeNumbers = () => {
    const theoreticalValue = 71.95; // 20 stickers * H20
    const currentAvg = llnData.length > 0 ? llnData[llnData.length - 1].y : 0;
    const error = currentAvg === 0 ? 0 : Math.abs(currentAvg - theoreticalValue);

    const runLlnSim = (count: number) => {
      const newTrials = [...llnData];
      let cumulativeSum = newTrials.length > 0 ? newTrials[newTrials.length - 1].y * newTrials.length : 0;
      
      for (let i = 0; i < count; i++) {
        // Simple sticker collection sim for 20 unique items
        const album = new Set<number>();
        let pulls = 0;
        while (album.size < 20) {
          pulls++;
          album.add(Math.floor(Math.random() * 20));
          if (pulls > 500) break;
        }
        cumulativeSum += pulls;
        newTrials.push({ x: newTrials.length + 1, y: cumulativeSum / (newTrials.length + 1) });
      }
      // Just keep relevant data points for performance if list is huge
      setLlnData(newTrials.slice(-300));
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full grid grid-cols-1 lg:grid-cols-4 divide-x-2 divide-black"
      >
        <section className="p-10 flex flex-col bg-slate-50 overflow-y-auto">
          <div className="mb-8">
            <span className="text-8xl font-serif font-black text-rose-100 block leading-none mb-2">3.1</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight italic">
              Ley de <br /><span className="text-rose-600">Grandes Números</span>
            </h2>
          </div>
          
          <div className="flex-1 space-y-6">
            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
              "A medida que repetimos un experimento, la media de los resultados tiende a acercarse al valor teórico esperado."
            </p>

            <div className="space-y-4">
              <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-black text-slate-400 uppercase">Muestras Acumuladas</span>
                <p className="text-3xl font-serif italic text-black">{llnData.length}</p>
              </div>

              <div className="bg-rose-50 border-2 border-rose-200 p-4">
                <span className="text-[10px] font-black text-rose-400 uppercase">Margen de Error</span>
                <p className="text-2xl font-serif italic text-rose-600">±{error.toFixed(2)}</p>
                <div className="h-1 bg-rose-200 mt-2">
                   <div className="h-full bg-rose-600 transition-all" style={{ width: `${Math.max(0, 100 - error * 5)}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400">Controles del Experimento</p>
              <Button className="w-full text-xs" onClick={() => runLlnSim(1)}>Añadir Simulación (1)</Button>
              <Button className="w-full text-xs bg-black text-white hover:bg-slate-900 border-none" onClick={() => runLlnSim(50)}>Lanzar Lote (50)</Button>
              <Button variant="outline" className="w-full text-xs" onClick={() => setLlnData([])}>Resetear Datos</Button>
            </div>
          </div>

          <div className="mt-8">
            <Button variant="outline" className="w-full" onClick={() => setCurrentStep('montecarlo_intro')}>
              <ChevronLeft size={16} /> Regresar
            </Button>
          </div>
        </section>

        <section className="col-span-3 p-10 bg-white flex flex-col">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h3 className="text-4xl font-black uppercase tracking-tighter italic">Gráfico de Convergencia</h3>
              <p className="text-slate-500 text-sm font-medium">Mira cómo el caos inicial (muestras pequeñas) se convierte en una línea estable (gran escala).</p>
            </div>
            <div className="flex gap-4">
               <Button onClick={() => setCurrentStep('montecarlo')} disabled={llnData.length < 10}>
                 Iniciar Monte Carlo Real <ChevronRight size={16} />
               </Button>
            </div>
          </div>

          <div className="flex-1 bg-slate-900 border-4 border-black p-8 relative overflow-hidden group">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={llnData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="x" hide />
                <YAxis domain={[theoreticalValue - 30, theoreticalValue + 30]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #f43f5e', color: '#fff', fontSize: '10px' }}
                  labelFormatter={(val) => `Trial #${val}`}
                  formatter={(val: number) => [val.toFixed(2), "Media"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#f43f5e" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAvg)" 
                  animationDuration={300}
                />
                {/* Theoretical line */}
                <Area 
                   type="monotone" 
                   dataKey={() => theoreticalValue} 
                   stroke="#ffffff" 
                   strokeDasharray="5 5" 
                   strokeWidth={1} 
                   fill="none" 
                   opacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {llnData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center p-8 border-2 border-dashed border-rose-500 text-rose-500">
                  <Play className="mx-auto mb-4 animate-bounce" size={40} />
                  <p className="font-black uppercase tracking-widest">Esperando primeras muestras...</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-white/10 px-2 py-1 text-[8px] font-mono text-white flex items-center gap-2">
               <span className="w-2 h-2 bg-rose-500 rounded-full" /> ESTIMATED_AVG: {currentAvg.toFixed(2)}
            </div>
            <div className="absolute top-4 right-4 bg-white/10 px-2 py-1 text-[8px] font-mono text-white/50">
               THEORETICAL: {theoreticalValue.toFixed(2)}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8 text-[11px] leading-relaxed text-slate-500 font-medium italic">
            <p>
              Observa cómo al principio los resultados saltan salvajemente. Con pocas muestras, un coleccionista con mucha mala suerte altera todo el gráfico.
            </p>
            <p>
              A medida que lanzas "Lotes", la curva se "pega" a la línea punteada. Esa línea es la verdad matemática que descubriremos en la simulación masiva final.
            </p>
          </div>
        </section>
      </motion.div>
    );
  };

  const renderMonteCarlo = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full grid grid-cols-1 lg:grid-cols-4 divide-x-2 divide-black"
    >
      <section className="p-10 flex flex-col bg-emerald-600 text-white col-span-4 lg:col-span-4">
        <div className="mb-12 flex justify-between items-start">
          <div>
            <span className="text-8xl font-serif font-black text-emerald-800 block leading-none mb-2">03</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
              Simulación <br />Monte Carlo
            </h2>
          </div>
          <div className="bg-black text-emerald-400 p-6 border-4 border-emerald-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-mono leading-none mb-2 uppercase tracking-widest">Estado del Motor</p>
            <p className={`text-2xl font-mono font-bold leading-none ${simRunning ? 'animate-pulse' : ''}`}>
              {simRunning ? `RUNNING: ${simProgress}%` : 'READY TO COMPUTE'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
          <div className="space-y-8">
            <div className="border-t-4 border-white pt-8">
              <p className="text-xs uppercase tracking-[0.2em] mb-4 font-black text-emerald-200">Parámetros del Experimento</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 text-xl font-serif italic">
                  <span className="bg-white text-black w-8 h-8 flex items-center justify-center rounded-full text-sm not-italic font-sans">01</span>
                  Compra de sobres de 7 estampas
                </li>
                <li className="flex items-center gap-4 text-xl font-serif italic">
                  <span className="bg-white text-black w-8 h-8 flex items-center justify-center rounded-full text-sm not-italic font-sans">02</span>
                  Registro de ejemplares únicos (980 total)
                </li>
                <li className="flex items-center gap-4 text-xl font-serif italic opacity-60">
                  <span className="bg-white text-black w-8 h-8 flex items-center justify-center rounded-full text-sm not-italic font-sans">03</span>
                  Iteración masiva: {NUM_SIMULATIONS} coleccionistas
                </li>
              </ul>
            </div>

            <Button 
              className="w-full h-24 text-3xl font-black uppercase italic tracking-tighter" 
              variant="secondary" 
              onClick={runMonteCarlo}
              disabled={simRunning}
            >
              {simRunning ? 'PROCESANDO...' : 'INICIAR SIMULACIÓN'}
            </Button>
          </div>

          <div className="flex flex-col justify-center items-center">
            {simRunning ? (
               <div className="text-center space-y-4">
                 <div className="w-12 h-12 border-4 border-white border-t-emerald-400 rounded-full animate-spin mx-auto" />
                 <p className="font-mono text-emerald-200 text-sm">Abriendo sobres a velocidad luz...</p>
               </div>
            ) : (
              <div className="bg-emerald-950 p-10 border-4 border-black rotate-[-1deg] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md">
                <p className="text-amber-300 font-serif italic text-2xl mb-4 leading-tight">
                  "El azar no es más que la medida de nuestra ignorancia sobre el sistema."
                </p>
                <p className="text-xs font-mono text-emerald-500 uppercase tracking-widest text-right">— Henri Poincaré</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );

  const renderResults = () => {
    if (!resultsStats) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col p-10 space-y-10"
      >
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs uppercase tracking-widest font-black text-emerald-600 mb-1 block">Conclusiones del Laboratorio</span>
            <h2 className="text-5xl font-serif italic font-black">Resultados del Experimento</h2>
          </div>
          <div className="text-right">
            <Button variant="outline" onClick={() => { setSimResults([]); setCurrentStep('intro'); }}>
              <RotateCcw size={16} /> Reiniciar Clase
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-4 border-black divide-y-4 md:divide-y-0 md:divide-x-4 divide-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          {[
            { label: 'Media (Promedio)', value: `${Math.round(resultsStats.avg)} sobres`, color: 'text-emerald-600' },
            { label: 'Mediana', value: `${Math.round(resultsStats.med)} sobres`, color: 'text-slate-900' },
            { label: 'Máxima Suerte', value: `${resultsStats.min} sobres`, color: 'text-blue-600' },
            { label: 'Extremo (Outlier)', value: `${resultsStats.max} sobres`, color: 'text-rose-600' }
          ].map(stat => (
            <div key={stat.label} className="p-8 bg-white flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-black text-slate-400 mb-2">{stat.label}</span>
              <span className={`text-3xl font-black italic font-serif ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-600" /> Distribución Global de Probabilidad
              </h3>
              <span className="text-[10px] font-mono text-slate-400">n = {NUM_SIMULATIONS} simulaciones</span>
            </div>
            
            <div className="h-[350px] bg-slate-50 border-2 border-black p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resultsStats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="bin" axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                  <YAxis axisLine={{ stroke: '#000', strokeWidth: 2 }} hide />
                  <Tooltip 
                    contentStyle={{ border: '2px solid black', borderRadius: '0', fontWeight: 'bold' }}
                    labelFormatter={(label) => `Sobres: ${label}`}
                  />
                  <Area type="monotone" dataKey="count" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-900 border-4 border-black p-8 text-emerald-100 flex flex-col justify-center h-full relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-amber-400 font-serif italic text-3xl mb-4">La Realidad Financiera</h4>
                 <div className="space-y-4 text-sm font-medium">
                   <p className="border-b border-emerald-800 pb-2 flex justify-between">
                     <span>Costo Promedio:</span>
                     <span className="text-white font-black">${ (Math.round(resultsStats.avg) * PACK_PRICE + ALBUM_PRICE_SOFT).toLocaleString() } MXN</span>
                   </p>
                   <p className="bg-emerald-800 p-4 border-l-4 border-amber-400 text-xs leading-relaxed italic">
                     "Este modelo NO incluye intercambios. En la vida real, el 'Trading' reduce el costo en un 70%."
                   </p>
                   <p className="text-xs opacity-70">
                     Estadísticamente: El álbum Panini es una lección sobre los rendimientos decrecientes de la probabilidad.
                   </p>
                 </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t-2 border-black flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => { setSimResults([]); setCurrentStep('intro'); }} className="bg-white border-black text-black">
            <RotateCcw size={16} /> Reiniciar Clase
          </Button>
          <Button variant="primary" onClick={() => setCurrentStep('mc_explicacion')} className="bg-emerald-600 hover:bg-emerald-700 text-white border-black">
            Comprender Monte Carlo Paso a Paso <ChevronRight size={16} />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderFacets = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col bg-white overflow-hidden"
    >
      <header className="p-10 border-b-2 border-black flex justify-between items-center bg-slate-50">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-slate-400 block mb-1">Análisis Comparativo</span>
          <h2 className="text-5xl font-serif italic font-black text-slate-900 leading-none">Gráfico de <span className="text-emerald-600">Facetas</span></h2>
          <p className="text-sm font-medium text-slate-500 max-w-2xl mt-4">
            Compara la desigualdad interna dividiendo el mundo en regiones. El eje Y representa el salario en una escala relativa al líder de cada confederación.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setCurrentStep('central')}>
            <ChevronLeft size={16} /> Regresar
          </Button>
          <Button onClick={() => setCurrentStep('dispersion')}>
            Continuar <ChevronRight size={16} />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 overflow-y-auto bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {CONFEDERATION_DATA.map(confed => {
            // Usamos una escala de raíz cuadrada para que los valores pequeños sean visibles
            // frente a los gigantescos outliers de 200M
            const linearRatio = confed.avg / confed.top;
            const visualRatio = Math.max(Math.pow(linearRatio, 0.5) * 100, 8); 
            const inequalityFactor = Math.round(confed.top / confed.avg);
            
            return (
              <div key={confed.name} className="bg-white border-2 border-black group transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="p-4 border-b-2 border-black bg-white flex justify-between items-center">
                  <h4 className="font-black text-sm uppercase tracking-tighter italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: confed.color }} />
                    {confed.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-200">DATA_SYNCED</span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-4 border-b-4 border-black mb-6 py-8 bg-slate-50/50">
                    {/* Display Promedio */}
                    <div className="text-center px-2">
                       <span className="block text-[10px] font-black uppercase text-slate-400 leading-none mb-3 tracking-widest">Promedio</span>
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-serif italic font-black text-emerald-600 leading-none"
                       >
                         ${confed.avg}M
                       </motion.div>
                       <span className="block text-[8px] font-mono font-bold mt-2 text-slate-400">USD / AÑO</span>
                    </div>

                    {/* Display Top */}
                    <div className="text-center px-2 border-l-2 border-black/5">
                       <span className="block text-[10px] font-black uppercase text-slate-400 leading-none mb-3 tracking-widest">Top Seed</span>
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-serif italic font-black text-amber-500 leading-none"
                       >
                         ${confed.top >= 1 ? confed.top : confed.top.toFixed(1)}M
                       </motion.div>
                       <span className="block text-[8px] font-mono font-bold mt-2 text-slate-400 truncate px-1">
                         {confed.topPlayer.toUpperCase()}
                       </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black p-4 text-white flex justify-between items-center group-hover:bg-emerald-900 transition-colors shadow-[4px_4px_0px_0px_rgba(245,158,11,0.3)]">
                      <span className="text-[10px] font-black uppercase tracking-widest">Brecha de Desigualdad</span>
                      <span className="font-serif italic font-black text-amber-400 text-2xl">x{inequalityFactor}</span>
                    </div>
                    
                    <div className="border-l-4 border-emerald-500 pl-4 py-1">
                      <p className="text-[11px] leading-snug text-slate-500 font-medium italic">
                        {confed.info}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t-2 border-black flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Users size={12} className="text-slate-400" />
                     <span className="text-[9px] font-bold text-slate-500">{confed.topPlayer}</span>
                   </div>
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro': return renderIntro();
      case 'central': return renderCentralTendency();
      case 'facets': return renderFacets();
      case 'dispersion': return renderDispersion();
      case 'stats_lab': return <StatsLab onContinue={() => setCurrentStep('montecarlo_intro')} />;
      case 'montecarlo_intro': return renderMonteCarloIntro();
      case 'probability_curves': return renderProbabilityCurves();
      case 'law_of_large_numbers': return renderLawOfLargeNumbers();
      case 'montecarlo': return renderMonteCarlo();
      case 'results': return renderResults();
      case 'mc_explicacion': return <MCExplicacion onRestartClass={() => { setSimResults([]); setCurrentStep('intro'); }} />;
      default: return renderIntro();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans border-8 border-emerald-900 flex flex-col">
      {/* Header Section */}
      <header className="bg-emerald-900 text-white p-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400 mb-2">Laboratorio de Estadística Aplicada v1.0</p>
          <h1 className="text-4xl md:text-5xl font-serif italic font-black leading-none">El Dilema de Panini: <br className="hidden md:block" /> <span className="text-emerald-400">Probabilidad y Futbol</span></h1>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-end gap-4">
          <div className="hidden md:flex items-center gap-1 bg-white p-1 border-2 border-black">
             {(['intro', 'central', 'facets', 'dispersion', 'stats_lab', 'montecarlo_intro', 'probability_curves', 'law_of_large_numbers', 'montecarlo', 'results', 'mc_explicacion'] as Step[]).map((step, idx) => {
               const isActive = currentStep === step;
               const stepsMap: Record<Step, string> = {
                 intro: "In",
                 central: "Ct",
                 facets: "Fs",
                 dispersion: "Dp",
                 stats_lab: "Lb",
                 montecarlo_intro: "Th",
                 probability_curves: "Pb",
                 law_of_large_numbers: "Ly",
                 montecarlo: "Sm",
                 results: "Rs",
                 mc_explicacion: "Ps"
               };
               return (
                 <div 
                  key={step}
                  onClick={() => !simRunning && setCurrentStep(step)}
                  className={`px-2 py-1 text-[10px] font-black uppercase cursor-pointer transition-all ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-black'}`}
                  title={step}
                 >
                   {stepsMap[step]}
                 </div>
               );
             })}
          </div>
          <div className="inline-block border-2 border-white px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
            SESIÓN: {currentStep.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-white relative overflow-hidden">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </main>

      {/* Footer Professor Controls */}
      <footer className="bg-black text-white p-4 flex justify-between items-center border-t-4 border-emerald-900">
        <div className="flex gap-4">
          <div className="flex items-center gap-4 text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest hidden md:flex mr-4">
            <span>TEACHER MODE: ACTIVE</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-black text-emerald-400">
          <span className="flex items-center gap-1">980 Estampas</span>
          <span className="flex items-center gap-1">48 Selecciones</span>
          <span className="flex items-center gap-1">$25 / Sobre</span>
        </div>
      </footer>
    </div>
  );
}
