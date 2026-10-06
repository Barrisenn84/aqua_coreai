# 🦐 AQUA-CORE AI | Sistema Nervoso da Aquicultura

> **Plataforma Integral de Gestão Zootécnica, Inteligência Operacional, Fiscal e Financeira para Carcinicultura e Piscicultura Intensiva.**

---

## 🌊 Visão Geral

O **AQUA-CORE AI** é o centro de controle e "sistema nervoso" digital para fazendas de aquicultura moderna (*Litopenaeus vannamei* e *Oreochromis niloticus*), com suporte nativo a operações multi-tenant (compatível também com canteiros de obra inteligentes via Constr.AI).

A plataforma combina telemetria em tempo real, inteligência artificial preditiva baseada em **Google Gemini 2.5 Flash**, orquestração de aeração automatizada e conectividade com APIs governamentais e astronômicas gratuitas.

---

## 🚀 Principais Módulos & Recursos

### 1. 🧠 Inteligência Artificial em Toda a Potência (Gemini 2.5 Flash)
- **Oráculo Aquícola:** Engenheiro zootecnista virtual que recalcula a taxa diária de arraçoamento conforme a curva térmica e biomassa em água, minimizando desperdício de ração e acúmulo de amônia.
- **Guardião de Emergência:** Monitoramento segundo a segundo com disparo forçado de aeradores quando o oxigênio atinge níveis críticos ($O_2 < 4.0\text{ mg/L}$).
- **Auditoria Fiscal & Sanitária de NF-e:** Sugestão de NCM (`0306.17.00`), CFOP (`5.101`), orientações de diferimento de ICMS para o Nordeste e alerta obrigatório de emissão de GTA (Guia de Trânsito Animal).
- **Diagnóstico Preditivo de Motores:** Avalia o risco de queima e travamento de aeradores nas próximas 48h com base em dias de atraso de engraxamento e salinidade.
- **CFO Virtual (DRE Financeiro):** Raio-x do custo por kg produzido e estratégias de corte de consumo de energia no horário de pico.

### 2. 🌐 Integração com APIs Gratuitas
- **☀️ Sunrise-Sunset API:** Monitoramento do ciclo solar astronômico para antecipar a queda de oxigênio pré-amanhecer (cessação da fotossíntese do fitoplâncton).
- **🇧🇷 BrasilAPI:** Consulta instantânea de CNPJ da Receita Federal e CEP para preenchimento de clientes, fornecedores e notas fiscais.
- **🌦️ Open-Meteo API:** Previsão de microclima e frentes frias para manejo preventivo de choque térmico.
- **💵 ExchangeRate API:** Paridade cambial USD/BRL para insumos importados da ração e cotação de frutos do mar.

### 3. 🏢 Multi-Tenant & Persistência Dupla
- **Múltiplos Produtores:** Isolamento completo de contas e propriedades com alternância instantânea.
- **Prisma ORM & PostgreSQL / Supabase:** Mapeamento completo de tanques, lotes, biometrias, leituras, notas e equipamentos (`prisma/schema.prisma`).
- **Armazenamento Atômico Offline:** Persistência autônoma em disco local para áreas rurais com baixa conectividade.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Motion.
- **Backend & Orquestrador:** Node.js, Express, TSX, Dotenv.
- **Banco de Dados:** Prisma ORM, PostgreSQL / Supabase, JSON Store atômico.
- **Inteligência Artificial:** Google Gen AI SDK (`@google/genai`), Gemini 2.5 Flash.

---

## ⚡ Como Executar Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **NPM** ou **Bun**

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/Barrisenn84/aqua_coreai.git
   cd aqua_coreai
   ```

2. **Instalar Dependências:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar Variáveis de Ambiente:**
   Copie `.env.example` para `.env` e configure sua chave da API Gemini:
   ```env
   GEMINI_API_KEY="SUA_CHAVE_AQUI"
   PORT=3000
   ```

4. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:3000`

5. **Compilar para Produção:**
   ```bash
   npm run build
   ```

---

## 📜 Licença
Distribuído sob licença proprietária para AQUA-CORE AI. Todos os direitos reservados.
