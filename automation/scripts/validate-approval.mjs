import {resolve} from 'node:path';
import {hashObject, snapshotHash} from '../lib/hashing.mjs';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';
import {readResolvedJson} from '../lib/content-store.mjs';

export function validateApproval({plan, approval, figmaBefore, currentSourceVersion, now = new Date()}) {
  const errors = [];
  const calculatedPlanHash = hashObject(plan, ['planHash']);
  if (plan.planHash !== calculatedPlanHash) errors.push('planHash does not match canonical plan content');
  if (approval.planHash !== plan.planHash) errors.push('approval planHash does not match plan');
  if (approval.runId !== plan.runId) errors.push('approval runId does not match plan');
  if (approval.sourceVersion !== plan.sourceVersion) errors.push('approval sourceVersion does not match plan');
  if (currentSourceVersion && currentSourceVersion !== plan.sourceVersion) errors.push('installed Astryx version changed after planning');
  if (approval.figmaBeforeHash !== plan.figmaBeforeHash) errors.push('approval figmaBeforeHash does not match plan');
  if (figmaBefore && snapshotHash(figmaBefore) !== plan.figmaBeforeHash) errors.push('current Figma before-snapshot hash changed after planning');
  if (!Number.isFinite(Date.parse(approval.expiresAt)) || now >= new Date(approval.expiresAt)) errors.push('approval is expired or invalid');
  const known = new Map(plan.operations.map((operation) => [operation.id, operation]));
  for (const id of approval.operationIds ?? []) {
    if (!known.has(id)) errors.push(`approval contains unknown operation: ${id}`);
  }
  for (const operation of plan.operations) {
    if (approval.operationIds?.includes(operation.id) && operation.risk === 'high' && !approval.acknowledgedHighRiskIds?.includes(operation.id)) {
      errors.push(`high-risk operation lacks explicit acknowledgement: ${operation.id}`);
    }
  }
  if (plan.bulkRisk?.required && approval.acknowledgedBulkPlanHash !== plan.planHash) errors.push('bulk plan lacks exact plan-hash acknowledgement');
  if (!approval.operationIds?.length) errors.push('approval contains no operations');
  return {
    valid: errors.length === 0,
    errors,
    approvedOperations: errors.length ? [] : plan.operations.filter((operation) => approval.operationIds.includes(operation.id)),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = resolve(requireArg(args, 'run'));
  const plan = await readJson(resolve(args.plan ?? resolve(runDir, 'plan.json')));
  const approval = await readJson(resolve(args.approval ?? resolve(runDir, 'approval.json')));
  const figmaBefore = args['figma-before'] ? await readResolvedJson(resolve(args['figma-before'])) : null;
  await assertArtifact('plan', plan);
  await assertArtifact('approval', approval);
  if (figmaBefore) await assertArtifact('figma', figmaBefore);
  const packageJson = await readJson(resolve(import.meta.dirname, '../../package.json'));
  const currentSourceVersion = packageJson.dependencies?.['@astryxdesign/core'];
  const result = validateApproval({plan, approval, figmaBefore, currentSourceVersion});
  if (args.output) await writeJson(resolve(args.output), result);
  process.stdout.write(`${JSON.stringify({valid: result.valid, errors: result.errors, approvedOperations: result.approvedOperations.length})}\n`);
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'))) {
  await main();
}
