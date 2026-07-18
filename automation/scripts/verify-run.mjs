import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';
import {readResolvedJson} from '../lib/content-store.mjs';

const args = parseArgs(process.argv.slice(2));
const runDir = resolve(requireArg(args, 'run'));
const plan = await readJson(resolve(args.plan ?? resolve(runDir, 'plan.json')));
const approval = await readJson(resolve(args.approval ?? resolve(runDir, 'approval.json')));
const after = await readResolvedJson(resolve(args['figma-after'] ?? resolve(runDir, 'figma-after.json')));
const results = await readJson(resolve(args.results ?? resolve(runDir, 'operation-results.json')));
const semantic = await readJson(resolve(args.semantic ?? resolve(runDir, 'semantic-verification.json'))).catch(() => null);
const byId = new Map((results.operations ?? []).map((entry) => [entry.id ?? entry.operationId, entry]));
for (const id of approval.operationIds) {
  const operation = plan.operations.find((candidate) => candidate.id === id);
  const result = byId.get(id);
  if (operation?.resultContract === 'compact-v1' && result) {
    await assertArtifact('operationResult', {...result, operationId: result.operationId ?? result.id});
  }
}
const operationResults = approval.operationIds.map((id) => {
  const operation = plan.operations.find((candidate) => candidate.id === id);
  const result = byId.get(id);
  const assertions = result?.assertions ?? [];
  const screenshotRequired = operation?.verification?.screenshot === true;
  const passed = result?.status === 'passed'
    && assertions.every((assertion) => assertion.passed === true)
    && (!screenshotRequired || Boolean(result.screenshot));
  return {
    operationId: id,
    passed,
    screenshotRequired,
    screenshot: result?.screenshot ?? null,
    assertions,
    error: result?.error ?? (result ? null : 'Missing operation result'),
  };
});
const globalAssertions = {
  brokenInstances: Number(after.inventory?.brokenInstances ?? -1),
  activePlaceholders: Number(after.inventory?.activePlaceholders ?? -1),
  coverageComplete: after.coverage?.complete === true,
  semanticRequired: approval.operationIds.some((id) => plan.operations.find((operation) => operation.id === id)?.verification?.semantic === true),
  semanticStatus: semantic?.status ?? null,
  semanticFailedAssertions: semantic?.assertions?.filter((assertion) => assertion.passed !== true).length ?? null,
};
const passed = operationResults.every((entry) => entry.passed)
  && globalAssertions.brokenInstances === 0
  && globalAssertions.activePlaceholders === 0
  && globalAssertions.coverageComplete
  && (!globalAssertions.semanticRequired || globalAssertions.semanticStatus === 'VERIFIED');
const verification = {
  schemaVersion: 1,
  runId: plan.runId,
  planHash: plan.planHash,
  verifiedAt: new Date().toISOString(),
  status: passed ? 'VERIFIED' : 'FAILED',
  operationResults,
  globalAssertions,
};
const output = resolve(args.output ?? resolve(runDir, 'verification.json'));
await assertArtifact('verification', verification);
await writeJson(output, verification);
process.stdout.write(`${JSON.stringify({output, status: verification.status})}\n`);
if (!passed) process.exitCode = 1;
