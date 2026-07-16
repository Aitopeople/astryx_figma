import {resolve} from 'node:path';
import {hashObject} from '../lib/hashing.mjs';
import {parseArgs, readJson, readJsonYaml, requireArg, writeJson} from '../lib/io.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';

const args = parseArgs(process.argv.slice(2));
const runDir = resolve(requireArg(args, 'run'));
const plan = await readJson(resolve(args.plan ?? resolve(runDir, 'plan.json')));
const config = await readJsonYaml(resolve(args.config ?? resolve(import.meta.dirname, '../config/library.yaml')));
const calculatedHash = hashObject(plan, ['planHash']);
if (calculatedHash !== plan.planHash) throw new Error('Plan hash is invalid; regenerate and review the plan');

const requested = String(args.operations ?? 'all');
const operationIds = requested === 'all'
  ? plan.operations.map((operation) => operation.id)
  : requested.split(',').map((value) => value.trim()).filter(Boolean);
const known = new Set(plan.operations.map((operation) => operation.id));
const unknown = operationIds.filter((id) => !known.has(id));
if (unknown.length) throw new Error(`Unknown operation IDs: ${unknown.join(', ')}`);

const acknowledgedHighRiskIds = String(args['ack-high-risk'] ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const selectedHighRisk = plan.operations
  .filter((operation) => operationIds.includes(operation.id) && operation.risk === 'high')
  .map((operation) => operation.id);
const missingAcknowledgement = selectedHighRisk.filter((id) => !acknowledgedHighRiskIds.includes(id));
if (missingAcknowledgement.length) {
  throw new Error(`High-risk operations require explicit --ack-high-risk IDs: ${missingAcknowledgement.join(', ')}`);
}
if (plan.bulkRisk?.required && args['ack-bulk'] !== plan.planHash) {
  throw new Error(`Bulk plan requires --ack-bulk ${plan.planHash}`);
}

const approvedAt = new Date();
const expiresInHours = Number(args.hours ?? config.approval.expiresInHours);
const approval = {
  schemaVersion: 1,
  runId: plan.runId,
  planHash: plan.planHash,
  figmaBeforeHash: plan.figmaBeforeHash,
  sourceVersion: plan.sourceVersion,
  approvedBy: String(requireArg(args, 'approver')),
  approvedAt: approvedAt.toISOString(),
  expiresAt: new Date(approvedAt.getTime() + expiresInHours * 60 * 60 * 1000).toISOString(),
  operationIds: [...operationIds].sort(),
  acknowledgedHighRiskIds: [...acknowledgedHighRiskIds].sort(),
  acknowledgedBulkPlanHash: plan.bulkRisk?.required ? String(args['ack-bulk']) : null,
};

const output = resolve(args.output ?? resolve(runDir, 'approval.json'));
await assertArtifact('approval', approval);
await writeJson(output, approval);
process.stdout.write(`${JSON.stringify({output, planHash: plan.planHash, approvedOperations: operationIds.length})}\n`);
