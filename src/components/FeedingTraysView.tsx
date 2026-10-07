import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';

interface FeedingTray {
  id: string;
  tankId: string;
  batchId: string;
  checkTime: string;
  traysInspectedCount: number;
  trayStatus: 'LIMPO' | 'POUCA_SOBRA' | 'SOBRA_MEDIA' | 'SOBRA_ALTA';
  leftoverPercentage: number;
  adjustmentSuggestedPct: number;
  aiRecommendation?: string;
  createdAt: string;
}

export const FeedingTraysView: React.FC = () => {
  const [trays, setTrays] = useState<FeedingTray[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [tankId, setTankId] = useState<string>('tank-04');
  const [batchId, setBatchId] = useState<string>('batch-04');
  const [checkTime, setCheckTime] = useState<string>('09:30');
  const [traysInspectedCount, setTraysInspectedCount] = useState<number>(10);
  const [trayStatus, setTrayStatus] = useState<'LIMPO' | 'POUCA_SOBRA' | 'SOBRA_MEDIA' | 'SOBRA_ALTA'>('LIMPO');
  const [leftoverPercentage, setLeftoverPercentage] = useState<number>(0);

  const fetchTrays = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/feeding-trays?tenantId=tenant-river-life');
      if (res.ok) {
        const data = await res.json();
        setTrays(data.trays || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar bandejas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrays();
  }, []);

  const handleAddTray = async (e: React.FormEvent) => {
    e.preventDefault();
    let adj = 0;
    let rec = '';
    if (trayStatus === 'LIMPO') {
      adj = 10;
      rec = 'Comedouros 100% limpos após 2h do trato. Recomenda-se aumentar +10% de ração no próximo trato.';
    } else if (trayStatus === 'POUCA_SOBRA') {
      adj = 0;
      rec = 'Sobra mínima aceitável. Manter quantidade no próximo trato para evitar acúmulo no fundo.';
    } else if (trayStatus === 'SOBRA_MEDIA') {
      adj = -15;
      rec = 'Sobra perceptível (20-30%). Reduzir -15% de ração no próximo trato e monitorar oxigênio.';
    } else {
      adj = -100;
      rec = '🚨 Sobra excessiva (>50%). Suspender o próximo trato imediatamente para evitar pico de amônia.';
    }

    try {
      const res = await fetch('/api/db/feeding-trays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-river-life',
          tankId,
          batchId,
          checkTime,
          traysInspectedCount,
          trayStatus,
          leftoverPercentage,
          adjustmentSuggestedPct: adj,
          aiRecommendation: rec,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTrays();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIMPO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">100% Limpo (+10%)</span>;
      case 'POUCA_SOBRA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Pouca Sobra (Manter)</span>;
      case 'SOBRA_MEDIA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Sobra Média (-15%)</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Sobra Alta (Suspender)</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Manejo de Comedouros & Bandejas
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Padrão Ouro de Arraçoamento
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Checagem após 2h do trato para calibração diária de ração e prevenção de amônia
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Registrar Checagem de Bandeja
        </button>
      </div>

      {/* Banner Didático e Fácil de Entender */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">💡 Como funciona para qualquer um entender: </span>
          O comedouro é como o pratinho de almoço do camarão! A gente coloca a ração e, depois de 2 horas, puxa a cordinha da bandeja para olhar. Se o pratinho estiver limpinho, o camarão comeu tudinho! Se sobrar comida demais, o sistema avisa para dar um pouquinho menos no próximo trato para não sujar a água da piscina!
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Horários Padrão de Trato
          </div>
          <div className="text-base font-bold text-white">07h • 11h • 15h • 20h</div>
          <div className="text-[10px] text-slate-500 mt-1">4 tratos diários fracionados</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Eficiência de Consumo
          </div>
          <div className="text-base font-bold text-emerald-400">94.2%</div>
          <div className="text-[10px] text-slate-500 mt-1">Média semanal de aproveitamento</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Sobra Média em Bandeja
          </div>
          <div className="text-base font-bold text-amber-400">2.8%</div>
          <div className="text-[10px] text-slate-500 mt-1">Abaixo do limiar crítico (10%)</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Oráculo Zootécnico IA
          </div>
          <div className="text-base font-bold text-cyan-400">Ativo</div>
          <div className="text-[10px] text-slate-500 mt-1">Ajuste autônomo por temperatura</div>
        </div>
      </div>

      {/* Tabela de Leituras */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-400" /> Registros de Comedouros Recentes
          </h3>
          <span className="text-xs text-slate-400">{trays.length} avaliações</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Carregando dados de bandejas...</div>
        ) : trays.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhuma checagem de bandeja registrada ainda. Clique em "Registrar Checagem" para adicionar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Tanque / Lote</th>
                  <th className="p-3.5">Horário da Checagem</th>
                  <th className="p-3.5">Bandejas Inspecionadas</th>
                  <th className="p-3.5">Status do Comedouro</th>
                  <th className="p-3.5">% de Sobra</th>
                  <th className="p-3.5">Recomendação Zootécnica IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trays.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white uppercase">{t.tankId} • {t.batchId}</td>
                    <td className="p-3.5 font-mono text-cyan-400">{t.checkTime}</td>
                    <td className="p-3.5">{t.traysInspectedCount} bandejas</td>
                    <td className="p-3.5">{getStatusBadge(t.trayStatus)}</td>
                    <td className="p-3.5 font-mono">{t.leftoverPercentage}%</td>
                    <td className="p-3.5 text-slate-200">
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{t.aiRecommendation || 'Manter manejo padrão.'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro de Bandeja */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" /> Inspecionar Bandeja de Comedouro
            </h3>
            <form onSubmit={handleAddTray} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tanque / Viveiro:</label>
                <select
                  value={tankId}
                  onChange={(e) => setTankId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="tank-01">Tanque 01 (Berçário)</option>
                  <option value="tank-02">Tanque 02 (Transição)</option>
                  <option value="tank-03">Tanque 03 (Engorda A)</option>
                  <option value="tank-04">Tanque 04 (Engorda Premium)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Horário da Checagem:</label>
                  <input
                    type="time"
                    value={checkTime}
                    onChange={(e) => setCheckTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Qtd. Bandejas Vistas:</label>
                  <input
                    type="number"
                    value={traysInspectedCount}
                    onChange={(e) => setTraysInspectedCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Condição do Comedouro:</label>
                <select
                  value={trayStatus}
                  onChange={(e) => {
                    const st = e.target.value as any;
                    setTrayStatus(st);
                    if (st === 'LIMPO') setLeftoverPercentage(0);
                    else if (st === 'POUCA_SOBRA') setLeftoverPercentage(5);
                    else if (st === 'SOBRA_MEDIA') setLeftoverPercentage(25);
                    else setLeftoverPercentage(60);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="LIMPO">100% Limpo (Sem Sobras - Aumentar +10%)</option>
                  <option value="POUCA_SOBRA">Pouca Sobra (&lt; 10% - Manter Trato)</option>
                  <option value="SOBRA_MEDIA">Sobra Média (20-30% - Reduzir 15%)</option>
                  <option value="SOBRA_ALTA">Sobra Excessiva (&gt; 50% - Suspender Trato)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center justify-between">
                  <span>% Estimada de Sobra de Ração:</span>
                  <span className="text-cyan-400 font-mono">{leftoverPercentage}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={leftoverPercentage}
                  onChange={(e) => setLeftoverPercentage(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
