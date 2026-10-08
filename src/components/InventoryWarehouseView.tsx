import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Warehouse,
  Sparkles,
  Search,
  Camera,
  Coins
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface InventoryItem {
  id: string;
  tenantId: string;
  brand: string;
  name: string;
  category: string;
  itemType: string;
  unit: string;
  proteinPercent: number;
  currentStockKg: number;
  minStockAlertKg: number;
  costPerKg: number;
  location: string;
  status: 'NORMAL' | 'ABAIXO_MINIMO' | 'ESGOTADO';
  notes?: string;
  createdAt: string;
}

interface InventoryWarehouseViewProps {
  onOpenScanner?: () => void;
}

export const InventoryWarehouseView: React.FC<InventoryWarehouseViewProps> = ({ onOpenScanner }) => {
  const { totalBiomassKg, batches } = useAquaCore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [brand, setBrand] = useState<string>('Guabi Nutrição');
  const [name, setName] = useState<string>('Pirá Crescimento 35%');
  const [category] = useState<string>('Ração');
  const [itemType, setItemType] = useState<string>('Ração Extrusada 2.5mm');
  const [unit, setUnit] = useState<string>('kg');
  const [proteinPercent, setProteinPercent] = useState<number>(35.0);
  const [currentStockKg, setCurrentStockKg] = useState<number>(1500);
  const [minStockAlertKg, setMinStockAlertKg] = useState<number>(500);
  const [costPerKg, setCostPerKg] = useState<number>(6.80);
  const [location, setLocation] = useState<string>('Galpão Principal - Palete A2');
  const [notes, setNotes] = useState<string>('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/inventory?tenantId=tenant-river-life');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar estoque:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const totalStockKg = items.reduce((acc, it) => acc + it.currentStockKg, 0);
  const totalStockValue = items.reduce((acc, it) => acc + it.currentStockKg * it.costPerKg, 0);
  const alertItemsCount = items.filter((it) => it.status !== 'NORMAL').length;

  // 🔄 Cálculo Zootécnico em Tempo Real cruzando Estoque x Biomassa Ativa
  const dailyFeedNeededKg = Math.max(12, Math.round((totalBiomassKg || 380) * 0.035 * 10) / 10);
  const feedItems = items.filter((it) => {
    const c = (it.category || '').toLowerCase();
    const t = (it.itemType || '').toLowerCase();
    const n = (it.name || '').toLowerCase();
    return c.includes('ração') || t.includes('ração') || n.includes('samaria') || n.includes('guabi') || n.includes('starter');
  });
  const totalFeedStockKg = feedItems.reduce((acc, it) => acc + it.currentStockKg, 0);
  const feedAutonomyDays = dailyFeedNeededKg > 0 ? Number((totalFeedStockKg / dailyFeedNeededKg).toFixed(1)) : 999;

  const filteredItems = items.filter(
    (it) =>
      it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stock = Number(currentStockKg);
      const min = Number(minStockAlertKg);
      let status: 'NORMAL' | 'ABAIXO_MINIMO' | 'ESGOTADO' = 'NORMAL';
      if (stock <= 0) status = 'ESGOTADO';
      else if (stock < min) status = 'ABAIXO_MINIMO';

      const payload = {
        tenantId: 'tenant-river-life',
        brand,
        name,
        category,
        itemType,
        unit,
        proteinPercent: Number(proteinPercent),
        currentStockKg: stock,
        minStockAlertKg: min,
        costPerKg: Number(costPerKg),
        location,
        status,
        notes: notes || undefined,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/db/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        await fetchItems();
      }
    } catch (err) {
      console.error('Erro ao salvar item de estoque:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Galpão & Armazém Inteligente de Insumos
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Rações & Calagem
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Controle de rações, probióticos, corretivos e calcário com previsão de autonomia e ponto de reposição.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-medium text-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              Escanear Saco/Rótulo
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-lg shadow-amber-950/40 transition-all text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Insumo
          </button>
        </div>
      </div>

      {/* Banner Didático e Fácil de Entender */}
      <div className="bg-orange-950/30 border border-orange-500/30 rounded-xl p-3 text-xs text-orange-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">💡 Como funciona para qualquer um entender: </span>
          O galpão é como a dispensa da cozinha de casa! Aqui ficam guardados os sacos de ração que alimentam os camarões, os adubos para a terra do viveiro e os produtos para limpar a água. O computador conta quantos sacos ainda temos e avisa quando estiver quase no fim para nunca faltar comidinha para os camarões!
        </div>
      </div>

      {/* Cards de Indicadores do Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Estoque Físico Total</div>
            <div className="text-2xl font-bold text-amber-400">
              {totalStockKg.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Capital Imobilizado em Armazém</div>
            <div className="text-2xl font-bold text-emerald-400">
              R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${feedAutonomyDays < 3 ? 'bg-rose-500/10 text-rose-400' : feedAutonomyDays < 7 ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Autonomia Real de Ração</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${feedAutonomyDays < 7 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {feedAutonomyDays < 7 ? 'Reposição' : 'Seguro'}
              </span>
            </div>
            <div className={`text-2xl font-bold ${feedAutonomyDays < 3 ? 'text-rose-400' : feedAutonomyDays < 7 ? 'text-amber-400' : 'text-blue-300'}`}>
              {feedAutonomyDays} <span className="text-xs font-normal text-slate-400">dias ({dailyFeedNeededKg} kg/dia)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${alertItemsCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Itens em Alerta de Reposição</div>
            <div className={`text-2xl font-bold ${alertItemsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {alertItemsCount} <span className="text-xs font-normal text-slate-400">abaixo do mín.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de IA Recomendação de Reposição */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900/60 border border-amber-800/40 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-amber-200">
              Planejamento de Compras & Nutrição Inteligente
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O consumo projetado para os próximos 14 dias indica necessidade de encomendar mais <strong>2.000 kg de ração 35% proteína</strong> e <strong>600 kg de Cloreto de Potássio (KCl)</strong>. 
              Como a fábrica de ração leva em média 5 dias úteis para entrega no polo da Paraíba/Rio Grande do Norte, o pedido deve ser emitido até amanhã para evitar ruptura no fornecimento.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ração, marca, probiótico ou corretivo químico..."
          className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Tabela de Insumos em Estoque */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-amber-400" />
            Inventário de Insumos Disponíveis
          </h3>
          <span className="text-xs text-slate-400">{filteredItems.length} insumos listados</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando armazém...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Nenhum insumo encontrado no armazém.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Insumo & Marca</th>
                  <th className="py-3 px-4 font-medium">Categoria / Tipo</th>
                  <th className="py-3 px-4 font-medium">Proteína (%)</th>
                  <th className="py-3 px-4 font-medium">Estoque Atual</th>
                  <th className="py-3 px-4 font-medium">Mín. Alerta</th>
                  <th className="py-3 px-4 font-medium">Custo / kg</th>
                  <th className="py-3 px-4 font-medium">Localização</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {filteredItems.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div>{it.name}</div>
                      <div className="text-[11px] text-amber-400/90 font-mono">{it.brand}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {it.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {it.proteinPercent > 0 ? `${it.proteinPercent}% PB` : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {it.currentStockKg.toLocaleString('pt-BR')} {it.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {it.minStockAlertKg.toLocaleString('pt-BR')} {it.unit}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      R$ {it.costPerKg.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {it.location}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        it.status === 'NORMAL'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : it.status === 'ABAIXO_MINIMO'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}>
                        {it.status === 'NORMAL' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {it.status === 'ABAIXO_MINIMO' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                        {it.status === 'ESGOTADO' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                        {it.status === 'NORMAL' ? 'Estoque Seguro' : it.status === 'ABAIXO_MINIMO' ? 'Abaixo do Mín.' : 'Esgotado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro de Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Novo Insumo no Almoxarifado
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fabricante / Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Proteína Bruta (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={proteinPercent}
                    onChange={(e) => setProteinPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Estoque Inicial (kg)</label>
                  <input
                    type="number"
                    value={currentStockKg}
                    onChange={(e) => setCurrentStockKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ponto Reposição (kg)</label>
                  <input
                    type="number"
                    value={minStockAlertKg}
                    onChange={(e) => setMinStockAlertKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Custo Médio (R$/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={costPerKg}
                    onChange={(e) => setCostPerKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Localização no Galpão</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações do Armazenamento</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Lote de fabricação, validade, instruções de umidade..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-950/40"
                >
                  Salvar no Armazém
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
