import { randomUUID } from 'node:crypto';

const RESERVED_MICRO_USD = 50_000; // $0.05 per request, before provider dispatch.
const MAX_REQUEST_BYTES = 10_000;
let testRpc = null;

export function setMetaBudgetRpcForTests(handler) {
  if (process.env.NODE_ENV !== 'test' || typeof handler !== 'function') throw Error('test_budget_adapter_unavailable');
  testRpc = handler;
}

function config() {
  const url = process.env.META_BUDGET_SUPABASE_URL;
  const key = process.env.META_BUDGET_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    return { url: parsed.origin, key };
  } catch { return null; }
}

async function rpc(name, body) {
  if (testRpc) return testRpc(name, body);
  const c = config();
  if (!c) throw Error('meta_budget_unavailable');
  let response;
  try {
    response = await fetch(`${c.url}/rest/v1/rpc/${name}`, {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json', apikey: c.key, Authorization: `Bearer ${c.key}` },
      body: JSON.stringify(body)
    });
  } catch { throw Error('meta_budget_unavailable'); }
  if (!response.ok) throw Error('meta_budget_unavailable');
  try { return await response.json(); } catch { throw Error('meta_budget_unavailable'); }
}

export function budgetConfigured() { return Boolean(config()); }

export function requestFitsBudgetEnvelope(payload) {
  return Buffer.byteLength(JSON.stringify(payload), 'utf8') <= MAX_REQUEST_BYTES;
}

export async function reserveMetaCall(requestId = randomUUID()) {
  const result = await rpc('keyboard_journeys_reserve_meta_call', { p_request_id: requestId });
  if (result?.allowed !== true) {
    if (result?.reason === 'budget_exhausted' || result?.reason === 'budget_disabled') throw Error('meta_budget_exhausted');
    throw Error('meta_budget_unavailable');
  }
  return requestId;
}

export async function settleMetaCall(requestId, usage) {
  const prompt = usage?.prompt_tokens;
  const completion = usage?.completion_tokens;
  if (!Number.isSafeInteger(prompt) || prompt < 0 || !Number.isSafeInteger(completion) || completion < 0) return false;
  // Conservative per-token rates in micro-USD: $2/M input and $5/M output.
  // These round above the documented Standard Muse Spark rates.
  const actualMicroUsd = prompt * 2 + completion * 5;
  if (!Number.isSafeInteger(actualMicroUsd) || actualMicroUsd > RESERVED_MICRO_USD) return false;
  await rpc('keyboard_journeys_settle_meta_call', { p_request_id: requestId, p_actual_micro_usd: actualMicroUsd });
  return true;
}

export async function metaBudgetStatus() {
  if (!budgetConfigured()) return { configured: false, enabled: false };
  try {
    const status = await rpc('keyboard_journeys_meta_budget_status', {});
    if (!status || status.configured !== true || typeof status.enabled !== 'boolean') throw Error();
    const finiteUsd = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
    return {
      configured: true,
      enabled: status.enabled,
      cap_usd: finiteUsd(status.cap_usd),
      spent_usd: finiteUsd(status.spent_usd),
      reserved_usd: finiteUsd(status.reserved_usd),
      remaining_usd: finiteUsd(status.remaining_usd)
    };
  } catch { return { configured: true, enabled: false, available: false }; }
}

export { MAX_REQUEST_BYTES, RESERVED_MICRO_USD };
