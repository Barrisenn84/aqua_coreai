import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Droplets,
  HardHat,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  Zap,
  Crown,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentTenant,
    availableTenants,
    switchTenant,
    login,
  } = useAquaCore();

  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'switch_tenant' | 'login'>('switch_tenant');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (userEmail: string, tenantId: string) => {
    setIsLoading(true);
    try {
      await login(userEmail, 'admin123');
      switchTenant(tenantId);
      setFeedback('Sessão autenticada e organização alternada com sucesso!');
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsLoading(true);
    try {
      await login(emailInput, passwordInput || 'default');
      setFeedback('Login realizado com sucesso!');
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl font-mono text-xs">
        {/* Header com identidade da plataforma */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-sm tracking-wide">
                  Acesso & Multi-Tenant Central
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Isolamento estrito de dados por Fazenda ou Canteiro de Obras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{feedback}</span>
          </div>
        )}

        {/* Abas Superiores */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('switch_tenant')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'switch_tenant'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Alternar Organização / Fazenda</span>
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Login de Usuário</span>
          </button>
        </div>

        {/* Conteúdo da Aba: Alternar Organização */}
        {activeTab === 'switch_tenant' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-slate-400">
              <span>Organizações e Canteiros Cadastrados ({availableTenants.length})</span>
              <span className="text-[10px] text-cyan-400">Clique para alternar imediatamente</span>
            </div>

            <div className="space-y-2.5">
              {availableTenants.map((t) => {
                const isActive = t.id === currentTenant.id;
                const isConstruction = t.type === 'construction_site';

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setFeedback(`Organização ativa alterada para: ${t.name}`);
                      setTimeout(() => {
                        setFeedback(null);
                        onClose();
                      }, 900);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isConstruction
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                            : 'bg-cyan-950/80 text-cyan-400 border-cyan-800'
                        }`}
                      >
                        {isConstruction ? (
                          <HardHat className="w-4 h-4" />
                        ) : (
                          <Droplets className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{t.name}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500 text-slate-950 uppercase">
                              ATIVO
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                          <span>{t.location}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-semibold">{t.speciesTarget}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">KWh / Venda</span>
                      <span className="text-xs font-bold text-cyan-300">
                        R$ {t.kwhCost.toFixed(2)}/kWh
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 👑 Acesso Master Proprietário Irrestrito */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-amber-400 block mb-2 font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Conta Master do Proprietário (Acesso Completo Irrestrito):</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('nuncaparedelutar1988@gmail.com', 'tenant-river-life')
                }
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/60 hover:border-amber-400 hover:from-amber-900/90 text-left transition-all cursor-pointer shadow-lg shadow-amber-950/40 flex items-center justify-between gap-3 mb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">Proprietário Geral • Master</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase">
                        SUPERADMIN
                      </span>
                    </div>
                    <span className="text-amber-300/80 text-[11px] font-mono">
                      nuncaparedelutar1988@gmail.com
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase font-mono">
                  Acessar Tudo
                </span>
              </button>
            </div>

            {/* Acessos Rápidos de Demonstração */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-2 font-bold">
                Perfis Rápidos para Teste de Venda & Demonstração:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin('collermhann@aquacore.ai', 'tenant-river-life')
                  }
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition-colors cursor-pointer"
                >
                  <span className="text-white font-bold block truncate">Eng. Collermhann</span>
                  <span className="text-[10px] text-cyan-400">Fazenda PB</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin('helena@aquacore.ai', 'tenant-santa-helena')
                  }
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition-colors cursor-pointer"
                >
                  <span className="text-white font-bold block truncate">Dra. Helena</span>
                  <span className="text-[10px] text-cyan-400">Tilápia BA</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin('mestre.silva@constr.ai', 'tenant-constr-ai-01')
                  }
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-colors cursor-pointer"
                >
                  <span className="text-white font-bold block truncate">Mestre Silva</span>
                  <span className="text-[10px] text-amber-400">Constr.AI (Obra)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba: Formulário de Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleFormLogin} className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-slate-400 block">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="exemplo@aquacore.ai"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setEmailInput('nuncaparedelutar1988@gmail.com')}
                className="mt-1.5 text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Usar conta Master: nuncaparedelutar1988@gmail.com</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Usuário atualmente conectado:</span>
              <span className="font-bold text-white">{currentUser.name}</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-500 text-[11px]">
          <span>Sessão com Criptografia JWT & Isolamento Multi-Tenant</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
