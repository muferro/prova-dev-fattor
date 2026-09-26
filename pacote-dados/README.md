# 📦 Pacote de Dados de Teste CNAB 444 (.rem, .ret, .txt)

**Fattor Crédito — Validador de Remessa e Retorno Bancário com Lastro NF-e**

Este diretório contém um conjunto completo de arquivos de dados em diferentes extensões (`.rem`, `.ret`, `.txt`) projetados para submissão, homologação e testes de estresse das regras de negócio do sistema.

---

## 📂 Arquivos Disponíveis no Pacote

| Arquivo | Extensão | Linhas | Finalidade do Cenário de Teste | Decisão Esperada |
|---|:---:|:---:|---|---|
| **`01_remessa_oficial.rem`** | `.rem` | 12 (10 títulos) | Arquivo oficial da prova com todos os 10 títulos detalhe | 🟢 5 Aprovados<br/>🔴 2 Cancelados<br/>🟠 2 Rejeitados<br/>🟣 1 Denegado |
| **`02_retorno_aprovados.ret`** | `.ret` | 7 (5 títulos) | Lote de títulos com situação fiscal 100% regular na SEFAZ (Chaves 1, 3, 5, 7 e 10) | 🟢 **100% Crédito APROVADO**<br/>(R$ 1.835,10 aptos para antecipação) |
| **`03_remessa_risco_bloqueados.txt`** | `.txt` | 7 (5 títulos) | Lote de títulos de alto risco com cancelamentos, rejeições e denegações fiscais (Chaves 2, 4, 6, 8 e 9) | ⛔ **100% Crédito BLOQUEADO**<br/>(Zero risco de prejuízo financeiro) |
| **`04_retorno_modulo11_integro.rem`** | `.rem` | 5 (3 títulos) | Lote onde o 44º dígito de cada NF-e possui cálculo criptográfico Módulo 11 exato | 🛡️ **Selo Verde Módulo 11**<br/>(Dígito Verificador Íntegro na Auditoria) |
| **`05_cenario_invalido_cnab400.txt`** | `.txt` | 12 | Linhas legadas de 400 caracteres (CNAB 400 sem a extensão de 44 posições da NF-e) | ⚠️ **Erro Estrutural Detectado**<br/>(Validador bloqueia lote inválido) |
| **`06_lote_massivo_1200_titulos.rem`** | `.rem` | 1.202 (1.200 títulos) | Lote massivo para teste de estresse de volumetria, paginação dinâmica, busca instantânea e paralelismo | ⚡ **Alta Performance (+1.000 itens)**<br/>Processamento concorrente e visualização fluida com paginação configurável |

---

## 🎯 Por que utilizar `.rem`, `.ret` e `.txt`?

1. **`.rem` (Arquivo de Remessa):**  
   Gerado pelo cedente/empresa e enviado ao banco ou FIDC para solicitar a cobrança ou a cessão dos créditos. No padrão CNAB 444, inclui as 44 posições da chave de acesso da NF-e (colunas 401 a 444).
2. **`.ret` (Arquivo de Retorno):**  
   Gerado pela instituição financeira ou FIDC para devolver a confirmação da liquidação, rejeição ou antecipação dos títulos para o sistema de gestão (ERP) do cliente.
3. **`.txt` (Arquivo Texto Puro):**  
   Formato genérico amplamente utilizado em integrações legadas de EDI (Electronic Data Interchange) e pipelines de conciliação contábil.

---

## 🧪 Como Testar no Navegador

1. Abra a aplicação em **[http://localhost:3000](http://localhost:3000)**.
2. Arraste e solte qualquer um dos arquivos acima na área de **Upload (Drag & Drop)**, ou clique em **"Escolher do Computador"** e selecione o arquivo desejado.
3. Observe:
   - A extração instantânea de linhas, valores e sacados.
   - A barra de progresso da consulta progressiva via BFF Next.js.
   - Os cards de KPI totalizadores atualizados em tempo real.
   - O mouse hover em cada status na tabela exibindo a decisão de crédito (**APROVADO** ou **BLOQUEADO**).
   - O modal de detalhes ao clicar na lupa (com auditoria Módulo 11 e linha bruta de 444 caracteres).

---

*Arquivos gerados com encoding ISO-8859-1 (Latin-1) e quebras de linha CRLF (\r\n), em estrita conformidade com o padrão FEBRABAN / FIDC.*
