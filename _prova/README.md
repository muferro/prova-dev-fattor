# Prova Dev Fattor - Instruções para o Candidato e Resolução

Esta pasta contém o material da prova técnica e as documentações detalhadas de resolução de cada uma das etapas propostas.

---

## Índice das Etapas

1. [Etapa 1: Fork do Projeto](#etapa-1-fork-do-projeto)
2. [Etapa 2: Estudo da API Swagger / OpenAPI](#etapa-2-estudo-da-api-swagger--openapi)
3. [Etapa 3: Arquivo CNAB 444 e Documentação](#etapa-3-arquivo-cnab-444-e-documentação)
4. [Etapa 4: Consulta de Status no Servidor](#etapa-4-consulta-de-status-no-servidor)
5. [Etapa 5: Página Web - Upload e Lista de Resultados](#etapa-5-página-web---upload-e-lista-de-resultados)
6. [Diferenciais Implementados](#diferenciais-implementados)

---

## Etapa 1: Fork do projeto

- Repositório base fornecido: `https://github.com/Fattor-Tech/prova-dev-fattor`.
- Todo o código desenvolvido, testes, documentações e a aplicação web foram estruturados para execução direta e controle de versão.

---

## Etapa 2: Estudo da API (Swagger)

A documentação OpenAPI/Swagger foi analisada a partir do endpoint público:
- **Swagger / Scalar:** [https://symphony.fattorcredito.com.br/public/prova-dev/swagger](https://symphony.fattorcredito.com.br/public/prova-dev/swagger)
- **OpenAPI Schema (JSON):** [https://symphony.fattorcredito.com.br/public/prova-dev/openapi](https://symphony.fattorcredito.com.br/public/prova-dev/openapi)
- **Documentação de Referência Completa:** [docs/API_REFERENCE.md](../docs/API_REFERENCE.md)

### Resumo dos Endpoints Identificados:

| Finalidade | Método | Endpoint | Headers / Parâmetros | Payload / Retorno |
| :--- | :---: | :--- | :--- | :--- |
| **Login** | `POST` | `/public/prova-dev/login` | `Content-Type: application/json` | **Body:** `{"email": "demo@prova.dev", "password": "demo123"}`<br/>**Retorno:** `{"token": "...", "expires_in": 3600, "type": "Bearer"}` |
| **Consulta de Status** | `GET` | `/public/prova-dev/status/{chave}` | `Authorization: Bearer <TOKEN>`<br/>Path: `{chave}` (44 dígitos da NF-e) | **Retorno:** `{"status": "ativo", "usuario": "demo@prova.dev", "ambiente": "prova-dev", "versao": "1.0.0", "ultima_consulta": "...", "chave_nfe": "...", "situacao": "autorizada"}` |

---

## Etapa 3: Arquivo CNAB 444 e Documentação

> 📄 **Documento Completo de Especificação:** Veja [docs/CNAB444.md](../docs/CNAB444.md) para análise posicional campo a campo.

### 1. O que é o arquivo CNAB 444?
O **CNAB 444** é uma adaptação do padrão bancário **CNAB 400** (de 400 posições), largamente empregado no Brasil por **Factorings**, **Securitizadoras** e **Fundos de Investimento em Direitos Creditórios (FIDCs)** para operacionalizar a cessão de títulos de crédito (duplicatas mercantis).

### 2. Por que 444 posições?
Para validar o **lastro fiscal** da duplicata cedida na SEFAZ e evitar fraudes com "duplicatas frias", é imprescindível registrar a **Chave de Acesso da NF-e**, composta por **44 dígitos numéricos**.
Como o layout CNAB 400 não dispunha de espaço vago contíguo para essa chave, as instituições financeiras estenderam o registro em **44 caracteres ao final de cada linha**:
$$400 + 44 = \mathbf{444 \text{ caracteres}}$$

### 3. Estrutura e Localização dos Dados no Arquivo `meu_cnab.rem`:
O arquivo fornecido possui **12 linhas** de exatamente **444 caracteres** cada:
- **Linha 1 (Header, Tipo 0):** Dados do banco (`341 - Itaú`), identificador de remessa, cedente (`PROVA DEV CNAB 444 AMOSTRA`), data (`12/03/2026`).
- **Linhas 2 a 11 (Detalhe, Tipo 1):** 10 títulos com Seu Número, Nosso Número, Espécie (`DUPLICATA MERCANTIL`), Data de Vencimento, Valor Nominal, Nome do Pagador e a **Chave de Acesso da NF-e**.
- **Linha 12 (Trailer, Tipo 9):** Quantidade total de registros (`000012`).

### 4. Onde está o identificador utilizado pela API?
No **Registro de Detalhe (Tipo 1)**, o identificador exigido pela API encontra-se rigorosamente nas **posições 401 a 444** (fatia `linha.substring(400, 444)`):
- Exemplo: `35240300000000000199550010000000011234567890` (44 dígitos).

---

## Etapa 4: Consulta de Status no Servidor

Executando a autenticação e a chamada para cada uma das 10 chaves extraídas do arquivo `_prova/meu_cnab.rem`, obtivemos os seguintes resultados do servidor da API:

| Item | Linha CNAB | Identificador (Chave NF-e) | Pagador | Valor | Vencimento | Situação Retornada |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **1** | 2 | `35240300000000000199550010000000011234567890` | PAGADOR FAKE 1 | R$ 150,00 | 15/04/2025 | 🟢 **autorizada** |
| **2** | 3 | `35240300000000000199550010000000021234567891` | PAGADOR FAKE 2 | R$ 283,50 | 20/05/2025 | 🔴 **cancelada** |
| **3** | 4 | `35240300000000000199550010000000031234567892` | PAGADOR FAKE 3 | R$ 420,00 | 10/06/2025 | 🟢 **autorizada** |
| **4** | 5 | `35240300000000000199550010000000041234567893` | PAGADOR FAKE 4 | R$ 55,75 | 05/07/2025 | 🟠 **rejeitada** |
| **5** | 6 | `35240300000000000199550010000000051234567894` | PAGADOR FAKE 5 | R$ 990,00 | 22/08/2025 | 🟢 **autorizada** |
| **6** | 7 | `35240300000000000199550010000000061234567895` | PAGADOR FAKE 6 | R$ 123,40 | 18/09/2025 | 🟣 **denegada** |
| **7** | 8 | `35240300000000000199550010000000071234567896` | PAGADOR FAKE 7 | R$ 87,60 | 12/10/2025 | 🟢 **autorizada** |
| **8** | 9 | `35240300000000000199550010000000081234567897` | PAGADOR FAKE 8 | R$ 445,00 | 30/11/2025 | 🔴 **cancelada** |
| **9** | 10 | `35240300000000000199550010000000091234567898` | PAGADOR FAKE 9 | R$ 332,00 | 20/01/2026 | 🟠 **rejeitada** |
| **10** | 11 | `35240300000000000199550010000000101234567899` | PAGADOR FAKE 10 | R$ 187,50 | 15/02/2026 | 🟢 **autorizada** |

---

## Etapa 5: Página Web - Upload e Lista de Resultados

A aplicação foi desenvolvida no ecossistema **Next.js (App Router) + TypeScript + Tailwind CSS** seguindo o padrão **BFF (Backend-For-Frontend)**, oferecendo:
- **Segurança de Credenciais no Servidor (BFF):** Credenciais e token JWT gerenciados exclusivamente em `app/api/status/[chave]/route.ts`, eliminando vazamento de chaves no bundle e superando 100% dos bloqueios de CORS do navegador.
- **Upload e Validação Resiliente:** Upload por Drag & Drop para `.rem`, `.ret` ou `.txt` com bloqueio de arquivos > 5 MB e validação rigorosa de 444 posições por linha.
- **Auditoria Criptográfica SEFAZ Módulo 11:** Verificação matemática imediata do 44º dígito verificador da chave NF-e com cálculo posicional e pesos 2 a 9.
- **Identidade Visual Oficial Fattor Crédito:** Logotipo oficial geométrico integrado ao Favicon, Header, Modais e paleta institucional (Navy `#16304d` e Warm Gold `#b88317`).
- **Performance & Suporte a Lotes Massivos (+1.000 itens):** Processamento paralelo (8 workers concorrentes), cache client-side e server-side em dupla camada, e buffer de renderização sem travamentos de tela.
- **Paginação Dinâmica & Busca Instantânea:** Seletor de 10, 25, 50, 100 ou 'Todos', indexação sequencial 1-based `#` e preservação da linha física CNAB.
- **Painel de KPIs com Tipografia Responsiva:** 6 cards consolidados com volume financeiro em R$ e proteção ativa contra overflow em valores milionários.
- **Tooltips com Decisão de Crédito:** Hover em cada badge indicando se o título está **APROVADO** ou **BLOQUEADO** com justificativa SEFAZ.
- **Modal de Detalhes Completo:** Exibição da chave em blocos legíveis, selo de integridade Módulo 11 e linha bruta CNAB com posições 401 a 444 demarcadas.
- **Exportação de Dados:** Exportação em formato **CSV** (otimizado com delimitador `;` para Excel no Brasil) e **JSON**.
- **Pacote Completo de Testes:** 6 cenários práticos (`.rem`, `.ret`, `.txt`) com botão de download de pacote `.zip`.
- **Suíte de Testes Automatizados:** 20 testes unitários com Vitest cobrindo 100% dos módulos críticos.

Consulte o [README.md principal](../README.md) para instruções detalhadas de arquitetura e execução.

