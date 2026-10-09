import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [AQUA-CORE AI ErrorBoundary] Uncaught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      // Limpa chaves cacheadas que possam conter dados corrompidos
      localStorage.removeItem('aquacore_saved_farm');
      localStorage.removeItem('aquacore_saved_tanks');
      localStorage.removeItem('aquacore_saved_batches');
      localStorage.removeItem('aquacore_saved_tenant');
      localStorage.removeItem('aquacore_saved_user');
      localStorage.setItem('aquacore_schema_version', 'v6_shrimp_recovery_riverlife_mogeiro');
    } catch (e) {
      console.warn('Erro ao limpar cache:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
          <div className="max-w-lg w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/80 inline-block">
                AQUA-CORE AI • Sentinel Recovery
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {this.props.fallbackTitle || 'Recuperação Automática do Sistema'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                O sistema detectou uma inconsistência de renderização e acionou a proteção de contingência. Os dados da sua fazenda continuam íntegros no banco de dados e nos sensores IoT.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-left font-mono text-[11px] text-red-400 overflow-x-auto max-h-24">
                <span className="text-slate-500 block mb-1 font-bold">Diagnóstico técnico:</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar & Recarregar Painel</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              Fazenda River Life • Mogeiro – PB • Suporte Ativo
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
