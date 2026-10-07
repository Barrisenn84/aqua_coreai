import React, { useState } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  DollarSign,
  FileCheck,
  Flame,
  Globe,
  Handshake,
  Lock,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { initialBuyerBids, initialMarketListings } from '../data/marketBridgeData';
import { MarketBuyerBid } from '../types/aquacore';
import { MarketWatch } from './MarketWatch';
import { MarketScenariosSimulator } from './MarketScenariosSimulator';

export const MarketBridgeView: React.FC = () => {
  const { farm, batches, tanks } = useAquaCore();

  const [bids, setBids] = useState<MarketBuyerBid[]>(initialBuyerBids);
  const [selectedBid, setSelectedBid] = useState<MarketBuyerBid | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [contractSuccess, setContractSuccess] = useState<boolean>(false);
  const [isListed, setIsListed] = useState<boolean>(false);

  const targetBatch = batches.find((b) => b.tankId === 'tank-01') || batches[0];
  const targetTank = tanks.find((t) => t.id === 'tank-01') || tanks[0];
  // Biomassa comercial projetada (100.000 un @ 15g = 1.50 t por tanque, ou total da fazenda 5.70 t)
  const totalBiomassTons = (
    (batches.reduce((acc, b) => acc + (b.currentCount || 0), 0) * 15) / 1000000
  ).toFixed(2);

  const handleOpenContract = (bid: MarketBuyerBid) => {
    setSelectedBid(bid);
    setIsContractModalOpen(true);
  };

  const handleConfirmContract = () => {
    if (!selectedBid) return;
    setBids((prev) =>
      prev.map((b) => (b.id === selectedBid.id ? { ...b, status: 'closed' } : b))
    );
    setContractSuccess(true);
    setTimeout(() => {
      setContractSuccess(false);
      setIsContractModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Handshake className="w-4 h-4 text-cyan-400" />
            <span>Pilar 4 • Do Tanque ao Dinheiro (Zero Atravessadores)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Market-Bridge Aquícola (Bolsa Direta de Compradores)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              +12% MARGEM DIRETA
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Integra a prontidão zootécnica aos frigoríficos e atacadistas homologados. Quando o camarão atinge o calibre comercial, o produtor negocia a carga direto na fonte sem intermediários.
          </p>
        </div>

        {/* Live Index Ticker */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-right space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Cotação Polo Paraíba & NE</span>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-slate-100 font-bold">Camarão Vannamei:</span>
            <span className="text-emerald-400 font-black">R$ 24,50/kg (+6.5%)</span>
          </div>
        </div>
      </div>

      {/* Live Regional Market Watch (Polo Paraíba & Nordeste) */}
      <MarketWatch />

      {/* MÓDULO DE CENÁRIOS DE MERCADO & SIMULAÇÃO DE LUCRO PROJETADO */}
      <MarketScenariosSimulator />

      {/* DISRUPTIVE PROACTIVE ALERT BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border-2 border-emerald-500/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-emerald-500 text-slate-950">
                GATILHO DE VENDA ANTECIPADA
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Lote {targetBatch.batchCode} ({targetBatch.species} • Calibre Comercial Alvo 15g)
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white">
              "Produção ativa de 380.000 pós-larvas na Fazenda River Life (Mogeiro - PB). Cotação regional favorável (+6.5%). Deseja travar contratos futuros e listar a safra para compradores homologados?"
            </h2>

            <p className="text-xs text-slate-300 font-mono">
              Biomassa comercial projetada: <strong>{totalBiomassTons} toneladas</strong> • Janela de despesca: <strong>Novembro/2026</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsListed(true)}
              className={`px-5 py-3 rounded-xl text-xs font-black font-mono uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
                isListed
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isListed ? 'Safra Listada no Mercado ✓' : 'Listar Produção para Frigoríficos'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Buyers Bid Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Lances e Propostas de Compradores Homologados ({bids.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Preços com Ágio para Calibre &gt; 800g
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bids.map((bid) => {
            const isClosed = bid.status === 'closed';
            const totalDealValue = Number(totalBiomassTons) * 1000 * bid.pricePerKg;

            return (
              <div
                key={bid.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isClosed
                    ? 'bg-emerald-950/30 border-emerald-700/60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/60 shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm">{bid.buyerName}</h3>
                        {bid.verifiedBadge && (
                          <span title="Comprador Homologado AQUA-CORE" className="inline-flex items-center">
                            <BadgeCheck className="w-4 h-4 text-cyan-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {bid.buyerType} • {bid.location}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xl font-black text-emerald-400">
                        R$ {bid.pricePerKg.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/kg vivo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono mb-3">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Ágio sobre Cepea</span>
                      <span className="font-bold text-emerald-400">+{bid.premiumDeltaPct}%</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Faixa de Peso</span>
                      <span className="font-bold text-slate-200">{bid.minWeightG}g - {bid.maxWeightG}g</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block">Volume Total Lote</span>
                      <span className="font-bold text-cyan-300">R$ {totalDealValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Pagamento: <strong>{bid.paymentTerm}</strong></span>
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenContract(bid)}
                    disabled={isClosed}
                    className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isClosed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                    }`}
                  >
                    <Handshake className="w-4 h-4" />
                    <span>{isClosed ? 'Contrato Homologado & Fechado ✓' : 'Travar Preço & Fechar Contrato'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contract Lock Modal */}
      {isContractModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Formalização de Contrato Direto (Sem Atravessador)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Garantia de Preço Travado na Despesca
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 font-mono text-xs">
              {contractSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  <h4 className="text-base font-bold text-emerald-300">
                    Contrato Travado com Sucesso!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Frigorífico {selectedBid.buyerName} notificado. Logística de despesca agendada sem intermediários.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Comprador:</span>
                      <span className="font-bold text-white">{selectedBid.buyerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preço Homologado:</span>
                      <span className="font-black text-emerald-400">R$ {selectedBid.pricePerKg.toFixed(2)}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carga Estimada:</span>
                      <span className="font-bold text-slate-200">{totalBiomassTons} toneladas</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                      <span className="text-slate-300 font-bold">Valor Total do Lote:</span>
                      <span className="font-black text-cyan-300">
                        R$ {(Number(totalBiomassTons) * 1000 * selectedBid.pricePerKg).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Ao confirmar, você bloqueia este preço para despesca na data prevista pelo Preditor de Biomassa (12 de Outubro). O frigorífico envia caminhão oxigenado na data sem cobrança de frete adicional.
                  </p>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsContractModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmContract}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Assinar Contrato Digital</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
