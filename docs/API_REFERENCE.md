# Referência da API Prova Dev Fattor

Documentação técnica dos endpoints públicos disponibilizados para a realização da prova técnica.

- **URL Base:** `https://symphony.fattorcredito.com.br/public/prova-dev`
- **Swagger / Scalar UI:** [https://symphony.fattorcredito.com.br/public/prova-dev/swagger](https://symphony.fattorcredito.com.br/public/prova-dev/swagger)
- **OpenAPI 3.0.3 Spec:** [https://symphony.fattorcredito.com.br/public/prova-dev/openapi](https://symphony.fattorcredito.com.br/public/prova-dev/openapi)
- **CORS:** Ativado para todas as origens (`Access-Control-Allow-Origin: *`)

---

## 1. Autenticação: POST `/login`

Autentica com email e senha e retorna um token JWT (JSON Web Token) para autorizar chamadas às demais rotas.

### Requisição
- **Método:** `POST`
- **Caminho:** `/login`
- **URL Completa:** `https://symphony.fattorcredito.com.br/public/prova-dev/login`
- **Headers:**
  - `Content-Type: application/json`

#### Corpo da Requisição (Body JSON):
```json
{
  "email": "demo@prova.dev",
  "password": "demo123"
}
```

### Resposta de Sucesso: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "type": "Bearer"
}
```

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `token` | `string` | Token JWT assinado para incluir no header `Authorization` |
| `expires_in` | `integer` | Tempo de validade do token em segundos (3600s = 1 hora) |
| `type` | `string` | Tipo de autorização HTTP (`Bearer`) |

### Respostas de Erro:
- `400 Bad Request`: Dados inválidos ou credenciais incorretas (`{"error": "string"}`).

---

## 2. Consulta de Status: GET `/status/{chave}`

Consulta o status do ambiente e a situação fiscal do item correspondente à chave fornecida.

### Requisição
- **Método:** `GET`
- **Caminho:** `/status/{chave}`
- **Parâmetros de Path:**
  - `chave` *(obrigatório, string)*: Chave de Acesso da NF-e (44 dígitos numéricos extraídos das posições 401 a 444 do CNAB 444).
- **Headers:**
  - `Authorization: Bearer <SEU_TOKEN_JWT>`
  - `Accept: application/json`

### Exemplo de Chamada cURL:
```bash
curl -X GET "https://symphony.fattorcredito.com.br/public/prova-dev/status/35240300000000000199550010000000011234567890" \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

### Resposta de Sucesso: `200 OK`
```json
{
  "status": "ativo",
  "usuario": "demo@prova.dev",
  "ambiente": "prova-dev",
  "versao": "1.0.0",
  "ultima_consulta": "2026-09-23T17:52:21.267Z",
  "chave_nfe": "35240300000000000199550010000000011234567890",
  "situacao": "autorizada"
}
```

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `status` | `string` | Status operacional do ambiente (`ativo`) |
| `usuario` | `string` | Email do usuário autenticado no token |
| `ambiente` | `string` | Nome do ambiente (`prova-dev`) |
| `versao` | `string` | Versão da API (`1.0.0`) |
| `ultima_consulta` | `string (ISO 8601)` | Timestamp da execução da consulta |
| `chave_nfe` | `string` | Chave de 44 dígitos consultada |
| `situacao` | `string (enum)` | Situação fiscal do documento no dicionário da prova |

#### Valores Possíveis para `situacao`:
- `autorizada`: Nota fiscal válida e aprovada pela SEFAZ (lastro regular).
- `cancelada`: Nota fiscal cancelada pelo emitente (título sem lastro ativo).
- `rejeitada`: Nota fiscal que apresentou inconsistência cadastral/tributária e foi rejeitada pela SEFAZ.
- `denegada`: Irregularidade fiscal do emitente ou destinatário na SEFAZ (uso vedado).
- `nao_encontrada`: A chave informada não consta na base de dados de testes da prova.

### Respostas de Erro:
- `401 Unauthorized`: Token ausente, inválido ou expirado (`{"error": "Token ausente ou inválido"}`).
