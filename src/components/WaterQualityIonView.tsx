import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  ShieldAlert,
  Sparkles,
  Waves,
  Scale,
  Thermometer,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface WaterIonicLog {
  id: string;
  tankId: string;
  salinityPpt: number;
  dissolvedOxygenMgL: number;
  temperatureC: number;
  ph: number;
  totalAlkalinityMgL: number;
  totalHardnessMgL: number;
  calciumMgL: number;
  magnesiumMgL: number;
  toxicAmmoniaNh3MgL: number;
  nitriteNo2MgL: number;
  transparencySecchiCm: number;
  calcificationStatus: 'IDEAL' | 'EXIGE_CALAGEM' | 'DESEQUILIBRIO_IONICO';
  createdAt: string;
}

export const WaterQualityIonView: React.FC = () => {
  const [logs, setLogs] = useState<WaterIonicLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [tankId, setTankId] = useState<string>('tank-04');
  const [salinityPpt, setSalinityPpt] = useState<number>(16.5);
  const [dissolvedOxygenMgL, setDissolvedOxygenMgL] = useState<number>(5.6);
  const [temperatureC, setTemperatureC] = useState<number>(29.2);
  const [ph, setPh] = useState<number>(7.8);
  const [totalAlkalinityMgL, setTotalAlkalinityMgL] = useState<number>(145.0);
  const [totalHardnessMgL, setTotalHardnessMgL] = useState<number>(680.0);
  const [calciumMgL, setCalciumMgL] = useState<number>(135.0);
  const [magnesiumMgL, setMagnesiumMgL] = useState<number>(395.0);
  const [toxicAmmoniaNh3MgL, setToxicAmmoniaNh3MgL] = useState<number>(0.012);
  const [nitriteNo2MgL, setNitriteNo2MgL] = useState<number>(0.03);
  const [transparencySecchiCm, setTransparencySecchiCm] = useState<number>(34.0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/water-ionic?tenantId=tenant-river-life');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Erro ao buscar balanço iônico:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const mgCaRatio = magnesiumMgL / (calciumMgL || 1);
    let calcStatus: 'IDEAL' | 'EXIGE_CALAGEM' | 'DESEQUILIBRIO_IONICO' = 'IDEAL';

    if (totalAlkalinityMgL < 120) {
      calcStatus = 'EXIGE_CALAGEM';
    } else if (mgCaRatio < 2.5 || mgCaRatio > 3.8) {
      calcStatus = 'DESEQUILIBRIO_IONICO';
    }

    try {
      const res = await fetch('/api/db/water-ionic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-river-life',
          tankId,
          salinityPpt,
          dissolvedOxygenMgL,
          temperatureC,
          ph,
          totalAlkalinityMgL,
          totalHardnessMgL,
          calciumMgL,
          magnesiumMgL,
          toxicAmmoniaNh3MgL,
          nitriteNo2MgL,
          transparencySecchiCm,
          calcificationStatus: calcStatus,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentLog = logs[0] || {
    salinityPpt: 16.5,
    totalAlkalinityMgL: 145.0,
    totalHardnessMgL: 680.0,
    calciumMgL: 135.0,
    magnesiumMgL: 395.0,
    toxicAmmoniaNh3MgL: 0.012,
    nitriteNo2MgL: 0.03,
    transparencySecchiCm: 34.0,
    calcificationStatus: 'IDEAL',
  };

  const mgCaRatio = (currentLog.magnesiumMgL / (currentLog.calciumMgL || 1)).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Balanço Iônico & Qualidade Físico-Química da Água
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Padrão Litopenaeus vannamei
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Controle estequiométrico de Magnésio, Cálcio, Alcalinidade e Transparência de Secchi
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Leitura Físico-Química
        </button>
      </div>

      {/* Banner Didático e Fácil de Entender */}
      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 text-xs text-cyan-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">💡 Como funciona para qualquer um entender: </span>
          A água é a piscina onde o camarão mora! O Magnésio e o Cálcio são como vitaminas que deixam a casca dele bem durinha e brilhante quando ele cresce e troca de casca. O Oxigênio é o ar fresquinho para respirar, e o pH é o equilíbrio: a água não pode ser nem azeda e nem muito salgada!
        </div>
      </div>

      {/* Grid de Balanço Iônico */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Relação Mg:Ca */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" /> Relação Mg : Ca
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Ideal: ~3.1:1
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{mgCaRatio} : 1</div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Mg ({currentLog.magnesiumMgL}mg/L) / Ca ({currentLog.calciumMgL}mg/L). Essencial para endurecimento da carapaça pós-muda.
          </p>
        </div>

        {/* Alcalinidade Total */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-emerald-400" /> Alcalinidade Total
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Min: 120 mg/L
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {currentLog.totalAlkalinityMgL} <span className="text-xs font-normal text-slate-400">mg/L CaCO₃</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Tamponamento de pH estável. Impede oscilações mortais entre manhã e tarde.
          </p>
        </div>

        {/* Salinidade */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" /> Salinidade Atual
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Água Salobra
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {currentLog.salinityPpt} <span className="text-xs font-normal text-slate-400">ppt (g/L)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Estuário do Polo Paraíba. Osmorregulação favorável com menor gasto energético.
          </p>
        </div>

        {/* Disco de Secchi (Transparência) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" /> Transparência (Secchi)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              30-40 cm
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {currentLog.transparencySecchiCm} <span className="text-xs font-normal text-slate-400">cm</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Fitoplâncton balanceado (diatomáceas). Protege contra luminosidade excessiva.
          </p>
        </div>
      </div>

      {/* Parecer do Oráculo Químico IA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Prescrição Zootécnica & Manejo de Calagem IA</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {currentLog.totalAlkalinityMgL >= 130 ? (
            <>
              ✅ <strong>Condição Iônica Ótima:</strong> A relação Magnésio/Cálcio em {mgCaRatio}:1 e alcalinidade em {currentLog.totalAlkalinityMgL} mg/L garantem que a despesca ocorra sem problemas de "camarão mole". Não é necessária calagem imediata de carbonato de cálcio. Mantenha o monitoramento noturno do oxigênio.
            </>
          ) : (
            <>
              ⚠️ <strong>Alerta de Calagem Preventiva:</strong> A alcalinidade está abaixo de 120 mg/L. Recomenda-se aplicar 150 kg de calcário dolomítico micronizado distribuído na entrada d'água dos aeradores às 16h para neutralizar a respiração noturna do fitoplâncton.
            </>
          )}
        </p>
      </div>

      {/* Tabela de Histórico Iônico */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" /> Histórico de Análises de Viveiros
          </h3>
          <span className="text-xs text-slate-400">{logs.length} análises</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Tanque</th>
                <th className="p-3.5">Salinidade</th>
                <th className="p-3.5">Alcalinidade</th>
                <th className="p-3.5">Dureza Total</th>
                <th className="p-3.5">Cálcio / Magnésio</th>
                <th className="p-3.5">Amônia Tóxica (NH₃)</th>
                <th className="p-3.5">Nitrito (NO₂)</th>
                <th className="p-3.5">Secchi</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white uppercase font-sans">{l.tankId}</td>
                  <td className="p-3.5 text-blue-400">{l.salinityPpt} ppt</td>
                  <td className="p-3.5 text-emerald-400">{l.totalAlkalinityMgL} mg/L</td>
                  <td className="p-3.5">{l.totalHardnessMgL} mg/L</td>
                  <td className="p-3.5 text-cyan-300">{l.calciumMgL} / {l.magnesiumMgL}</td>
                  <td className="p-3.5 text-amber-400">{l.toxicAmmoniaNh3MgL} mg/L</td>
                  <td className="p-3.5 text-rose-400">{l.nitriteNo2MgL} mg/L</td>
                  <td className="p-3.5 text-slate-300 font-sans">{l.transparencySecchiCm} cm</td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {l.calcificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Leitura */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" /> Cadastrar Leitura Físico-Química e Iônica
            </h3>
            <form onSubmit={handleAddLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tanque / Viveiro:</label>
                  <select
                    value={tankId}
                    onChange={(e) => setTankId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="tank-01">Tanque 01</option>
                    <option value="tank-02">Tanque 02</option>
                    <option value="tank-03">Tanque 03</option>
                    <option value="tank-04">Tanque 04</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Salinidade (ppt):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salinityPpt}
                    onChange={(e) => setSalinityPpt(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Oxigênio (mg/L):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dissolvedOxygenMgL}
                    onChange={(e) => setDissolvedOxygenMgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Temperatura (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">pH da Água:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => setPh(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Alcalinidade (mg/L CaCO₃):</label>
                  <input
                    type="number"
                    value={totalAlkalinityMgL}
                    onChange={(e) => setTotalAlkalinityMgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Dureza Total (mg/L CaCO₃):</label>
                  <input
                    type="number"
                    value={totalHardnessMgL}
                    onChange={(e) => setTotalHardnessMgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Cálcio Ca²⁺ (mg/L):</label>
                  <input
                    type="number"
                    value={calciumMgL}
                    onChange={(e) => setCalciumMgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Magnésio Mg²⁺ (mg/L):</label>
                  <input
                    type="number"
                    value={magnesiumMgL}
                    onChange={(e) => setMagnesiumMgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Amônia (NH₃):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={toxicAmmoniaNh3MgL}
                    onChange={(e) => setToxicAmmoniaNh3MgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nitrito (NO₂):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nitriteNo2MgL}
                    onChange={(e) => setNitriteNo2MgL(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Secchi (cm):</label>
                  <input
                    type="number"
                    value={transparencySecchiCm}
                    onChange={(e) => setTransparencySecchiCm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl shadow-lg"
                >
                  Salvar Leitura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
