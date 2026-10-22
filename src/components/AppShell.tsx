import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, Bot, Boxes, BrainCircuit, Building2, ChevronDown, CircleDollarSign,
  Droplets, FileBarChart, Fish, HelpCircle, Home, Menu, MessageCircle, Moon,
  Package, PanelLeftClose, PanelLeftOpen, ScanLine, Settings, Sparkles, TrendingUp,
  Utensils, WalletCards, Waves, Wrench, X,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface NavItem { id: string; label: string; icon: React.ComponentType<{ className?: string }>; }
interface AppShellProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenHelp: () => void;
  onOpenAuth: () => void;
  onOpenBiometry: () => void;
  onOpenScanner: () => void;
  onOpenEquipment: () => void;
  onOpenInvoice: () => void;
  onOpenVoice: () => void;
  onOpenVision: () => void;
  onOpenFarm: () => void;
  onOpenReset: () => void;
  children: React.ReactNode;
}

const groups: Array<{ label: string; items: NavItem[] }> = [
  { label: 'Hoje', items: [
    { id: 'nerve-center', label: 'Centro de controle', icon: Home },
    { id: 'operations-hub', label: 'Operação & lotes', icon: Boxes },
  ]},
  { label: 'Produção', items: [
    { id: 'feeding-trays', label: 'Alimentação', icon: Utensils },
    { id: 'water-quality', label: 'Qualidade da água', icon: Droplets },
    { id: 'biometry', label: 'Biometria', icon: Fish },
    { id: 'mortality-molt', label: 'Sanidade & mortalidade', icon: Moon },
    { id: 'inventory-warehouse', label: 'Estoque', icon: Package },
    { id: 'harvest-commercial', label: 'Despesca', icon: Waves },
  ]},
  { label: 'Gestão', items: [
    { id: 'cash-flow', label: 'Fluxo de caixa', icon: WalletCards },
    { id: 'dre', label: 'DRE & resultado', icon: CircleDollarSign },
    { id: 'market-bridge', label: 'Mercado & compradores', icon: TrendingUp },
    { id: 'whatsapp-ghost', label: 'WhatsApp', icon: MessageCircle },
  ]},
  { label: 'Inteligência', items: [
    { id: 'biomass-predictor', label: 'Predição de biomassa', icon: BrainCircuit },
    { id: 'feed-optimizer', label: 'Otimização de ração', icon: Sparkles },
    { id: 'harvest-oracle', label: 'Previsão de despesca', icon: TrendingUp },
    { id: 'terminal', label: 'Decisão assistida', icon: Bot },
  ]},
  { label: 'Sistema', items: [
    { id: 'blackbox-haas', label: 'Sensores & IoT', icon: Activity },
    { id: 'flutter-mobile', label: 'App de campo', icon: ScanLine },
    { id: 'architecture', label: 'Arquitetura da nuvem', icon: Settings },
  ]},
];

export const AppShell: React.FC<AppShellProps> = ({ activeTab, onNavigate, onOpenHelp, onOpenAuth, onOpenBiometry, onOpenScanner, onOpenEquipment, onOpenInvoice, onOpenVoice, onOpenVision, onOpenFarm, onOpenReset, children }) => {
  const { farm, alerts, isSimulating, currentTenant, currentUser } = useAquaCore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const currentLabel = useMemo(() => groups.flatMap((group) => group.items).find((item) => item.id === activeTab)?.label || 'AQUA-CORE', [activeTab]);
  const activeAlerts = alerts.filter((alert) => !alert.resolved).length;

  useEffect(() => { setMobileOpen(false); setActionsOpen(false); }, [activeTab]);

  const nav = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-600 text-slate-950 shadow-lg shadow-cyan-950"><Droplets className="h-5 w-5" /></div>
        {!collapsed && <div className="min-w-0"><strong className="block truncate text-sm tracking-wide text-white">AQUA-CORE AI</strong><span className="block truncate text-xs text-cyan-300">{farm.name}</span></div>}
      </div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navegação principal">
        {groups.map((group) => <div key={group.label} className="mb-5">{!collapsed && <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{group.label}</p>}<div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = activeTab === item.id; return <button key={item.id} type="button" onClick={() => onNavigate(item.id)} title={collapsed ? item.label : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}><Icon className="h-4.5 w-4.5 shrink-0" />{!collapsed && <span>{item.label}</span>}</button>; })}</div></div>)}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <button type="button" onClick={onOpenHelp} className={`flex min-h-11 w-full items-center gap-3 rounded-xl bg-emerald-400 px-3 text-sm font-black text-slate-950 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${collapsed ? 'justify-center' : ''}`}><HelpCircle className="h-5 w-5" />{!collapsed && 'Como usar a AQUA'}</button>
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="mt-2 hidden min-h-11 w-full items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white lg:flex" aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-50 hidden border-r border-slate-800 bg-[#0a1525] transition-[width] lg:flex lg:flex-col ${collapsed ? 'w-20' : 'w-64'}`}>{nav}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/80" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-slate-800 bg-[#0a1525]">{nav}<button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800" aria-label="Fechar menu"><X className="h-5 w-5" /></button></aside></div>}

      <div className={`transition-[padding] ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#07111f]/95 backdrop-blur-xl">
          <div className="flex min-h-16 items-center gap-3 px-3 sm:px-5">
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 lg:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-cyan-300">{currentTenant.location}</p><h1 className="truncate text-base font-black text-white sm:text-lg">{currentLabel}</h1></div>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs sm:flex"><span className={`h-2 w-2 rounded-full ${isSimulating ? 'bg-emerald-400' : 'bg-slate-500'}`} /><span className="text-slate-400">Telemetria</span><strong className="text-slate-200">{isSimulating ? 'ativa' : 'pausada'}</strong></div>
            {activeAlerts > 0 && <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-black text-white" aria-label={`${activeAlerts} alertas ativos`}>{activeAlerts}</span>}
            <div className="relative">
              <button type="button" onClick={() => setActionsOpen((value) => !value)} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-bold text-white hover:bg-slate-800" aria-expanded={actionsOpen}><span className="hidden sm:inline">Ações</span><ChevronDown className="h-4 w-4" /></button>
              {actionsOpen && <div className="absolute right-0 top-14 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">{[
                ['Nova biometria', Fish, onOpenBiometry], ['Ler rótulo de ração', ScanLine, onOpenScanner], ['Assistente por voz', Bot, onOpenVoice], ['Analisar uma foto', Sparkles, onOpenVision], ['Emitir nota fiscal', FileBarChart, onOpenInvoice], ['Equipamentos', Wrench, onOpenEquipment], ['Minha fazenda', Building2, onOpenFarm], ['Organização e usuário', Building2, onOpenAuth], ['Configurações de dados', Settings, onOpenReset],
              ].map(([label, Icon, action]) => { const ItemIcon = Icon as React.ComponentType<{ className?: string }>; return <button key={label as string} type="button" onClick={action as () => void} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"><ItemIcon className="h-4 w-4 text-cyan-300" />{label as string}</button>; })}</div>}
            </div>
            <button type="button" onClick={onOpenAuth} className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-slate-800 px-3 text-xs font-black text-cyan-200 hover:bg-slate-700" title={`${currentUser.name} · ${currentUser.role}`}>{currentUser.name === 'Visitante' ? 'VI' : currentUser.name.slice(0, 2).toUpperCase()}</button>
          </div>
          {activeAlerts > 0 && <div className="flex items-center gap-2 border-t border-rose-900/50 bg-rose-950/30 px-4 py-2 text-xs text-rose-100"><Activity className="h-4 w-4 text-rose-300" /><strong>{activeAlerts} alerta(s) operacional(is).</strong><span className="hidden text-rose-200/70 sm:inline">Abra o Centro de Controle antes de executar o manejo.</span></div>}
        </header>
        <main id="conteudo-principal" className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5 sm:py-6">{children}</main>
        <footer className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">AQUA-CORE AI · Decisões explicáveis, dados com origem e validação humana</footer>
      </div>
    </div>
  );
};
