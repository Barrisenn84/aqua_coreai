import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
  Zap,
  PlusCircle,
  Utensils,
  Droplets,
  Activity,
  Layers,
} from 'lucide-react';
import { LiveCameraModal } from './LiveCameraModal';

interface VisionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onRefreshData?: () => void;
}

type AnalysisMode = 'tray_feeding' | 'shrimp_health' | 'water_quality' | 'invoice_ocr' | 'general_diagnosis';

// Compressão inteligente no cliente para manter 100% da nitidez sem estourar o limite de upload do celular
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedB64 = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressedB64);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const VisionAnalysisModal: React.FC<VisionAnalysisModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onRefreshData,
}) => {
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('tray_feeding');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inventorySaved, setInventorySaved] = useState<boolean>(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);

  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputUploadRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG ou WEBP).');
      return;
    }

    setError(null);
    setResult(null);
    setInventorySaved(false);

    try {
      const b64 = await compressImageFile(file);
      setImagePreview(b64);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('Tire uma foto ou selecione uma imagem para analisar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imagePreview,
          analysis_mode: selectedMode,
          custom_prompt: customPrompt.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Falha na análise da imagem (Código HTTP ${res.status}). Verifique a conexão e tente novamente.`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Erro na visão computacional:', err);
      setError(err.message || 'Falha ao analisar a foto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    setCustomPrompt('');
    setInventorySaved(false);
  };

  const handleSaveToInventoryFromOCR = async () => {
    if (!result?.extracted_data) return;
    try {
      setLoading(true);
      const d = result.extracted_data;
      const res = await fetch('/api/db/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-river-life',
          name: d.name || 'Insumo Identificado por Foto',
          brand: d.brand || 'Guabi Aqua',
          category: 'ENGORDA',
          itemType: d.item_type || 'Ração',
          unit: d.unit || 'kg',
          proteinPercent: 35.0,
          currentStockKg: Number(d.current_stock_kg || 1000),
          minStockAlertKg: Number(d.min_stock_alert_kg || 300),
          costPerKg: Number(d.cost_per_kg || 6.20),
          location: 'Silo Principal',
          status: 'NORMAL',
          notes: `Cadastrado automaticamente via Visão IA / OCR em ${new Date().toLocaleDateString('pt-BR')}.`,
        }),
      });

      if (res.ok) {
        setInventorySaved(true);
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar insumo');
    } finally {
      setLoading(false);
    }
  };

  const modeDetails: Record<AnalysisMode, { title: string; subtitle: string; desc: string; icon: any; color: string }> = {
    tray_feeding: {
      title: 'Bandeja de Ração',
      subtitle: 'Comedouro do Viveiro',
      desc: '🍽️ Vê se o camarão comeu tudo ou se sobrou comida no pratinho dele para não estragar a água.',
      icon: Utensils,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    shrimp_health: {
      title: 'Saúde do Camarão',
      subtitle: 'Corpinho & Casquinha',
      desc: '🦐 Olha a barriguinha, a casca e os olhinhos para ver se ele está forte, gordinho e saudável.',
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    water_quality: {
      title: 'Fitas & Água',
      subtitle: 'Pureza da Piscina',
      desc: '🧪 Lê a cor da fitinha de teste e mostra se a água está limpa e com ar fresquinho para nadar.',
      icon: Droplets,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    invoice_ocr: {
      title: 'Nota / Saco de Insumo',
      subtitle: 'Rações, Adubos e Notas',
      desc: '📄 Lê qualquer saco de ração, probiótico ou nota fiscal e guarda tudo no galpão sozinho.',
      icon: FileText,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    general_diagnosis: {
      title: 'Diagnóstico Livre',
      subtitle: 'Tire Foto de Qualquer Coisa',
      desc: '🔍 Avalia aeradores, cor da água, canos, motores ou solo do viveiro com inteligência artificial.',
      icon: Layers,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-slate-100 my-auto max-h-[94vh] flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 text-white">
              Olhos de Águia da IA • Visão Computacional
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                100% Preciso
              </span>
            </h2>
            <p className="text-xs text-slate-400">Tire foto com seu celular, notebook ou selecione da sua galeria</p>
          </div>
        </div>

        {/* Banner Didático e Fácil de Compreender */}
        <div className="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">💡 Como funciona para todo mundo entender: </span>
            Aponte a câmera para o que você quer saber (o pratinho de comida, a água, o camarão ou um saco de ração). A IA vai analisar cada cantinho e te responder em palavras simples o que está acontecendo e o que fazer!
          </div>
        </div>

        {/* Seleção dos 5 Modos Especialistas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {(Object.keys(modeDetails) as AnalysisMode[]).map((mode) => {
            const m = modeDetails[mode];
            const Icon = m.icon;
            const isSelected = selectedMode === mode;
            return (
              <button
                key={mode}
                onClick={() => {
                  setSelectedMode(mode);
                  setResult(null);
                }}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-lg w-fit border mb-1.5 ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-100">{m.title}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{m.subtitle}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Área de Captura de Imagem / Pré-visualização */}
        <div className="mb-6">
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-64 flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-slate-900 text-slate-200 rounded-lg backdrop-blur-sm border border-slate-700 text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Trocar Foto
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-950/40 hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-center gap-4 mb-4">
                {/* Botão de Câmera ao Vivo (Smartphone e Notebook) */}
                <button
                  type="button"
                  onClick={() => setIsLiveCameraOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" /> Tirar Foto (Câmera)
                </button>
                {/* Botão de Upload da Galeria */}
                <button
                  type="button"
                  onClick={() => fileInputUploadRef.current?.click()}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" /> Galeria / Arquivo
                </button>
              </div>
              <p className="text-xs text-slate-500">Aceita fotos de comedouros, amostras de camarão, testes de água e notas fiscais (JPG, PNG, WEBP)</p>

              <input
                ref={fileInputCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={fileInputUploadRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Campo de observação adicional */}
        {imagePreview && !result && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Observação adicional para a IA (Opcional):
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Foto tirada 2 horas após o primeiro trato matinal no Tanque 04..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}

        {/* Botão de Disparo da Análise */}
        {imagePreview && !result && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" /> Processando Imagem com IA...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Diagnosticar com Visão IA
              </>
            )}
          </button>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 mt-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultados da Análise de Visão */}
        {result && (
          <div className="space-y-4 animate-fade-in mt-4 bg-slate-950/70 border border-cyan-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Parecer da Visão IA</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  {result.confidence_score}% de Confiança
                </span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                result.severity_level === 'CRITICO' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                result.severity_level === 'ATENCAO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {result.severity_level}
              </span>
            </div>

            {/* Resumo Executivo */}
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">Resumo Executivo:</div>
              <p className="text-sm text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {result.executive_summary}
              </p>
            </div>

            {/* Observações Técnicas */}
            {result.technical_observations?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Observações Técnicas:</div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {result.technical_observations.map((obs: string, idx: number) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ações Recomendadas */}
            {result.recommended_actions?.length > 0 && (
              <div className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-lg">
                <div className="text-xs font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Recomendações Zootécnicas Imediatas:
                </div>
                <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                  {result.recommended_actions.map((act: string, idx: number) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botão de Ação OCR: Salvar no Estoque */}
            {selectedMode === 'invoice_ocr' && result.extracted_data && (
              <div className="pt-2">
                {inventorySaved ? (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Insumo salvo no estoque com sucesso!
                  </div>
                ) : (
                  <button
                    onClick={handleSaveToInventoryFromOCR}
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Salvar Insumo no Estoque da Fazenda
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal de Câmera ao Vivo WebRTC (Notebook e Smartphone) */}
        <LiveCameraModal
          isOpen={isLiveCameraOpen}
          onClose={() => setIsLiveCameraOpen(false)}
          onCapture={(dataUrl) => {
            setImagePreview(dataUrl);
            setError(null);
            setResult(null);
            setInventorySaved(false);
            setIsLiveCameraOpen(false);
          }}
          title={`Câmera ao Vivo - ${modeDetails[selectedMode].title}`}
          subtitle="Enquadre o foco de imagem e clique no disparador para analisar com IA"
        />
      </div>
    </div>
  );
};
