import React, { useState, useEffect } from 'react';
import {
  Skull,
  Moon,
  Plus,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
  Layers,
  HeartPulse,
  Compass
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface MortalityRecord {
  id: string;
  tenantId: string;
  tankId: string;
  batchId: string;
  quantity: number;
  lunarPhase: string;
  probableCause: string;
  notes?: string;
  createdAt: string;
}

export const MortalityMoltView: React.FC = () => {
  const { recordMortality } = useAquaCore();
  const [logs, setLogs] = useState<MortalityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [tankId, setTankId] = useState<string>('tank-01');
  const [batchId, setBatchId] = useState<string>('batch-01');
  const [quantity, setQuantity] = useState<number>(45);
  const [lunarPhase, setLunarPhase] = useState<string>('Lua Cheia');
  const [probableCause, setProbableCause] = useState<string>('Ecdise Incompleta (Estresse de Muda)');
  const [notes, setNotes] = useState<string>('');

  const fetchMortality = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/mortality?tenantId=tenant-river-life');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar mortalidade:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMortality();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🔄 Cruza e integra em tempo real com todo o sistema AQUA-CORE
      await recordMortality({
        tankId,
        batchId,
        quantity: Number(quantity),
        lunarPhase,
        probableCause,
        notes: notes || undefined,
      });

      setIsModalOpen(false);
      setNotes('');
      await fetchMortality();
    } catch (err) {
      console.error('Erro ao salvar mortalidade:', err);
    }
  };

  const totalMortality = logs.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Sanidade Aquícola, Mudas Lunares & Mortalidade
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Carcinicultura Avançada
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Monitoramento da ecdise (troca de casca) sincronizada pelas fases lunares e detecção precoce de anomalias patológicas.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-rose-950/40 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Evento Sanitário
        </button>
      </div>

      {/* Banner Didático e Fácil de Entender */}
      <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">💡 Como funciona para qualquer um entender: </span>
          O camarão é como um cavaleiro que troca de armadura quando cresce! Isso acontece especialmente quando a Lua está Nova ou Cheia. Quando ele troca de casquinha, ele fica molinho e cansado por algumas horas. Por isso, a gente reforça o oxigênio e os minerais na água para proteger ele enquanto a casquinha nova endurece!
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Mortalidade Total Acumulada</div>
            <div className="text-2xl font-bold text-rose-400">
              {totalMortality.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">indivíduos</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Sobrevivência Estimada Média</div>
            <div className="text-2xl font-bold text-emerald-400">
              82.4% <span className="text-xs font-normal text-slate-400">meta: &gt;75%</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Fase Lunar Corrente</div>
            <div className="text-xl font-bold text-amber-300">
              Lua Cheia <span className="text-xs font-normal text-amber-400/80">(Pico de Ecdise)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Status Sanitário do Rebanho</div>
            <div className="text-lg font-bold text-cyan-300">
              Biosegurança Nível A
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Inteligência Zootécnica & Lunar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-800/40 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
              Protocolo Oráculo Dr. Camarão | Ecdise Sincronizada & Manejo de Muda
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Durante as fases de <strong className="text-amber-300">Lua Cheia</strong> e <strong className="text-amber-300">Lua Nova</strong>, mais de 65% do lote entra em ecdise simultânea. 
              Neste intervalo, os camarões ficam com a carapaça desmineralizada e vulneráveis ao canibalismo e à asfixia. 
              <strong> Ações imediatas recomendadas:</strong> Elevar a aeração noturna em 25%, suspender 15% do arraçoamento no dia da muda para evitar fermentação bentônica, e aplicar 80 kg/ha de calcário dolomítico + cloreto de magnésio para acelerar a calcificação do exoesqueleto em até 14 horas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Histórico de Mortalidade */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-rose-400" />
            Registro de Ocorrências Sanitárias e Descarte
          </h3>
          <span className="text-xs text-slate-400">{logs.length} registros</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando dados de sanidade...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhum evento registrado. Excelente sanidade no criatório!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Viveiro / Lote</th>
                  <th className="py-3 px-4 font-medium">Data/Hora</th>
                  <th className="py-3 px-4 font-medium">Quantidade</th>
                  <th className="py-3 px-4 font-medium">Fase Lunar</th>
                  <th className="py-3 px-4 font-medium">Causa Provável Identificada</th>
                  <th className="py-3 px-4 font-medium">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-rose-400 font-semibold">{log.tankId.toUpperCase()}</span>
                        <span className="text-slate-500">({log.batchId})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(log.createdAt).toLocaleDateString('pt-BR')} {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-400">
                      {log.quantity} cam.
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Moon className="w-3 h-3" />
                        {log.lunarPhase}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">
                        {log.probableCause}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro de Mortalidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Skull className="w-5 h-5 text-rose-400" />
                Registrar Ocorrência Sanitária
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Viveiro</label>
                  <select
                    value={tankId}
                    onChange={(e) => setTankId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="tank-01">Viveiro 01 (0.8 ha)</option>
                    <option value="tank-02">Viveiro 02 (1.2 ha)</option>
                    <option value="tank-03">Viveiro 03 (1.0 ha)</option>
                    <option value="tank-04">Viveiro 04 (1.5 ha)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Lote</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Qtd. Camarões Encontrados</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fase da Lua</label>
                  <select
                    value={lunarPhase}
                    onChange={(e) => setLunarPhase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Lua Cheia">Lua Cheia (Pico Ecdise)</option>
                    <option value="Lua Nova">Lua Nova (Pico Ecdise)</option>
                    <option value="Quarto Crescente">Quarto Crescente</option>
                    <option value="Quarto Minguante">Quarto Minguante</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Causa Provável / Diagnóstico</label>
                <select
                  value={probableCause}
                  onChange={(e) => setProbableCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Ecdise Incompleta (Estresse de Muda)">Ecdise Incompleta (Estresse de Muda)</option>
                  <option value="Hipóxia Noturna (Baixo O2)">Hipóxia Noturna (Baixo Oxigênio Dissolvido)</option>
                  <option value="Pico de Amônia Tóxica (NH3)">Pico de Amônia Tóxica (NH3) / Nitrito</option>
                  <option value="Suspeita de IMNV (Mionecrose)">Suspeita de IMNV (Mionecrose Infecciosa)</option>
                  <option value="Suspeita de WSSV (Mancha Branca)">Suspeita de WSSV (Vírus da Mancha Branca)</option>
                  <option value="Vibriose / Hepatopâncreas Descorado">Vibriose / Hepatopâncreas Descorado</option>
                  <option value="Canibalismo Pós-Muda">Canibalismo Pós-Muda</option>
                  <option value="Predação por Aves">Predação por Aves Aquáticas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações do Viveirista</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Carapaça mole, hepatopâncreas pálido, encontrados na margem leste..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-950/40"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
