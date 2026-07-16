import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyRisk, isExecutableDifference, matchException} from '../lib/policy.mjs';
import {assertTransition, transitionRun} from '../lib/state-machine.mjs';

test('risk policy classifies known operations and rejects unknown operations', () => {
  assert.equal(classifyRisk('UPDATE_DOCUMENTATION'), 'low');
  assert.equal(classifyRisk('REPLACE_ASSET'), 'medium');
  assert.equal(classifyRisk('REMOVE_COMPONENT'), 'high');
  assert.throws(() => classifyRisk('IMPROVISE_FIX'), /Unknown operation type/);
});

test('never-automated operations are forbidden', () => {
  assert.equal(classifyRisk('PUBLISH_LIBRARY', {neverAutomate: ['PUBLISH_LIBRARY']}), 'forbidden');
});

test('exceptions and blocked differences cannot become executable operations', () => {
  const exception = {id: 'legacy', scope: 'component:CircularProgress'};
  assert.equal(matchException('component:CircularProgress', [exception]), exception);
  assert.equal(isExecutableDifference({status: 'exception'}), false);
  assert.equal(isExecutableDifference({status: 'conflicting'}), false);
  assert.equal(isExecutableDifference({status: 'missing'}), true);
});

test('run state machine cannot skip approval or verification', () => {
  assert.throws(() => assertTransition('COLLECTING', 'APPLYING'), /Invalid run transition/);
  assert.throws(() => assertTransition('AWAITING_APPROVAL', 'APPLYING'), /Invalid run transition/);
  const approved = transitionRun({status: 'AWAITING_APPROVAL', history: []}, 'APPROVED');
  assert.equal(approved.status, 'APPROVED');
  assert.throws(() => assertTransition('APPLYING', 'VERIFIED'), /Invalid run transition/);
});
