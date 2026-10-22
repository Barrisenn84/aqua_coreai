import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileBarChart,
  Filter,
  Fish,
  Search,
  ShieldAlert,
  Users,
  Waves,
} from 'lucide-react';
import { meuPescadoSnapshot } from '../data/meuPescadoImport';

type Section = 'overview' | 'lots' | 'tanks' | 'reports' | 'partners' | 'quality';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [columns.map(escape).join(';'), ...rows.map((row) => columns.map((column) => escape(row[column])).join(';'))].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const sectionMeta: Array<{ id: Section; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Visão geral', icon: ClipboardCheck },
  { id: 'lots', label: 'Lotes', icon: Fish },
  { id: 'tanks', label: 'Tanques', icon: Waves },
  { id: 'reports', label: 'Relatórios', icon: FileBarChart },
  { id: 'partners', label: 'Parceiros', icon: Users },
  { id: 'quality', label: 'Qualidade dos dados', icon: ShieldAlert },
];

export const OperationsHubView: React.FC = () => {
  const [section, setSection] = useState<Section>('overview');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  const snapshot = meuPescadoSnapshot;

  const filteredLots = useMemo(() => snapshot.lots.filter((lot) => {
    const text = `${lot.tankName} ${lot.batchCode} ${lot.supplier}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [query, snapshot.lots]);

  const filteredTanks = useMemo(() => snapshot.tanks.filter((tank) => {
    const matchesStatus = status === 'Todos' || tank.status === status;
    return matchesStatus && `${tank.name} ${tank.line} ${tank.status}`.toLowerCase().includes(query.toLowerCase());
  }), [query, status, snapshot.tanks]);

  const visiblePartners = useMemo(() => snapshot.partners.filter((partner) =>
    `${partner.name} ${partner.type}`.toLowerCase().includes(query.toLowerCase())), [query, snapshot.partners]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              <Building2 className="h-4 w-4" /> Operação River Life
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Lotes, tanques e gestão em um único fluxo</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Dados migrados do Meu Pescado com origem registrada. Conflitos não são escondidos: ficam marcados para revisão antes de orientar decisões.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadCsv('aqua-core-lotes.csv', snapshot.lots.map((lot) => ({ ...lot })))}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-700/60 bg-cyan-950/50 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Download className="h-4 w-4" /> Exportar lotes
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <FileBarChart className="h-4 w-4" /> Imprimir relatório
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Seções da operação">
          {sectionMeta.map((item) => {
            const Icon = item.icon;
            const selected = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSection(item.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${selected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {section !== 'overview' && section !== 'reports' && section !== 'quality' && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 p-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Pesquisar</span>
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por tanque, lote, nome ou tipo…" className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
          </label>
          {section === 'tanks' && (
            <label className="relative sm:w-52">
              <span className="sr-only">Filtrar por situação</span>
              <Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-400">
                <option>Todos</option><option>Ocupado</option><option>Livre</option>
              </select>
            </label>
          )}
        </div>
      )}

      {section === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Tanques povoados', `${snapshot.summary.populatedTanks} de ${snapshot.tanks.length}`, 'text-cyan-300'],
              ['Biomassa consolidada', `${number.format(snapshot.summary.totalBiomassKg)} kg`, 'text-emerald-300'],
              ['População atual', number.format(snapshot.summary.totalPopulation), 'text-blue-300'],
              ['Custo em cultivo', brl.format(snapshot.summary.cultivationCostRs), 'text-amber-300'],
            ].map(([label, value, color]) => (
              <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400">{label}</p>
                <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="text-lg font-black text-white">Situação dos lotes</h2><p className="text-sm text-slate-400">Resumo operacional por tanque</p></div>
                <button type="button" onClick={() => setSection('lots')} className="min-h-11 rounded-xl px-3 text-sm font-bold text-cyan-300 hover:bg-cyan-950/50">Ver detalhes</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {snapshot.lots.map((lot) => (
                  <article key={lot.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between"><strong className="text-white">{lot.tankName} · {lot.batchCode}</strong><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">{number.format(lot.currentPopulation)} un</span></div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><span className="block text-xs text-slate-500">Biomassa</span>{number.format(lot.currentBiomassKg)} kg</div><div><span className="block text-xs text-slate-500">Custo</span>{brl.format(lot.cultivationCostRs)}</div></div>
                  </article>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-5">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-black text-white">{snapshot.dataQualityIssues.length} pontos exigem revisão</h2><p className="mt-1 text-sm leading-6 text-amber-100/80">FCA, alimentação, biomassa, mortalidade e análise de água não estão consistentes na origem.</p></div></div>
              <button type="button" onClick={() => setSection('quality')} className="mt-4 min-h-11 w-full rounded-xl bg-amber-400 px-4 text-sm font-black text-slate-950 hover:bg-amber-300">Abrir auditoria dos dados</button>
            </section>
          </div>
        </div>
      )}

      {section === 'lots' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400"><tr>{['Tanque / lote','Fornecedor','Cultivo','Biomassa','População','Sobrev. restante','FCA','Custo'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{filteredLots.map((lot) => <tr key={lot.id} className="hover:bg-slate-800/40"><td className="px-4 py-4 font-bold text-white">{lot.tankName}<span className="block text-xs font-normal text-cyan-300">{lot.batchCode}</span></td><td className="px-4 py-4">{lot.supplier}</td><td className="px-4 py-4">{lot.cultivationDays} dias</td><td className="px-4 py-4">{number.format(lot.currentBiomassKg)} kg</td><td className="px-4 py-4">{number.format(lot.currentPopulation)}</td><td className="px-4 py-4">{lot.remainingSurvivalPct}%</td><td className="px-4 py-4">{lot.fcr || '—'}</td><td className="px-4 py-4 font-bold text-amber-200">{brl.format(lot.cultivationCostRs)}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {section === 'tanks' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredTanks.map((tank) => <article key={tank.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><Waves className="h-5 w-5" /></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tank.status === 'Ocupado' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{tank.status}</span></div><h2 className="mt-4 text-xl font-black text-white">{tank.name}</h2><p className="text-sm text-slate-400">{tank.type} · {tank.line}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">Volume</dt><dd>{tank.volumeM3} m³</dd></div><div><dt className="text-xs text-slate-500">Lote atual</dt><dd>{tank.batchCode || 'Sem lote'}</dd></div></dl></article>)}</div>
      )}

      {section === 'reports' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{snapshot.reportCatalog.map((report) => <article key={report} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-cyan-700/60"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><FileBarChart className="h-5 w-5" /></div><h2 className="mt-4 font-black text-white">{report}</h2><p className="mt-1 text-sm text-slate-400">Filtro por período, lote e tanque, pronto para impressão.</p><button type="button" onClick={() => window.print()} className="mt-4 min-h-11 rounded-xl px-3 text-sm font-bold text-cyan-300 hover:bg-cyan-950/50">Gerar relatório</button></article>)}</div>
      )}

      {section === 'partners' && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visiblePartners.map((partner) => <article key={`${partner.name}-${partner.type}`} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300"><Users className="h-5 w-5" /></div><div><h2 className="font-bold text-white">{partner.name}</h2><p className="mt-1 text-sm text-slate-400">{partner.type}</p></div></div></article>)}</div>
      )}

      {section === 'quality' && (
        <div className="space-y-3">{snapshot.dataQualityIssues.map((issue) => <article key={issue.id} className={`rounded-2xl border p-5 ${issue.severity === 'critical' ? 'border-rose-700/50 bg-rose-950/20' : issue.severity === 'high' ? 'border-amber-700/50 bg-amber-950/20' : 'border-blue-700/50 bg-blue-950/20'}`}><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black text-white">{issue.field}</h2><span className="rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-300">{issue.severity}</span></div><p className="mt-2 text-sm leading-6 text-slate-300">{issue.observed}</p><div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-950/60 p-3 text-sm text-emerald-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{issue.recommendation}</div></div></div></article>)}</div>
      )}
    </div>
  );
};
