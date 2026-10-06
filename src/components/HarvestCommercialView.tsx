import React, { useState, useEffect } from 'react';
import {
  Anchor,
  TrendingUp,
  DollarSign,
  Scale,
  Plus,
  Calendar,
  FileText,
  Truck,
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';

interface HarvestRecord {
  id: string;
  tenantId: string;
  tankId: string;
  batchId: string;
  harvestType: 'TOTAL' | 'DESBASTE_PARCIAL';
  totalWeightKg: number;
  shrimpCountEstimated: number;
  avgWeightG: number;
  commercialClassification: string;
  pricePerKg: number;
  totalRevenue: number;
  buyerName: string;
  gtaNumber?: string;
  notes?: string;
  createdAt: string;
}

export const HarvestCommercialView: React.FC = () => {
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [tankId, setTankId] = useState<string>('tank-01');
  const [batchId, setBatchId] = useState<string>('batch-01');
  const [harvestType, setHarvestType] = useState<'TOTAL' | 'DESBASTE_PARCIAL'>('DESBASTE_PARCIAL');
  const [totalWeightKg, setTotalWeightKg] = useState<number>(1250);
  const [avgWeightG, setAvgWeightG] = useState<number>(14.5);
  const [commercialClassification, setCommercialClassification] = useState<string>('60/70');
  const [pricePerKg, setPricePerKg] = useState<number>(27.50);
  const [buyerName, setBuyerName] = useState<string>('Frigorífico Mar do Nordeste');
  const [gtaNumber, setGtaNumber] = useState<string>('GTA-PB-2026-88192');
  const [notes, setNotes] = useState<string>('Despesca realizada às 03:00 com água hiper-gelada.');

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/harvests?tenantId=tenant-river-life');
      if (res.ok) {
        const data = await res.json();
        setHarvests(data.harvests || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar despescas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const totalBiomassHarvested = harvests.reduce((acc, h) => acc + h.totalWeightKg, 0);
  const totalRevenueHarvested = harvests.reduce((acc, h) => acc + h.totalRevenue, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const weight = Number(totalWeightKg);
      const price = Number(pricePerKg);
      const avgW = Number(avgWeightG);
      const count = Math.round((weight * 1000) / avgW);
      const revenue = weight * price;

      const payload = {
        tenantId: 'tenant-river-life',
        tankId,
        batchId,
        harvestType,
        totalWeightKg: weight,
        shrimpCountEstimated: count,
        avgWeightG: avgW,
        commercialClassification,
        pricePerKg: price,
        totalRevenue: revenue,
        buyerName,
        gtaNumber: gtaNumber || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/db/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        await fetchHarvests();
      }
    } catch (err) {
      console.error('Erro ao salvar despesca:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Anchor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Despescas, Romaneio & Comercialização
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Calibres Comerciais
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Gestão de desbastes parciais, despescas totais, pesagem na borda do tanque e emissão de romaneio de expedição com GTA.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg shadow-emerald-950/40 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Nova Despesca
        </button>
      </div>

      {/* Cards de Métricas Comerciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Faturamento Bruto Acumulado</div>
            <div className="text-2xl font-bold text-emerald-400">
              R$ {totalRevenueHarvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Biomassa Despescada Total</div>
            <div className="text-2xl font-bold text-cyan-400">
              {totalBiomassHarvested.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Preço Médio Praticado</div>
            <div className="text-2xl font-bold text-amber-300">
              R$ 27,20 <span className="text-xs font-normal text-slate-400">/kg</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total de Despescas Feitas</div>
            <div className="text-2xl font-bold text-indigo-300">
              {harvests.length} <span className="text-xs font-normal text-slate-400">lotes colhidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Oportunidade Comercial de Mercado */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 border border-emerald-800/40 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-emerald-200">
              Radar Comercial Inteligente & Curva de Calibres
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O mercado consumidor está pagando <strong className="text-emerald-300">R$ 31,00/kg</strong> para o calibre <strong>50/60 (18 a 20g)</strong> e <strong>R$ 26,00/kg</strong> para o calibre <strong>70/80 (12 a 14g)</strong>.
              Recomendamos realizar um <strong>desbaste de 30%</strong> no Viveiro 04 na próxima quinta-feira às 02h da madrugada. Isso aliviará a carga orgânica e permitirá que a biomassa remanescente atinja 18g em mais 12 dias de cultivo.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Despescas e Romaneios */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-emerald-400" />
            Romaneio Histórico de Despescas & Expedições
          </h3>
          <span className="text-xs text-slate-400">{harvests.length} expedições</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando despescas...</div>
        ) : harvests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhuma despesca cadastrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Viveiro / Lote</th>
                  <th className="py-3 px-4 font-medium">Modalidade</th>
                  <th className="py-3 px-4 font-medium">Data</th>
                  <th className="py-3 px-4 font-medium">Peso Total (kg)</th>
                  <th className="py-3 px-4 font-medium">Peso Médio / Calibre</th>
                  <th className="py-3 px-4 font-medium">Preço / Total Bruto</th>
                  <th className="py-3 px-4 font-medium">Comprador & GTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {harvests.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-semibold">{h.tankId.toUpperCase()}</span>
                        <span className="text-slate-500">({h.batchId})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        h.harvestType === 'TOTAL'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                          : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                      }`}>
                        {h.harvestType === 'TOTAL' ? 'Despesca Total' : 'Desbaste Parcial'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(h.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {h.totalWeightKg.toLocaleString('pt-BR')} kg
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{h.avgWeightG} g</div>
                      <div className="text-[11px] text-amber-400 font-medium">Calibre {h.commercialClassification}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-emerald-400 font-bold">
                        R$ {h.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        R$ {h.pricePerKg.toFixed(2)}/kg
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{h.buyerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{h.gtaNumber || 'Sem GTA'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Nova Despesca */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Anchor className="w-5 h-5 text-emerald-400" />
                Registrar Despesca & Romaneio
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="tank-01">Viveiro 01 (0.8 ha)</option>
                    <option value="tank-02">Viveiro 02 (1.2 ha)</option>
                    <option value="tank-03">Viveiro 03 (1.0 ha)</option>
                    <option value="tank-04">Viveiro 04 (1.5 ha)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Despesca</label>
                  <select
                    value={harvestType}
                    onChange={(e) => setHarvestType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DESBASTE_PARCIAL">Desbaste Parcial (Despesca Parcial)</option>
                    <option value="TOTAL">Despesca Total (Esvaziamento)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Peso Total (kg)</label>
                  <input
                    type="number"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Peso Médio (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgWeightG}
                    onChange={(e) => setAvgWeightG(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Calibre</label>
                  <select
                    value={commercialClassification}
                    onChange={(e) => setCommercialClassification(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="40/50">40/50 (20 a 25g)</option>
                    <option value="50/60">50/60 (16 a 20g)</option>
                    <option value="60/70">60/70 (14 a 16g)</option>
                    <option value="70/80">70/80 (12 a 14g)</option>
                    <option value="80/100">80/100 (10 a 12g)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Preço Negociado (R$/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nº GTA (Guia Sanitária)</label>
                  <input
                    type="text"
                    value={gtaNumber}
                    onChange={(e) => setGtaNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Comprador / Destino</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Faturado Calculado:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  R$ {(Number(totalWeightKg) * Number(pricePerKg)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40"
                >
                  Registrar Despesca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
