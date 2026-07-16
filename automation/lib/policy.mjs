const FALLBACK_RISK = Object.freeze({
  UPDATE_DOCUMENTATION: 'low',
  ADD_PROP_ROW: 'low',
  ADD_EXAMPLE: 'low',
  REPLACE_ASSET: 'medium',
  UPDATE_COMPONENT_PROPERTY: 'medium',
  ADD_VARIANT: 'medium',
  UPDATE_LAYOUT: 'medium',
  BIND_TOKEN: 'medium',
  ADD_COMPONENT: 'high',
  REMOVE_COMPONENT: 'high',
  RENAME_COMPONENT: 'high',
  REPLACE_COMPONENT_ID: 'high',
  REMOVE_VARIANT: 'high',
  REMOVE_COMPONENT_PROPERTY: 'high',
});

export function classifyRisk(operationType, rules = {}) {
  if (rules.neverAutomate?.includes(operationType)) return 'forbidden';
  const risk = rules.operationRisk?.[operationType] ?? FALLBACK_RISK[operationType];
  if (!risk) throw new Error(`Unknown operation type: ${operationType}`);
  return risk;
}

export function matchException(identity, exceptions = []) {
  return exceptions.find((entry) => entry.scope === identity) ?? null;
}

export function isExecutableDifference(difference) {
  return !['conflicting', 'unverifiable', 'exception', 'match'].includes(difference.status);
}
