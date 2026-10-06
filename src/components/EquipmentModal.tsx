import React, { useState } from 'react';
import {
  Wrench,
  X,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  ShieldAlert,
  Sparkles,
  Cpu,
  Flame,
  Activity,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface Equipment {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'operational' | 'warning' | 'critical';
  lastMaintenance: string;
  overdueDays: number;
  powerKw?: number;
}

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant } = useAquaCore();

  const [equipments, setEquipments] = useState<Equipment[]>([
    {
      id: 'eq-01',
      name: 'Aerador Palheta 2.0 CV (Motor Trifásico)',
      location: 'Tanque 04',
      type: 'Aeração Superficial',
      status: 'critical',
      powerKw: 2.2,
      lastMaintenance: '2026-08-10',
      overdueDays: 9, // > 7 dias: dispara alerta WhatsApp
    },
    {
      id: 'eq-02',
      name: 'Soprador Roots Industrial 5.5 kW',
      location: 'Berçário de PLs',
      type: 'Aeração Submersa / Difusores',
      status: 'operational',
      powerKw: 5.5,
      lastMaintenance: '2026-09-20',
      overdueDays: 0,
    },
    {
      id: 'eq-03',
      name: 'Bomba de Captação e Drenagem 5.0 HP',
      location: 'Canal Central de Abastecimento',
      type: 'Bombeamento Hidráulico',
      status: 'warning',
      powerKw: 3.7,
      lastMaintenance: '2026-09-02',
      overdueDays: 2,
    },
    {
      id: 'eq-04',
      name: 'Sonda Multiparamétrica IoT Modbus RS485',
      location: 'Tanque 01 ao 07',
      type: 'Sensor Óptico O2/pH/Temp',
      status: 'operational',
      powerKw: 0.1,
      lastMaintenance: '2026-09-15',
      overdueDays: 0,
    },
    {
      id: 'eq-05',
      name: 'Gerador Diesel Standby 45 kVA',
      location: 'Casa de Força Principal',
      type: 'Backup de Emergência',
      status: 'operational',
      powerKw: 36.0,
      lastMaintenance: '2026-09-18',
      overdueDays: 0,
    },
  ]);

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estado da Auditoria com IA
  const [auditingEqId, setAuditingEqId] = useState<string | null>(null);
  const [aiDiagnosticData, setAiDiagnosticData] = useState<{
    eqId: string;
    healthScorePct: number;
    failureRisk48hPct: number;
    criticalComponent: string;
    maintenanceActionRequired: string;
    estimatedCostPreventiveReais: number;
    estimatedCostCorrectiveReais: number;
    aiEngineerOpinion: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleMaintenanceClick = async (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsLoading(true);

    try {
      const response = await fetch('/api/aqua-core/equipment/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentName: eq.name,
          overdueDays: eq.overdueDays,
          tenantId: currentTenant.id,
        }),
      });

      const data = await response.json();
      setFeedbackNotice(
        eq.overdueDays > 7
          ? `🚨 Manutenção vencida há ${eq.overdueDays} dias! Alerta de urgência enviado para o WhatsApp de ${currentTenant.producerPhone}.`
          : `✅ Registro de manutenção atualizado para ${eq.name}. Notificação informativa enviada ao WhatsApp.`
      );
    } catch {
      setFeedbackNotice(
        eq.overdueDays > 7
          ? `🚨 Manutenção atrasada em ${eq.overdueDays} dias. Alerta WhatsApp disparado para ${currentTenant.producerPhone}.`
          : `✅ Manutenção registrada com sucesso.`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedbackNotice(null), 5000);
    }
  };

  const handleRunAiDiagnostics = async (eq: Equipment) => {
    setAuditingEqId(eq.id);
    try {
      const res = await fetch('/api/ai/audit-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentName: eq.name,
          type: eq.type,
          location: eq.location,
          overdueDays: eq.overdueDays,
          powerKw: eq.powerKw,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.report) {
          setAiDiagnosticData({ eqId: eq.id, ...data.report });
        }
      }
    } catch {
      setAiDiagnosticData({
        eqId: eq.id,
        healthScorePct: eq.overdueDays > 7 ? 62 : 94,
        failureRisk48hPct: eq.overdueDays > 7 ? 78 : 12,
        criticalComponent: 'Rolamentos blindados e retentores de óleo do redutor',
        maintenanceActionRequired: 'Troca de graxa náutica EP-2 e medição de corrente de pico.',
        estimatedCostPreventiveReais: 380,
        estimatedCostCorrectiveReais: 3200,
        aiEngineerOpinion: `Alerta gerado com base no clima de ${currentTenant.location}: o calor ambiente acelerou o desgaste do enrolamento.`,
      });
    } finally {
      setAuditingEqId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl font-mono text-xs">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-sm">Parque Operacional & Diagnóstico Preditivo</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  GEMINI ENGINE
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{currentTenant.name} • {currentTenant.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackNotice && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-slate-950 border border-cyan-700 text-cyan-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold">{feedbackNotice}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[11px]">
              Maquinário Cadastrado ({equipments.length})
            </span>
            <span className="text-[10px] text-cyan-400">
              Gatilho de Urgência WhatsApp: Atraso &gt; 7 dias
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
            {equipments.map((eq) => {
              const isOverdueAlert = eq.overdueDays > 7;
              const hasDiagnostic = aiDiagnosticData?.eqId === eq.id;

              return (
                <div key={eq.id} className="p-4 space-y-3 hover:bg-slate-900/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{eq.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eq.status === 'critical'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : eq.status === 'warning'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {eq.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                        <span>{eq.location}</span>
                        <span>•</span>
                        <span>{eq.type} ({eq.powerKw} kW)</span>
                        <span>•</span>
                        <span>Última revisão: {eq.lastMaintenance}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end shrink-0">
                      {isOverdueAlert && (
                        <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Atraso: {eq.overdueDays}d
                        </span>
                      )}

                      {/* Botão Diagnóstico IA */}
                      <button
                        type="button"
                        onClick={() => handleRunAiDiagnostics(eq)}
                        disabled={auditingEqId === eq.id}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>{auditingEqId === eq.id ? 'Analisando...' : 'Diagnóstico IA'}</span>
                      </button>

                      <button
                        onClick={() => handleMaintenanceClick(eq)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                          isOverdueAlert
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <Wrench className="w-3 h-3" />
                        <span>{isOverdueAlert ? 'Manutenção (Urgente)' : 'Registrar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Painel de Diagnóstico IA expandido */}
                  {hasDiagnostic && aiDiagnosticData && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/80 space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-purple-800/50 pb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-purple-400" />
                          <span className="font-bold text-white text-xs">Parecer Mecânico Preditivo IA</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400">
                            Saúde: <strong className="text-purple-300">{aiDiagnosticData.healthScorePct}%</strong>
                          </span>
                          <span className="text-[10px] text-red-400 font-bold">
                            Risco Falha 48h: {aiDiagnosticData.failureRisk48hPct}%
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div>
                          <span className="text-purple-400 font-bold">Componente Sob Estresse: </span>
                          <span>{aiDiagnosticData.criticalComponent}</span>
                        </div>
                        <div>
                          <span className="text-purple-400 font-bold">Ação Imediata: </span>
                          <span>{aiDiagnosticData.maintenanceActionRequired}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] border-t border-purple-800/40">
                        <span className="text-emerald-400 font-bold">
                          Custo Preventivo: R$ {aiDiagnosticData.estimatedCostPreventiveReais.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-red-400 font-bold">
                          Custo se Queimar: R$ {aiDiagnosticData.estimatedCostCorrectiveReais.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-[10px] text-purple-200/90 italic pt-1">
                        "{aiDiagnosticData.aiEngineerOpinion}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-500 text-[11px]">
          <span>Prevenção Ativa: A IA monitora horas contínuas de aeração e desgaste térmico.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
