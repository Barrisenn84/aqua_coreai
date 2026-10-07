import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertTriangle, Sparkles, Zap, Image as ImageIcon } from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Câmera ao Vivo - IA Vision',
  subtitle = 'Aponte a câmera para o objeto, comedouro ou etiqueta e clique em capturar',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Stop current active media stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Erro ao finalizar track de câmera:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Check available devices
  const checkCameraDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }
    } catch {
      // Ignore enumeration failure
    }
  };

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setIsLoadingCamera(true);
    setCameraError(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Seu navegador ou dispositivo não suporta acesso direto à câmera via WebRTC. Use o seletor nativo abaixo.'
      );
      setIsLoadingCamera(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try requesting preferred facingMode with ideal resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err: any) {
        // Fallback for laptops / desktop webcams that don't support facingMode constraints
        console.warn('Tentativa com facingMode falhou, tentando fallback genérico:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play aguardando interação do usuário:', playErr);
        }
      }

      // Check if torch/flashlight is supported
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (capabilities && 'torch' in capabilities) {
          setTorchAvailable(true);
        } else {
          setTorchAvailable(false);
        }
      }

      await checkCameraDevices();
      setIsLoadingCamera(false);
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      let msg = 'Não foi possível acessar a câmera do dispositivo.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg =
          'Permissão de câmera negada. Por favor, autorize o acesso à câmera nas configurações do seu navegador ou clique no botão abaixo para usar a câmera nativa do sistema.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Nenhuma câmera foi encontrada no seu dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'A câmera já está sendo usada por outro aplicativo ou aba do navegador.';
      }
      setCameraError(msg);
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setTorchOn(false);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Flip Camera (Traseira vs Frontal / Webcam)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle Torch/Lanterna
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Falha ao acionar lanterna:', e);
      }
    }
  };

  // Capture Photo Snapshot
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Aguarde o vídeo da câmera inicializar completamente.');
      return;
    }

    setIsFlashing(true);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // If user facing camera (webcam / selfie), we can mirror horizontal if desired, but keep raw frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      setTimeout(() => {
        setIsFlashing(false);
        stopStream();
        onCapture(dataUrl);
        onClose();
      }, 150);
    }
  };

  // Fallback for file picker when camera permission fails
  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      stopStream();
      onCapture(b64);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Flash effect overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping opacity-90" />
        )}

        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">{title}</h3>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AO VIVO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {torchAvailable && (
              <button
                type="button"
                onClick={toggleTorch}
                title="Alternar Lanterna"
                className={`p-2 rounded-xl border transition-all ${
                  torchOn
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Fechar Câmera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative flex-1 bg-black aspect-video min-h-[300px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {isLoadingCamera && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-cyan-400 z-10 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-xs font-mono text-slate-300">Inicializando lente da câmera em alta definição...</p>
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-md mx-auto space-y-4 z-10 animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-rose-200">Atenção ao Acesso da Câmera</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </button>
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Câmera / Arquivo Nativo
                </button>
              </div>

              <input
                ref={fileFallbackRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFallbackFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Native Live Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover select-none"
              />

              {/* Viewfinder Target / Crosshair Overlay */}
              <div className="absolute inset-8 pointer-events-none border-2 border-cyan-400/30 rounded-2xl flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="text-center font-mono text-[10px] text-cyan-300 bg-slate-950/70 py-1 px-3 rounded-full self-center border border-cyan-500/30 backdrop-blur-sm">
                  {facingMode === 'environment' ? '📷 Câmera Traseira (Ambiente)' : '👤 Câmera Frontal / Webcam'}
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Bar Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4 z-20">
          {/* Switch Camera Button (Rear vs Front) */}
          <button
            type="button"
            onClick={toggleFacingMode}
            disabled={isLoadingCamera}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-semibold transition-all disabled:opacity-50"
            title="Alternar entre câmera traseira e frontal"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Inverter Lente</span>
          </button>

          {/* Shutter Capture Button */}
          <button
            type="button"
            onClick={capturePhoto}
            disabled={isLoadingCamera || !!cameraError}
            className="group relative flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 flex items-center justify-center border-2 border-white/80 group-hover:bg-cyan-950 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-inner text-slate-900 group-hover:scale-95 transition-transform">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </div>
            </div>
          </button>

          {/* Choose from files fallback */}
          <div>
            <button
              type="button"
              onClick={() => fileFallbackRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-semibold transition-all"
              title="Abrir arquivo da galeria"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Galeria</span>
            </button>
            <input
              ref={fileFallbackRef}
              type="file"
              accept="image/*"
              onChange={handleFallbackFileChange}
              className="hidden"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
