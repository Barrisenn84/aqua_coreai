import React, { useState, useEffect } from 'react';
import {
  Home,
  CheckCircle2,
  Search,
  FileCheck,
  ShieldCheck,
  MapPin,
  Waves,
  Briefcase,
  Sparkles,
  Save
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface FarmProfile {
  tenantId: string;
  name: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  city: string;
  state: string;
  waterSourceType: string;
  averageSalinityPpt: number;
  totalAreaHectares: number;
  waterSurfaceHectares: number;
  technicianInCharge: string;
  councilRegistration: string;
  environmentalLicense: string;
}

interface FarmProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FarmProfileModal: React.FC<FarmProfileModalProps> = ({ isOpen, onClose }) => {
  const { farm, updateFarmSettings, currentTenant } = useAquaCore();
  const [profile, setProfile] = useState<FarmProfile>({
    tenantId: currentTenant.id,
    name: farm.name,
    corporateName: farm.name,
    cnpj: '45.182.903/0001-44',
    stateRegistration: '16.920.441-0',
    address: farm.location,
    city: farm.location.split('–')[0]?.trim() || 'Mogeiro',
    state: farm.location.split('–')[1]?.trim() || 'PB',
    waterSourceType: 'Poço Artesiano Salobro & Captação Fluvial',
    averageSalinityPpt: 12.0,
    totalAreaHectares: 18.5,
    waterSurfaceHectares: 8.4,
    technicianInCharge: 'Dr. Roberto Vasconcelos',
    councilRegistration: 'CREA-PB 160.822-D',
    environmentalLicense: 'LO-SUDEMA-2024/0981'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [searchingCnpj, setSearchingCnpj] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/farm-profile?tenantId=tenant-river-life');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil da fazenda:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultCnpj = async () => {
    const rawCnpj = profile.cnpj.replace(/\D/g, '');
    if (rawCnpj.length !== 14) {
      alert('Informe um CNPJ válido com 14 dígitos.');
      return;
    }

    try {
      setSearchingCnpj(true);
      const res = await fetch(`/api/brasilapi/cnpj/${rawCnpj}`);
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => ({
          ...prev,
          name: data.nome_fantasia || prev.name,
          corporateName: data.razao_social || prev.corporateName,
          address: `${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}`,
          city: data.municipio || prev.city,
          state: data.uf || prev.state
        }));
      } else {
        alert('CNPJ não localizado na BrasilAPI.');
      }
    } catch (err) {
      console.error('Erro na consulta CNPJ:', err);
    } finally {
      setSearchingCnpj(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/db/farm-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, tenantId: currentTenant.id })
      });
      if (res.ok) {
        updateFarmSettings({
          name: profile.name,
          location: `${profile.city}${profile.state ? ' – ' + profile.state : ''}`,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Minha Fazenda & Dados Cadastrais
              </h2>
              <p className="text-xs text-slate-400">
                Informações cadastrais, regulatórias, licenciamento ambiental e responsável técnico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dados da propriedade atualizados com sucesso e salvos no banco de dados!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Seção 1: Dados Jurídicos e Identificação */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Identificação Jurídica da Propriedade
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome Fantasia da Fazenda</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Razão Social Completa</label>
                <input
                  type="text"
                  value={profile.corporateName}
                  onChange={(e) => setProfile({ ...profile, corporateName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">CNPJ</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={profile.cnpj}
                    onChange={(e) => setProfile({ ...profile, cnpj: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleConsultCnpj}
                    disabled={searchingCnpj}
                    title="Consultar na Receita Federal via BrasilAPI"
                    className="px-2.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs flex items-center justify-center shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Inscrição Estadual (IE)</label>
                <input
                  type="text"
                  value={profile.stateRegistration}
                  onChange={(e) => setProfile({ ...profile, stateRegistration: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Município / UF</label>
                <input
                  type="text"
                  value={`${profile.city} - ${profile.state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    setProfile({
                      ...profile,
                      city: parts[0]?.trim() || profile.city,
                      state: parts[1]?.trim() || profile.state
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Endereço / Localização da Propriedade</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Seção 2: Especificações Técnicas e Hídricas */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5" />
              Características Zootécnicas & Hídricas
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Área Total (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.totalAreaHectares}
                  onChange={(e) => setProfile({ ...profile, totalAreaHectares: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Lâmina d'Água Útil (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.waterSurfaceHectares}
                  onChange={(e) => setProfile({ ...profile, waterSurfaceHectares: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Salinidade Típica (ppt)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.averageSalinityPpt}
                  onChange={(e) => setProfile({ ...profile, averageSalinityPpt: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fonte de Captação Hídrica</label>
              <input
                type="text"
                value={profile.waterSourceType}
                onChange={(e) => setProfile({ ...profile, waterSourceType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Seção 3: Responsabilidade Técnica & Licença Ambiental */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Responsabilidade Técnica & Conformidade Ambiental
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Responsável Técnico (RT)</label>
                <input
                  type="text"
                  value={profile.technicianInCharge}
                  onChange={(e) => setProfile({ ...profile, technicianInCharge: e.target.value })}
                  placeholder="Nome do Engenheiro de Pesca ou Zootecnista"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Registro no Conselho (CREA/CRMV)</label>
                <input
                  type="text"
                  value={profile.councilRegistration}
                  onChange={(e) => setProfile({ ...profile, councilRegistration: e.target.value })}
                  placeholder="Ex: CREA-PB 160.822-D"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Licença de Operação Ambiental (LO)</label>
              <input
                type="text"
                value={profile.environmentalLicense}
                onChange={(e) => setProfile({ ...profile, environmentalLicense: e.target.value })}
                placeholder="Ex: LO-SUDEMA-2024/0981 ou IBAMA..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
                required
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
