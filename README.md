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

### 3. 🏢 Multi-Tenant & Persistência
- **Múltiplos Produtores:** Isolamento completo de contas e propriedades com alternância instantânea.
- **Armazenamento JSON atômico:** Persistência autônoma em disco local para áreas rurais com baixa conectividade.
- **Schema PostgreSQL de referência:** O arquivo `prisma/schema.prisma` documenta a migração futura para PostgreSQL, mas não é executado pela aplicação atual.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Motion.
- **Backend & Orquestrador:** Node.js, Express, TSX, Dotenv.
- **Banco de Dados atual:** JSON Store atômico; schema PostgreSQL mantido como referência para migração.
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
   npm ci
   ```

3. **Configurar Variáveis de Ambiente:**
   Copie `.env.example` para `.env`, troque todos os placeholders e configure a chave da API Gemini. Em desenvolvimento, `ALLOW_INSECURE_DEMO_AUTH=true` só funciona quando `DEMO_AUTH_PASSWORD` também foi definido:
   ```env
   GEMINI_API_KEY="SUA_CHAVE_AQUI"
   PORT=3000
   ```

4. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:3000`. A senha de demonstração é lida somente da variável local `DEMO_AUTH_PASSWORD`.

5. **Compilar para Produção:**
   ```bash
   npm run check
   ```

---

## 🚀 Implantação no Render

No serviço web do Render, configure `NODE_ENV=production`, `JWT_SECRET` (segredo aleatório com pelo menos 32 caracteres), `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` (hash bcrypt, nunca a senha em texto). O usuário definido em `ADMIN_EMAIL` recebe o papel `superadmin_owner` e pode alternar entre as organizações retornadas pelo servidor. A aplicação não oferece atalhos de senha nem credenciais embutidas.

Mantenha `ALLOW_INSECURE_DEMO_AUTH=false` ou remova a variável em produção. Depois do deploy, valide `/api/health` e abra o modal de acesso: ele deve indicar que a configuração está pronta, sem revelar segredos.

## 🚂 Implantação no Railway

O projeto exige Node.js 22 ou mais recente, compila o frontend Vite e o servidor Express com `npm run build`, inicia com `npm start` e responde ao healthcheck em `/api/health`.

1. Crie o serviço a partir deste repositório GitHub. O Railpack detectará os scripts do `package.json`.
2. Configure `NODE_ENV=production`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `GEMINI_API_KEY` nas variáveis do serviço. Não habilite `ALLOW_INSECURE_DEMO_AUTH` em produção.
3. Anexe um volume em `/data`. A aplicação detecta automaticamente `RAILWAY_VOLUME_MOUNT_PATH`; sem volume, os dados JSON são efêmeros e serão perdidos em um redeploy.
4. Gere um domínio público em **Settings → Networking** e confirme que `/api/health` retorna HTTP 200.

As rotinas que chamam serviços externos ficam desligadas por padrão. Habilite conscientemente `ENABLE_AI_SENTINEL_AUTORUN=true` e/ou `ENABLE_DAILY_DIGEST=true` somente depois de configurar e validar as integrações de IA e mensageria.

O arquivo `.railway/railway.ts` contém a configuração Infrastructure as Code atual, incluindo healthcheck e volume. O `railway.json` permanece apenas para compatibilidade com serviços legados; o formato foi descontinuado para novos serviços pelo Railway.

---

## 📜 Licença
Distribuído sob licença proprietária para AQUA-CORE AI. Todos os direitos reservados.
