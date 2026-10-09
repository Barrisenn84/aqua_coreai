import React, { useState } from 'react';
import {
  Waves,
  X,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Ruler,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface AddTankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTankModal: React.FC<AddTankModalProps> = ({ isOpen, onClose }) => {
  const { addTank, currentTenant } = useAquaCore();

  const [name, setName] = useState('');
  const [type, setType] = useState<'escavado' | 'berçário' | 'geomembrana' | 'raceways'>('escavado');
  const [areaM2, setAreaM2] = useState<number>(1500);
  const [depthM, setDepthM] = useState<number>(1.5);
  const [aeratorCount, setAeratorCount] = useState<number>(2);
  const [aeratorPowerKw, setAeratorPowerKw] = useState<number>(2.2);

  // Lote inicial
  const [createInitialBatch, setCreateInitialBatch] = useState<boolean>(true);
  const [batchCode, setBatchCode] = useState('');
  const [initialShrimpCount, setInitialShrimpCount] = useState<string>('');
  const [initialWeightG, setInitialWeightG] = useState<number>(0.02);

  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const volumeM3 = Math.round(areaM2 * depthM);
  const areaHa = (areaM2 / 10000).toFixed(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTank({
      name: name.trim(),
      type,
      areaM2,
      depthM,
      volumeM3,
      aeratorCount,
      aeratorPowerKw,
      aeratorActive: true,
      status: 'optimal',
      initialBatchCode: createInitialBatch ? (batchCode.trim() || `Lote_${Date.now().toString().slice(-4)}`) : undefined,
      initialShrimpCount: createInitialBatch ? Number(initialShrimpCount) : 0,
      initialWeightG: createInitialBatch ? initialWeightG : 0.02,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setName('');
      setBatchCode('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Cadastrar Novo Tanque / Viveiro Real</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  REAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adicione os parâmetros reais dos seus tanques para monitoramento de telemetria e IA.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tanque cadastrado com sucesso no seu negócio!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Dados Físicos */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              1. Identificação & Dimensões do Viveiro
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nome / Identificação</label>
                <input
                  type="text"
                  placeholder="Ex: Tanque 01, Viveiro Principal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipo de Estrutura</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-bold focus:border-cyan-500 outline-none"
                >
                  <option value="escavado">Escavado em Terra</option>
                  <option value="berçário">Berçário Primário / Estufa</option>
                  <option value="geomembrana">Revestido em Geomembrana (PEAD)</option>
                  <option value="raceways">Raceways de Alta Densidade</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-slate-400 mb-1 text-[10px]">Área (m²)</label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500 outline-none"
                  required
                />
                <span className="text-[10px] text-cyan-400 mt-0.5 block">{areaHa} ha</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[10px]">Profundidade (m)</label>
                <input
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={depthM}
                  onChange={(e) => setDepthM(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500 outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Lâmina d'água</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[10px]">Volume Estimado</label>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold">
                  {volumeM3.toLocaleString('pt-BR')} m³
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Automático</span>
              </div>
            </div>
          </div>

          {/* Aeração & Potência */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              2. Equipamentos de Aeração
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nº de Aeradores</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={aeratorCount}
                  onChange={(e) => setAeratorCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Potência Unitária (kW / CV)</label>
                <input
                  type="number"
                  min="0.5"
                  max="15"
                  step="0.1"
                  value={aeratorPowerKw}
                  onChange={(e) => setAeratorPowerKw(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Lote Inicial */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                3. Povoamento & Lote Ativo
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={createInitialBatch}
                  onChange={(e) => setCreateInitialBatch(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Criar Lote Inicial</span>
              </label>
            </div>

            {createInitialBatch && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">Identificador do Lote</label>
                  <input
                    type="text"
                    placeholder="Ex: Lote_01"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">Qtd. Povoada (PLs de Camarão/un)</label>
                  <input
                    type="number"
                    value={initialShrimpCount}
                    onChange={(e) => setInitialShrimpCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">Peso Inicial (g)</label>
                  <input
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={initialWeightG}
                    onChange={(e) => setInitialWeightG(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Salvar Tanque no Meu Negócio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
