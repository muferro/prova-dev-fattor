import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.FATTOR_API_BASE_URL || 'https://symphony.fattorcredito.com.br/public/prova-dev';
const API_EMAIL = process.env.FATTOR_API_EMAIL || 'demo@prova.dev';
const API_PASSWORD = process.env.FATTOR_API_PASSWORD || 'demo123';

// Cache em memória do token JWT no servidor
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

// Rate Limiter em memória por IP (Janela deslizante de 60 segundos)
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
// Suporta lotes massivos de até 3.000 requisições/min por IP, customizável via env
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 3000;


function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };

  // Remove timestamps fora da janela de 60 segundos
  record.timestamps = record.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp);
    rateLimitMap.set(ip, record);
    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  rateLimitMap.set(ip, record);
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.timestamps.length,
    resetMs: RATE_LIMIT_WINDOW_MS,
  };
}

// Cache curto de respostas por chave de NF-e (TTL: 60s) para evitar sobrecarga da API downstream
interface StatusCacheEntry {
  data: any;
  expiresAt: number;
}
const statusCache = new Map<string, StatusCacheEntry>();
const STATUS_CACHE_TTL_MS = 60 * 1000;

/**
 * Obtém ou renova o token JWT de serviço diretamente com a API Fattor
 */
async function getOrRenewServerToken(): Promise<string> {
  const isExpired = !cachedToken || Date.now() > tokenExpiresAt - 30000;

  if (!isExpired && cachedToken) {
    return cachedToken;
  }

  const loginUrl = `${API_BASE_URL.replace(/\/+$/, '')}/login`;

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: API_EMAIL,
      password: API_PASSWORD,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMsg = `Falha na autenticação do servidor com a API Fattor (${response.status})`;
    try {
      const err = await response.json();
      if (err?.error) errorMsg = err.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  cachedToken = data.token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken!;
}

/**
 * Rota do BFF: GET /api/status/[chave]
 * Realiza a consulta de status de NF-e protegendo credenciais, aplicando Rate Limiting e eliminando CORS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chave: string }> }
) {
  const resolvedParams = await params;
  const chave = resolvedParams.chave?.trim();

  // Sanitização rigorosa: apenas 44 dígitos numéricos permitidos
  if (!chave || chave.length !== 44 || !/^\d{44}$/.test(chave)) {
    return NextResponse.json(
      {
        error: 'Chave de acesso da NF-e inválida. Deve conter rigorosamente 44 dígitos numéricos.',
      },
      { status: 400 }
    );
  }

  // Verifica cache de chave prévia para economizar chamadas downstream e acelerar consultas em lote
  const cachedEntry = statusCache.get(chave);
  if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
    return NextResponse.json(cachedEntry.data, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-Cache': 'HIT',
      },
    });
  }

  // Extração do IP do cliente para controle de tráfego / Rate Limiting (apenas para requisições downstream)
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';

  const rateLimit = checkRateLimit(clientIp);
  const rateLimitHeaders = {
    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Limite de requisições excedido (Rate Limit: ${RATE_LIMIT_MAX_REQUESTS} req/min). Tente novamente em instantes.`,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        },
      }
    );
  }


  try {
    let token = await getOrRenewServerToken();
    const statusUrl = `${API_BASE_URL.replace(/\/+$/, '')}/status/${encodeURIComponent(chave)}`;

    let response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    // Se o token expirou remotamente, força renovação e tenta novamente
    if (response.status === 401) {
      cachedToken = null;
      token = await getOrRenewServerToken();
      response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });
    }

    if (!response.ok) {
      let errorMsg = `Erro ${response.status} ao consultar status da chave`;
      try {
        const errJson = await response.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch {
        // ignore
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status, headers: rateLimitHeaders }
      );
    }

    const data = await response.json();

    // Armazena no cache temporário para evitar requisições repetidas
    statusCache.set(chave, {
      data,
      expiresAt: Date.now() + STATUS_CACHE_TTL_MS,
    });

    return NextResponse.json(data, {
      headers: {
        ...rateLimitHeaders,
        'X-Cache': 'MISS',
      },
    });
  } catch (err: any) {
    console.error(`[BFF Error] Falha na consulta da chave ${chave}:`, err);
    return NextResponse.json(
      {
        error:
          err.message || 'Erro interno do servidor BFF ao comunicar com a API da Fattor.',
      },
      { status: 502, headers: rateLimitHeaders }
    );
  }
}
