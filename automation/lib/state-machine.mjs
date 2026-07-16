export const RUN_TRANSITIONS = Object.freeze({
  COLLECTING: ['PLANNED', 'FAILED'],
  PLANNED: ['AWAITING_APPROVAL', 'FAILED'],
  AWAITING_APPROVAL: ['APPROVED', 'FAILED'],
  APPROVED: ['APPLYING', 'AWAITING_APPROVAL', 'FAILED'],
  APPLYING: ['VERIFYING', 'FAILED'],
  VERIFYING: ['VERIFIED', 'FAILED'],
  VERIFIED: [],
  FAILED: [],
});

export function assertTransition(from, to) {
  if (!RUN_TRANSITIONS[from]?.includes(to)) {
    throw new Error(`Invalid run transition: ${from} -> ${to}`);
  }
}

export function transitionRun(run, to, details = {}) {
  assertTransition(run.status, to);
  return {
    ...run,
    status: to,
    updatedAt: new Date().toISOString(),
    history: [
      ...(run.history ?? []),
      {from: run.status, to, at: new Date().toISOString(), ...details},
    ],
  };
}
