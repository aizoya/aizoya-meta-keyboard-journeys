import { setMetaBudgetRpcForTests } from '../meta-budget.mjs';
setMetaBudgetRpcForTests(async name => {
  if (name.endsWith('_reserve_meta_call')) return { allowed: true, remaining_usd: 20, reserved_usd: 0.05 };
  if (name.endsWith('_settle_meta_call')) return { settled: true, remaining_usd: 20 };
  if (name.endsWith('_meta_budget_status')) return { configured: true, enabled: true, cap_usd: 20, spent_usd: 0, reserved_usd: 0, remaining_usd: 20 };
  throw Error('unexpected_budget_rpc');
});
