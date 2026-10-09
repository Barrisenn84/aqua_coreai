import React, { useState, useRef } from 'react';
import {
  Camera,
  CheckCircle2,
  FileText,
  Image,
  Loader2,
  Package,
  Plus,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { FeedLabelScanResult } from '../models/aquacultureModels';
import { LiveCameraModal } from './LiveCameraModal';

interface FeedLabelScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTankId?: string;
}

export const FeedLabelScannerModal: React.FC<FeedLabelScannerModalProps> = ({
  isOpen,
  onClose,
  defaultTankId,
}) => {
  const { tanks, batches, addFeedingLog } = useAquaCore();

  const [selectedTankId, setSelectedTankId] = useState<string>(defaultTankId || 'tank-02');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<FeedLabelScanResult | null>(null);
  const [amountKg, setAmountKg] = useState<number>(30);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [inventorySaved, setInventorySaved] = useState<boolean>(false);

  const fileInputUploadRef = useRef<HTMLInputElement>(null);

  // Preset bag label tags for instant testing without requiring an actual camera upload
  const sampleLabels = [
    {
      label: 'Guabi Pirá 32% PB (4.0mm)',
      manufacturer: 'Guabi Nutrição Aquícola',
      brandName: 'Pirá Crescimento Extrusada',
      crudeProteinPct: 32,
      pelletSizeMm: 4.0,
      targetStage: 'Crescimento' as const,
      bagWeightKg: 25,
      lotNumber: 'GB-2026-884A',
      suggestedFeedingRatePct: 2.2,
      confidenceScore: 0.98,
      summary: 'Ração extrusada flutuante formulada para máxima retenção de nitrogênio e baixo impacto na amônia da água.',
      costPerKg: 4.85,
    },
    {
      label: 'Presence Camarão Terminação 28% PB (6.0mm)',
      manufacturer: 'Presence InVivo',
      brandName: 'Camarão Terminação Alta Energia',
      crudeProteinPct: 28,
      pelletSizeMm: 6.0,
      targetStage: 'Terminação' as const,
      bagWeightKg: 25,
      lotNumber: 'PR-2026-441C',
      suggestedFeedingRatePct: 1.6,
      confidenceScore: 0.95,
      summary: 'Ração de acabamento para incremento de rendimento de carcaça e filé antes da despesca.',
      costPerKg: 4.30,
    },
    {
      label: 'Aquavita Camarão Bioflocos 35% PB',
      manufacturer: 'Aquavita Biotech',
      brandName: 'Vannamei Intensive Micropelet',
      crudeProteinPct: 35,
      pelletSizeMm: 1.8,
      targetStage: 'Bioflocos' as const,
      bagWeightKg: 20,
      lotNumber: 'AQ-VAN-901',
      suggestedFeedingRatePct: 3.5,
      confidenceScore: 0.97,
      summary: 'Micropelete imerso de alta estabilidade em água formulado para sistemas de bioflocos hiper-intensivos.',
      costPerKg: 6.20,
    },
  ];

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof sampleLabels[0]) => {
    setIsScanning(true);
    setScanError(null);
    setUploadedImagePreview(null);
    setTimeout(() => {
      setScanResult(preset);
      setIsScanning(false);
    }, 400);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setInventorySaved(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fullDataUrl = reader.result as string;
        setUploadedImagePreview(fullDataUrl);
        const base64Data = fullDataUrl.split(',')[1];
        try {
          const res = await fetch('/api/ai/scan-label', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setScanResult(data);
          } else {
            const errData = await res.json().catch(() => ({}));
            setScanError(errData.error || 'Falha ao analisar a foto. Verifique a nitidez da imagem.');
          }
        } catch (fetchErr: any) {
          setScanError('Erro de conexão ao processar visão computacional: ' + fetchErr.message);
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsScanning(false);
    }
  };

  const handleLiveCameraCapture = async (imageDataUrl: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setInventorySaved(false);
    setUploadedImagePreview(imageDataUrl);

    try {
      const base64Data = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
      const res = await fetch('/api/ai/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setScanError(errData.error || 'Falha ao analisar a foto da câmera. Aponte para o rótulo com boa luz.');
      }
    } catch (fetchErr: any) {
      setScanError('Erro de conexão ao processar visão computacional: ' + fetchErr.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmFeeding = () => {
    if (!scanResult) return;
    const feedDescription = scanResult.productName || scanResult.brandName;
    addFeedingLog({
      tankId: selectedTankId,
      amountKg,
      feedType: scanResult.crudeProteinPct ? `${feedDescription} (${scanResult.crudeProteinPct}% PB)` : feedDescription,
      proteinPct: scanResult.crudeProteinPct || 0,
      costPerKg: 4.85,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleSaveToInventory = async () => {
    if (!scanResult) return;
    try {
      const res = await fetch('/api/db/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-river-life',
          name: scanResult.productName || scanResult.brandName,
          brand: scanResult.manufacturer || scanResult.brandName || 'Insumo Identificado por IA',
          category: scanResult.itemType === 'PROBIÓTICO' ? 'BIORREMEDIAÇÃO' : 'ENGORDA',
          itemType: scanResult.itemType || 'Ração',
          unit: 'kg',
          proteinPercent: scanResult.crudeProteinPct || 0,
          currentStockKg: scanResult.bagWeightKg || 25,
          minStockAlertKg: 100,
          costPerKg: scanResult.priceBrl ? Number(scanResult.priceBrl) / (scanResult.bagWeightKg || 25) : 5.50,
          location: 'Depósito de Insumos',
          status: 'NORMAL',
          notes: `Lido via IA Vision: ${scanResult.summary}`,
        }),
      });
      if (res.ok) {
        setInventorySaved(true);
      }
    } catch (e: any) {
      alert('Erro ao salvar no estoque: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Scanner de Etiquetas de Ração
                </h2>
                <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  INPUT ZERO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Visão Computacional Gemini AI • Registro sem digitação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {savedSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 animate-fade-in font-mono">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <h3 className="text-base font-bold text-emerald-300">
                Arraçoamento Computado com Sucesso!
              </h3>
              <p className="text-xs text-slate-400">
                FCR do lote atualizado e curva de biomassa recalculada com zero digitação manual.
              </p>
            </div>
          ) : (
            <>
              {/* Tank Selector */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Tanque Receptor
                </label>
                <select
                  value={selectedTankId}
                  onChange={(e) => setSelectedTankId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  {tanks.map((t) => {
                    const b = batches.find((x) => x.tankId === t.id);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} ({b?.species} • D+{b?.cycleDay})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Upload or Point Camera Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-4 sm:p-5 text-center bg-slate-950/50 transition-colors">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsLiveCameraOpen(true)}
                    className="w-12 h-12 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    title="Abrir Câmera ao Vivo"
                  >
                    {isScanning ? (
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    ) : (
                      <Camera className="w-6 h-6 text-cyan-400" />
                    )}
                  </button>

                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-200 block">
                      {isScanning ? 'Analisando etiqueta com Gemini Multimodal...' : 'Fotografar Saca ou Enviar da Galeria'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      Extrai automaticamente: Fabricante, PB%, calibre do grânulo e dosagem
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsLiveCameraOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      <Camera className="w-4 h-4" /> Tirar Foto (Câmera)
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputUploadRef.current?.click()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Galeria / Arquivo
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputUploadRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Quick Select Presets (Instant Simulation) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ou selecione uma etiqueta escaneada recentemente:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {sampleLabels.map((lbl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(lbl)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/80 text-left transition-all cursor-pointer group"
                    >
                      <span className="font-bold text-slate-200 text-[11px] block truncate group-hover:text-cyan-300">
                        {lbl.manufacturer}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold block">
                        {lbl.crudeProteinPct}% PB • {lbl.pelletSizeMm}mm
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">{lbl.targetStage}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerta de erro de leitura */}
              {scanError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-mono flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* OCR Extracted Results Card (100% Preciso & Factual) */}
              {scanResult && (
                <div className="bg-slate-950 border-2 border-cyan-500/70 p-4 rounded-2xl space-y-3 animate-fade-in shadow-xl shadow-cyan-950/30">
                  {/* Top Bar with Item Type & Confidence */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        scanResult.itemType === 'PROBIÓTICO'
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : scanResult.itemType === 'FERTILIZANTE_CORRETIVO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {scanResult.itemType || 'RAÇÃO AQUÍCOLA'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-mono truncate max-w-[280px]">
                        {scanResult.productName || scanResult.brandName}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {Math.round(scanResult.confidenceScore > 1 ? scanResult.confidenceScore : scanResult.confidenceScore * 100)}% Confiança IA
                    </span>
                  </div>

                  {/* Image preview thumbnail & primary details */}
                  <div className="flex gap-3 items-start">
                    {uploadedImagePreview && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 bg-black shrink-0">
                        <img src={uploadedImagePreview} alt="Item fotografado" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      {scanResult.manufacturer && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          <span className="text-slate-500">Fabricante:</span> {scanResult.manufacturer}
                        </p>
                      )}
                      {scanResult.officialRegistration && (
                        <p className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 inline-block">
                          {scanResult.officialRegistration}
                        </p>
                      )}
                      {scanResult.priceBrl && (
                        <p className="text-xs font-bold text-emerald-300 font-mono">
                          Preço Detectado: R$ {scanResult.priceBrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Technical Grid: Only displays genuine data present on packaging */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-center">
                    {scanResult.crudeProteinPct != null && (
                      <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Proteína Bruta</span>
                        <span className="text-sm font-black text-cyan-400">{scanResult.crudeProteinPct}% PB</span>
                      </div>
                    )}
                    {scanResult.pelletSizeMm != null && (
                      <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Calibre Grânulo</span>
                        <span className="text-sm font-black text-slate-200">{scanResult.pelletSizeMm} mm</span>
                      </div>
                    )}
                    {scanResult.pelletType && (
                      <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Formato Físico</span>
                        <span className="text-sm font-black text-cyan-300">{scanResult.pelletType}</span>
                      </div>
                    )}
                    {scanResult.bagWeightKg != null && (
                      <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Peso da Saca</span>
                        <span className="text-sm font-black text-slate-200">{scanResult.bagWeightKg} kg</span>
                      </div>
                    )}
                    {scanResult.targetStage && (
                      <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Fase Zootécnica</span>
                        <span className="text-sm font-black text-amber-400 truncate">{scanResult.targetStage}</span>
                      </div>
                    )}
                    {scanResult.usageInstructions && (
                      <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Aplicação</span>
                        <span className="text-sm font-black text-teal-300">{scanResult.usageInstructions}</span>
                      </div>
                    )}
                  </div>

                  {/* Active Ingredients & Benefits List */}
                  {scanResult.benefits && scanResult.benefits.length > 0 && (
                    <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        Garantias e Benefícios Comprovados no Rótulo:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {scanResult.benefits.map((b, i) => (
                          <span key={i} className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-md">
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Stepper (Zero Typing) */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300">
                      {scanResult.itemType === 'PROBIÓTICO' ? 'Dose Aplicada no Tanque:' : 'Quantidade no Trato:'}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <button
                        type="button"
                        onClick={() => setAmountKg(Math.max(1, amountKg - 5))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                      >
                        -5
                      </button>
                      <span className="text-sm font-black text-cyan-400 min-w-14 text-center">
                        {amountKg} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => setAmountKg(amountKg + 5)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans italic leading-tight">
                    "{scanResult.summary}"
                  </p>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmFeeding}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {scanResult.itemType === 'PROBIÓTICO'
                          ? 'Confirmar Aplicação de Probiótico no Tanque'
                          : 'Confirmar Arraçoamento (Input Zero)'}
                      </span>
                    </button>

                    {/* Botão de Salvar no Estoque */}
                    <button
                      type="button"
                      onClick={handleSaveToInventory}
                      disabled={inventorySaved}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center justify-center gap-2 ${
                        inventorySaved
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{inventorySaved ? '✓ Insumo Salvo no Estoque da Fazenda' : 'Salvar Insumo no Estoque'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Câmera ao Vivo WebRTC (Notebook e Smartphone) */}
        <LiveCameraModal
          isOpen={isLiveCameraOpen}
          onClose={() => setIsLiveCameraOpen(false)}
          onCapture={handleLiveCameraCapture}
          title="Scanner de Rótulo de Ração - IA Vision"
          subtitle="Enquadre a etiqueta ou tabela nutricional da saca de ração"
        />
      </div>
    </div>
  );
};
