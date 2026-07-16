import test from 'node:test';
import assert from 'node:assert/strict';
import {hashObject} from '../lib/hashing.mjs';
import {validateApproval} from '../scripts/validate-approval.mjs';

function fixture() {
  const figmaBefore = {
    schemaVersion: 1,
    fileKey: 'file',
    generatedAt: '2026-07-16T00:00:00.000Z',
    coverage: {complete: true, batches: []},
    inventory: {},
    components: [],
    pages: [],
    variables: [],
    styles: [],
  };
  const plan = {
    schemaVersion: 1,
    runId: 'run-1',
    sourceVersion: '0.1.6',
    figmaFileKey: 'file',
    figmaBeforeHash: hashObject(figmaBefore),
    generatedAt: '2026-07-16T00:00:00.000Z',
    operations: [{id: 'op-low', risk: 'low'}, {id: 'op-high', risk: 'high'}],
  };
  plan.planHash = hashObject(plan, ['planHash']);
  const approval = {
    schemaVersion: 1,
    runId: plan.runId,
    planHash: plan.planHash,
    figmaBeforeHash: plan.figmaBeforeHash,
    sourceVersion: plan.sourceVersion,
    approvedBy: 'tester',
    approvedAt: '2026-07-16T00:00:00.000Z',
    expiresAt: '2026-07-17T00:00:00.000Z',
    operationIds: ['op-low', 'op-high'],
    acknowledgedHighRiskIds: ['op-high'],
  };
  return {figmaBefore, plan, approval};
}

test('valid approval returns only approved operations', () => {
  const {figmaBefore, plan, approval} = fixture();
  const result = validateApproval({plan, approval, figmaBefore, now: new Date('2026-07-16T01:00:00.000Z')});
  assert.equal(result.valid, true);
  assert.deepEqual(result.approvedOperations.map((operation) => operation.id), ['op-low', 'op-high']);
});

test('changed plan, Figma state, expiry, and missing high-risk acknowledgement fail closed', () => {
  const cases = [
    ({plan}) => { plan.sourceVersion = '0.1.7'; },
    ({figmaBefore}) => { figmaBefore.components.push({name: 'Button', nodeId: '1:1'}); },
    ({approval}) => { approval.expiresAt = '2026-07-15T00:00:00.000Z'; },
    ({approval}) => { approval.acknowledgedHighRiskIds = []; },
    (data) => { data.currentSourceVersion = '0.1.7'; },
  ];
  for (const mutate of cases) {
    const data = fixture();
    mutate(data);
    const result = validateApproval({...data, now: new Date('2026-07-16T01:00:00.000Z')});
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  }
});
