import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  Percent,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface BankAccount {
  id: string;
  tenantId: string;
  bankName: string;
  accountType: string;
  agency: string;
  accountNumber: string;
  holderName: string;
  currentBalanceRs: number;
  pixKey: string;
  isActive: boolean;
}

interface CashFlowMovement {
  id: string;
  tenantId: string;
  movementType: 'ENTRADA' | 'SAIDA';
  category: string;
  description: string;
  amountRs: number;
  status: 'REALIZADO' | 'PREVISTO';
  documentRef?: string;
  createdAt: string;
}

interface AgroCreditData {
  selicRateTargetPct: number;
  pronafAquacultureRatePct: number;
  pronampRatePct: number;
  moderagroRatePct: number;
  lastUpdated: string;
}

export const CashFlowView: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [movements, setMovements] = useState<CashFlowMovement[]>([]);
  const [agroCredit, setAgroCredit] = useState<AgroCreditData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');
  const [category, setCategory] = useState<string>('Rações & Nutrição');
  const [description, setDescription] = useState<string>('Aquisição de 40 sacos de ração Guabi 35%');
  const [amountRs, setAmountRs] = useState<number>(6800.0);
  const [status, setStatus] = useState<'REALIZADO' | 'PREVISTO'>('REALIZADO');
  const [documentRef, setDocumentRef] = useState<string>('NF-e 8819');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, movRes, creditRes] = await Promise.all([
        fetch('/api/db/bank-accounts?tenantId=tenant-river-life'),
        fetch('/api/db/cash-flow?tenantId=tenant-river-life'),
        fetch('/api/agro-credit/benchmark')
      ]);

      if (accRes.ok) {
        const d = await accRes.json();
        setAccounts(d.accounts || []);
      }
      if (movRes.ok) {
        const d = await movRes.json();
        setMovements(d.movements || []);
      }
      if (creditRes.ok) {
        const d = await creditRes.json();
        setAgroCredit(d);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados financeiros:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBankBalance = accounts.reduce((acc, a) => acc + a.currentBalanceRs, 0);
  const totalEntriesRealized = movements
    .filter((m) => m.movementType === 'ENTRADA' && m.status === 'REALIZADO')
    .reduce((acc, m) => acc + m.amountRs, 0);
  const totalExitsRealized = movements
    .filter((m) => m.movementType === 'SAIDA' && m.status === 'REALIZADO')
    .reduce((acc, m) => acc + m.amountRs, 0);
  const netOperatingCash = totalEntriesRealized - totalExitsRealized;

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tenantId: 'tenant-river-life',
        movementType,
        category,
        description,
        amountRs: Number(amountRs),
        status,
        documentRef: documentRef || undefined,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/db/cash-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Erro ao salvar movimentação:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Fluxo de Caixa Diário (DFC) & Contas Bancárias
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Conciliação Financeira
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Gestão integrada de saldos bancários, chaves PIX de recebimento, despesas operacionais da fazenda e liquidação diária.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium shadow-lg shadow-teal-950/40 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento DFC
        </button>
      </div>

      {/* Cards de Métricas de Caixa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Saldo Disponível em Bancos</div>
            <div className="text-2xl font-bold text-teal-300">
              R$ {totalBankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Receitas Liquidadas (Mês)</div>
            <div className="text-2xl font-bold text-emerald-400">
              R$ {totalEntriesRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Despesas Liquidadas (Mês)</div>
            <div className="text-2xl font-bold text-rose-400">
              R$ {totalExitsRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Resultado Operacional Líquido</div>
            <div className={`text-2xl font-bold ${netOperatingCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {netOperatingCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Contas Bancárias & Chaves PIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{acc.bankName}</h4>
                  <p className="text-xs text-slate-400">{acc.holderName}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Conta Ativa
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block">Agência / Conta:</span>
                <span className="text-slate-200 font-mono font-medium">Ag {acc.agency} | CC {acc.accountNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Chave PIX:</span>
                <span className="text-teal-300 font-mono text-[11px] truncate block">{acc.pixKey}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs text-slate-400">Saldo Atual Conciliado:</span>
              <span className="text-lg font-bold text-emerald-400">
                R$ {acc.currentBalanceRs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark de Crédito Rural - Banco Central do Brasil (Gratuito) */}
      {agroCredit && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900/60 border border-cyan-800/40 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
              <Percent className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cyan-200 flex items-center gap-2">
                  Linhas Oficiais de Financiamento Aquícola (Banco Central / Plano Safra 2026)
                </span>
                <span className="text-[11px] text-slate-400">Selic Meta: {agroCredit.selicRateTargetPct}% a.a.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">PRONAF Aquícola (Custeio)</div>
                  <div className="text-base font-bold text-emerald-400">{agroCredit.pronafAquacultureRatePct}% a.a.</div>
                  <div className="text-[10px] text-slate-500">Pequeno produtor / Ração e pós-larvas</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">PRONAMP Médio Produtor</div>
                  <div className="text-base font-bold text-cyan-400">{agroCredit.pronampRatePct}% a.a.</div>
                  <div className="text-[10px] text-slate-500">Média propriedade / Até R$ 1.5 mi</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">MODERAGRO (Investimento)</div>
                  <div className="text-base font-bold text-amber-300">{agroCredit.moderagroRatePct}% a.a.</div>
                  <div className="text-[10px] text-slate-500">Aeradores, berçários e placas solares</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Extrato de Movimentações */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-teal-400" />
            Extrato de Movimentações Financeiras
          </h3>
          <span className="text-xs text-slate-400">{movements.length} lançamentos</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando movimentações...</div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Nenhuma movimentação registrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Tipo</th>
                  <th className="py-3 px-4 font-medium">Categoria</th>
                  <th className="py-3 px-4 font-medium">Descrição</th>
                  <th className="py-3 px-4 font-medium">Documento / Ref</th>
                  <th className="py-3 px-4 font-medium">Data</th>
                  <th className="py-3 px-4 font-medium">Valor (R$)</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        m.movementType === 'ENTRADA'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {m.movementType === 'ENTRADA' ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" /> Receita
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" /> Despesa
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {m.category}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {m.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {m.documentRef || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={m.movementType === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.movementType === 'ENTRADA' ? '+' : '-'} R$ {m.amountRs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        m.status === 'REALIZADO'
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        {m.status === 'REALIZADO' ? <CheckCircle2 className="w-3 h-3 text-teal-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Novo Lançamento DFC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-400" />
                Novo Lançamento Financeiro (DFC)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Fluxo</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="SAIDA">Saída (Despesa / Pagamento)</option>
                    <option value="ENTRADA">Entrada (Receita / Venda)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoria de Custo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Rações & Nutrição">Rações & Nutrição</option>
                    <option value="Energia Elétrica (Aeradores)">Energia Elétrica (Aeradores)</option>
                    <option value="Pós-Larvas & Povoamento">Pós-Larvas & Povoamento</option>
                    <option value="Químicos & Calagem">Químicos & Calagem</option>
                    <option value="Venda de Camarão In Natura">Venda de Camarão In Natura</option>
                    <option value="Mão de Obra & Diárias">Mão de Obra & Diárias</option>
                    <option value="Combustível & Manutenção">Combustível & Manutenção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição Detalhada</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountRs}
                    onChange={(e) => setAmountRs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status da Liquidação</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="REALIZADO">Liquidado / Pago na Conta</option>
                    <option value="PREVISTO">A Pagar / Previsto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Documento Fiscal / Comprovante</label>
                <input
                  type="text"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  placeholder="Ex: NF-e 8819 ou Comprovante PIX..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
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
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-lg shadow-teal-950/40"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
