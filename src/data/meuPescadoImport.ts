/**
 * Snapshot de migração auditável do Meu Pescado.
 *
 * Origem: telas acessadas em 21/10/2026, conta River Life (Entreposto).
 * Dados pessoais, fiscais e bancários foram deliberadamente omitidos deste
 * bundle público. Valores conflitantes são preservados em `dataQualityIssues`
 * em vez de serem silenciosamente tratados como verdade.
 */

export const meuPescadoSnapshot = {
  source: 'Meu Pescado',
  capturedAt: '2026-10-21T15:14:00-03:00',
  farm: {
    name: 'River Life (Entreposto)',
    productionAreaName: 'River Life (Área Fazenda)',
    location: 'Mogeiro – PB',
    productionType: 'Berçários',
    weather: {
      temperatureC: 31,
      apparentTemperatureC: 31,
      condition: 'Céu limpo',
      humidityPct: 46,
      windKmh: 23,
      rainMm: 1,
      nextRainChancePct: 22,
      moonPhase: 'Crescente gibosa',
      moonIlluminationPct: 85,
    },
  },
  summary: {
    populatedTanks: 4,
    cultivationCostRs: 22234,
    expectedRevenueRs: 0,
    expectedResultRs: -22234,
    totalBiomassKg: 6.43,
    totalPopulation: 2220000,
    dashboardFeedKg: 8.27,
    dashboardFcr: 370.14,
  },
  tanks: [
    { id: 'tank-01', name: 'T1', type: 'Escavado', line: 'Berçários', volumeM3: 20, batchCode: 'L171026', cycle: 1, status: 'Ocupado' },
    { id: 'tank-02', name: 'T2', type: 'Escavado', line: 'Berçários', volumeM3: 20, batchCode: 'L171026', cycle: 1, status: 'Ocupado' },
    { id: 'tank-03', name: 'T3', type: 'Escavado', line: 'Berçários', volumeM3: 20, batchCode: 'L171026', cycle: 1, status: 'Ocupado' },
    { id: 'tank-04', name: 'T4', type: 'Escavado', line: 'Berçários', volumeM3: 20, batchCode: 'L1171026', cycle: 1, status: 'Ocupado' },
    { id: 'tank-05', name: 'T5', type: 'Escavado', line: 'Berçários', volumeM3: 30, batchCode: null, cycle: 0, status: 'Livre' },
  ],
  lots: [
    {
      id: 'batch-01', tankId: 'tank-01', tankName: 'T1', batchCode: 'L171026', supplier: 'Maricultura Nordeste',
      cultivationDays: 4, currentWeightG: 0.004854, currentBiomassKg: 1.31, initialBiomassKg: 0.78,
      accumulatedFeedKg: 0.78, fcr: 1.47, initialPopulation: 750000, currentPopulation: 270000,
      statisticalSurvivalPct: 100, remainingSurvivalPct: 36, cultivationCostRs: 2695.29, costPerThousandRs: 9.98,
    },
    {
      id: 'batch-02', tankId: 'tank-02', tankName: 'T2', batchCode: 'L171026', supplier: 'Maricultura Nordeste',
      cultivationDays: 4, currentWeightG: 0.002625, currentBiomassKg: 1.97, initialBiomassKg: 2.17,
      accumulatedFeedKg: 2.88, fcr: 0, initialPopulation: 750000, currentPopulation: 750000,
      statisticalSurvivalPct: 100, remainingSurvivalPct: 100, cultivationCostRs: 7514.89, costPerThousandRs: 0,
    },
    {
      id: 'batch-03', tankId: 'tank-03', tankName: 'T3', batchCode: 'L171026', supplier: 'Maricultura Nordeste',
      cultivationDays: 4, currentWeightG: 0.002625, currentBiomassKg: 1.97, initialBiomassKg: 2.17,
      accumulatedFeedKg: 2.88, fcr: 0, initialPopulation: 750000, currentPopulation: 750000,
      statisticalSurvivalPct: 100, remainingSurvivalPct: 100, cultivationCostRs: 7514.89, costPerThousandRs: 0,
    },
    {
      id: 'batch-04', tankId: 'tank-04', tankName: 'T4', batchCode: 'L1171026', supplier: 'Maricultura Nordeste',
      cultivationDays: 4, currentWeightG: 0.002625, currentBiomassKg: 1.18, initialBiomassKg: 1.30,
      accumulatedFeedKg: 1.73, fcr: 0, initialPopulation: 750000, currentPopulation: 450000,
      statisticalSurvivalPct: 100, remainingSurvivalPct: 60, cultivationCostRs: 4508.93, costPerThousandRs: 0,
    },
  ],
  nutrition: [
    { tankName: 'T1', lastFeeding: '2026-10-19', responsible: 'Collermhann', product: 'RAÇÃO NUTRIESFERA 450', lastAmountKg: 0.24, reportedAccumulatedKg: 2.16 },
    { tankName: 'T2', lastFeeding: '2026-10-19', responsible: 'Collermhann', product: 'RAÇÃO NUTRIESFERA 450', lastAmountKg: 0.96, reportedAccumulatedKg: 2.88 },
    { tankName: 'T3', lastFeeding: '2026-10-19', responsible: 'Collermhann', product: 'RAÇÃO NUTRIESFERA 450', lastAmountKg: 0.96, reportedAccumulatedKg: 2.88 },
    { tankName: 'T4', lastFeeding: '2026-10-19', responsible: 'Collermhann', product: 'RAÇÃO NUTRIESFERA 450', lastAmountKg: 0.96, reportedAccumulatedKg: 2.88 },
  ],
  biometries: [
    { tankName: 'T1', lastBiometry: '2026-10-20', avgWeightG: 0.004854, biomassKg: 2.28, survivalPct: 100 },
    { tankName: 'T2', lastBiometry: '2026-10-17', avgWeightG: 0.002625, biomassKg: 2.17, survivalPct: 100 },
    { tankName: 'T3', lastBiometry: '2026-10-17', avgWeightG: 0.002625, biomassKg: 2.17, survivalPct: 100 },
    { tankName: 'T4', lastBiometry: null, avgWeightG: null, biomassKg: null, survivalPct: null },
  ],
  harvests: [
    { tankName: 'T1', batchCode: 'L171026', date: '2026-10-20', responsible: 'Collermhann', biomassKg: 0.73, avgWeightG: 0 },
    { tankName: 'T4', batchCode: 'L1171026', date: '2026-10-20', responsible: 'Collermhann', biomassKg: 1.69, avgWeightG: 0.01 },
  ],
  inventory: [
    { id: 'mp-stock-sugar', name: 'AÇÚCAR', type: 'Veículo', unit: 'kg', minimum: 0, current: 10, averageUnitPriceRs: 4.69, lastUnitPriceRs: 4.69, balanceRs: 46.90 },
    { id: 'mp-stock-biomarine', name: 'BR BIOMARINE', type: 'Nutrição/ Probiótico', unit: 'l', minimum: 0, current: 2.60, averageUnitPriceRs: 130, lastUnitPriceRs: 130, balanceRs: 338 },
    { id: 'mp-stock-imuno', name: 'IMUNO AQUA', type: 'Nutrição/ Probiótico', unit: 'g', minimum: 0, current: 2500, averageUnitPriceRs: 0.11, lastUnitPriceRs: 0.11, balanceRs: 280 },
    { id: 'mp-stock-protect', name: 'PROTECT', type: 'Nutrição/ Probiótico', unit: 'l', minimum: 0, current: 2, averageUnitPriceRs: 58.43, lastUnitPriceRs: 58.43, balanceRs: 116.86 },
    { id: 'mp-stock-feed', name: 'RAÇÃO NUTRIESFERA 450', type: 'Ração', unit: 'kg', minimum: 0, current: 39.20, averageUnitPriceRs: 38.85, lastUnitPriceRs: 38.85, balanceRs: 1522.92 },
  ],
  finance: {
    accountName: 'Padrão',
    currentBalanceRs: -20043.76,
    pending: [
      { direction: 'Entrada', dueDate: '2026-10-31', entryDate: '2026-10-20', amountRs: 3900, category: 'Financeiro', partner: 'NJ Criação e Produção de Camarão e Tilápia Ltda.' },
      { direction: 'Saída', dueDate: '2026-10-21', entryDate: '2026-10-07', amountRs: 1942.50, category: 'Estoque', partner: 'Feed & Care', description: 'Prazo 15 dias' },
    ],
  },
  partners: [
    { name: 'BR GROUPD', type: 'Fornecedor de insumos' },
    { name: 'Collermhann', type: 'Vendedor' },
    { name: 'Energisa', type: 'Outros' },
    { name: 'Feed & Care', type: 'Fornecedor de insumos' },
    { name: 'IACQUA', type: 'Fornecedor de insumos' },
    { name: 'Ivan (Van)', type: 'Cliente' },
    { name: 'Lourenço', type: 'Cliente' },
    { name: 'Maricultura Nordeste', type: 'Fornecedor de pós larva' },
    { name: 'Meu Pescado', type: 'Outros' },
    { name: 'Neco Paulo', type: 'Cliente' },
    { name: 'NJ Criação e Produção de Camarão', type: 'Cliente' },
    { name: 'NJ Criação e Produção de Camarão e Tilápia Ltda.', type: 'Cliente' },
    { name: 'Odon Francisco (TETE AMORIM)', type: 'Cliente' },
    { name: 'SUPER MERCADO', type: 'Fornecedor de insumos' },
  ],
  reportCatalog: [
    'DRE', 'DFC', 'Biometria por tanque', 'Biometria geral', 'Período por tanque',
    'Diário geral', 'Análise de água', 'Controle de ração', 'Análise comparativa',
    'Despescas por parceiros', 'Produção', 'Fornecedores', 'Custos de produção', 'Vendas',
  ],
  notificationTemplates: [
    'Despesca realizada', 'Sincronização offline', 'Estoque baixo', 'Sem estoque',
    'Venda realizada', 'Despesas e receitas vencendo hoje', 'Relatório financeiro semanal',
    'Parâmetro de água fora do padrão',
  ],
  dataQualityIssues: [
    {
      id: 'feed-total-conflict', severity: 'high', field: 'Ração acumulada',
      observed: 'Painel/lotes: 8,27 kg; tela Nutrição: 10,80 kg',
      recommendation: 'Conciliar lançamentos por data e origem antes de usar o valor no FCA.',
    },
    {
      id: 'fcr-outlier', severity: 'critical', field: 'FCA médio',
      observed: '370,14 no painel; lotes T2–T4 exibem 0,00 e T1 exibe 1,47',
      recommendation: 'Tratar como indisponível até corrigir biomassa inicial, alimentação e despescas.',
    },
    {
      id: 'biomass-conflict', severity: 'high', field: 'Biomassa',
      observed: 'Painel/lotes: 6,43 kg; tela Biometria soma 6,62 kg sem T4; cartões dos lotes somam 6,43 kg',
      recommendation: 'Adotar o valor dos lotes como consolidado provisório e manter o conflito visível.',
    },
    {
      id: 'mortality-conflict', severity: 'critical', field: 'Mortalidade',
      observed: 'Relatório mostra 3.000.000 mortes, porém populações atuais e sobrevivência não confirmam esse total',
      recommendation: 'Não usar o total para decisão até revisar o evento de 17/10/2026.',
    },
    {
      id: 'missing-water', severity: 'medium', field: 'Análise de água',
      observed: 'Nenhuma análise cadastrada no Meu Pescado',
      recommendation: 'Cadastrar uma medição validada antes de qualquer recomendação de calagem ou alimentação.',
    },
  ],
} as const;

export type MeuPescadoSnapshot = typeof meuPescadoSnapshot;
