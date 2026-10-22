import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, ChevronRight, HelpCircle, Search, Sparkles, X } from 'lucide-react';

interface GuideItem {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  destination?: string;
}

interface InteractiveManualProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const guides: GuideItem[] = [
  { id: 'start', title: 'Comece por aqui', summary: 'Entenda a fazenda em menos de dois minutos.', destination: 'nerve-center', steps: ['Abra o Centro de Controle.', 'Veja primeiro os alertas vermelhos ou amarelos.', 'Confira biomassa, população e custo.', 'Escolha um tanque para ver os detalhes.'] },
  { id: 'lots', title: 'Cuidar de lotes e tanques', summary: 'Acompanhe quem mora em cada tanque.', destination: 'operations-hub', steps: ['Abra Operação & Lotes.', 'Use Visão geral para enxergar o todo.', 'Abra Lotes para comparar população, biomassa e custo.', 'Abra Qualidade dos dados antes de decidir algo importante.'] },
  { id: 'feed', title: 'Registrar alimentação', summary: 'Anote a ração e veja se houve sobra.', destination: 'feeding-trays', steps: ['Escolha o tanque correto.', 'Informe a quantidade realmente fornecida.', 'Registre a sobra da bandeja.', 'Leia a sugestão; confirme no campo antes de aplicar.'] },
  { id: 'water', title: 'Conferir a água', summary: 'Veja se o camarão está respirando bem.', destination: 'water-quality', steps: ['Selecione o tanque.', 'Confira oxigênio, pH e temperatura.', 'Valores antigos aparecem como desatualizados.', 'Em alerta crítico, valide a sonda e siga o protocolo da fazenda.'] },
  { id: 'stock', title: 'Controlar o estoque', summary: 'Saiba o que existe no galpão e o que vai acabar.', destination: 'inventory-warehouse', steps: ['Pesquise o produto.', 'Compare quantidade atual e mínimo.', 'Use o scanner para ler um rótulo.', 'Revise os dados antes de salvar uma entrada.'] },
  { id: 'money', title: 'Entender o dinheiro', summary: 'Veja entradas, saídas e resultado.', destination: 'cash-flow', steps: ['Abra Fluxo de Caixa.', 'Filtre o período desejado.', 'Separe valores realizados dos previstos.', 'Use a DRE para entender o resultado do cultivo.'] },
  { id: 'harvest', title: 'Planejar a despesca', summary: 'Compare peso, preço e data antes de vender.', destination: 'harvest-oracle', steps: ['Confira a biometria mais recente.', 'Veja a projeção como estimativa, não como certeza.', 'Compare custo adicional com preço esperado.', 'Registre a despesca real quando ela acontecer.'] },
  { id: 'ai', title: 'Usar a IA com segurança', summary: 'Entenda o que é dado e o que é sugestão.', destination: 'terminal', steps: ['Leia as evidências usadas pela IA.', 'Confira a data e a confiança.', 'Veja a ação recomendada e o impacto esperado.', 'Nunca aplique uma recomendação crítica sem validação humana.'] },
];

export const InteractiveManual: React.FC<InteractiveManualProps> = ({ open, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('start');
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('aquacore_manual_progress') || '[]'); } catch { return []; }
  });
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => { localStorage.setItem('aquacore_manual_progress', JSON.stringify(completed)); }, [completed]);

  const filtered = useMemo(() => guides.filter((guide) => `${guide.title} ${guide.summary} ${guide.steps.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const active = guides.find((guide) => guide.id === activeId) || guides[0];
  const progress = Math.round((completed.length / guides.length) * 100);

  if (!open) return null;

  const toggleComplete = () => setCompleted((current) => current.includes(active.id) ? current.filter((id) => id !== active.id) : [...current, active.id]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="manual-title">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-cyan-800/50 bg-slate-900 shadow-2xl shadow-black/60 sm:rounded-3xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"><BookOpen className="h-5 w-5" /></div><div><h2 id="manual-title" className="font-black text-white">Manual interativo da AQUA</h2><p className="text-sm text-slate-400">Passos curtos, palavras simples e progresso salvo.</p></div></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Fechar manual"><X className="h-5 w-5" /></button>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[330px_1fr]">
          <aside className="border-b border-slate-800 bg-slate-950/40 p-4 md:overflow-y-auto md:border-b-0 md:border-r">
            <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300"><span>Seu progresso</span><span>{progress}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
            <label className="relative block"><span className="sr-only">Pesquisar no manual</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você quer fazer?" className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" /></label>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:flex-col" aria-label="Assuntos do manual">
              {filtered.map((guide) => <button key={guide.id} type="button" onClick={() => setActiveId(guide.id)} className={`flex min-h-12 min-w-[220px] items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:min-w-0 ${active.id === guide.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="flex items-center gap-2">{completed.includes(guide.id) ? <Check className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}{guide.title}</span><ChevronRight className="h-4 w-4" /></button>)}
            </nav>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5 sm:p-7">
            <div className="flex items-start gap-3"><Sparkles className="mt-1 h-5 w-5 shrink-0 text-cyan-300" /><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Guia prático</p><h3 className="mt-1 text-2xl font-black text-white">{active.title}</h3><p className="mt-2 text-base leading-7 text-slate-300">{active.summary}</p></div></div>
            <ol className="mt-6 space-y-3">{active.steps.map((step, index) => <li key={step} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/55 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-black text-slate-950">{index + 1}</span><span className="pt-1 text-sm leading-6 text-slate-200">{step}</span></li>)}</ol>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {active.destination && <button type="button" onClick={() => { onNavigate(active.destination!); onClose(); }} className="min-h-12 flex-1 rounded-xl bg-cyan-400 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Abrir esta parte da AQUA</button>}
              <button type="button" onClick={toggleComplete} className={`min-h-12 flex-1 rounded-xl border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${completed.includes(active.id) ? 'border-emerald-600 bg-emerald-950/40 text-emerald-200' : 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'}`}>{completed.includes(active.id) ? '✓ Aprendi este assunto' : 'Marcar como aprendido'}</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
