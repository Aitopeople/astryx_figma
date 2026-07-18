function cartesianCount(axes = {}) {
  return Object.values(axes).reduce((count, values) => count * values.length, 1);
}

function variantKey(values, axes) {
  return Object.keys(axes).map((axis) => `${axis}=${values?.[axis]}`).join(',');
}

function assertion(code, target, passed, evidence = null) {
  return {code, target, passed, evidence};
}

export function verifyComponentContract(component, contract, pages = []) {
  const results = [];
  const variants = component.variantRecords ?? component.variants ?? [];
  const expectedCount = contract.expectedVariantCount ?? cartesianCount(contract.variantAxes);
  results.push(assertion('variant.count', component.name, variants.length === expectedCount, {expected: expectedCount, actual: variants.length}));

  if (contract.variantAxes) {
    const expected = new Set(['']);
    for (const [axis, values] of Object.entries(contract.variantAxes)) {
      const prior = [...expected]; expected.clear();
      for (const prefix of prior) for (const value of values) expected.add(`${prefix}${prefix ? ',' : ''}${axis}=${value}`);
    }
    const actual = new Set(variants.map((variant) => variantKey(variant.values ?? variant.variantProperties, contract.variantAxes)));
    const missing = [...expected].filter((key) => !actual.has(key));
    const extra = [...actual].filter((key) => !expected.has(key));
    results.push(assertion('variant.cartesianCoverage', component.name, missing.length === 0 && extra.length === 0, {missing, extra}));
  }

  const definitions = component.componentPropertyDefinitions ?? component.propertyDefinitions ?? {};
  const definitionNames = new Set(Array.isArray(definitions) ? definitions.map((entry) => entry.name) : Object.keys(definitions).map((key) => key.split('#')[0]));
  for (const property of contract.requiredProperties ?? []) {
    results.push(assertion('property.definition', `${component.name}.${property}`, definitionNames.has(property), {available: [...definitionNames]}));
  }

  const references = component.propertyReferences ?? [];
  for (const property of contract.requiredPropertyReferences ?? []) {
    const coveredVariants = new Set(references.filter((entry) => entry.property === property || entry.property?.split('#')[0] === property).map((entry) => entry.variantId));
    const missing = variants.map((entry) => entry.nodeId ?? entry.id).filter((id) => id && !coveredVariants.has(id));
    results.push(assertion('property.referenceCoverage', `${component.name}.${property}`, variants.length > 0 && references.length > 0 && missing.length === 0, {missingVariantIds: missing, referenceCount: references.length}));
  }

  for (const descendant of contract.requiredDescendants ?? []) {
    const missing = variants.filter((variant) => !(variant.descendantNames ?? []).includes(descendant)).map((variant) => variant.nodeId ?? variant.id);
    results.push(assertion('structure.requiredDescendant', `${component.name}/${descendant}`, missing.length === 0, {missingVariantIds: missing}));
  }

  for (const pattern of contract.forbiddenInstanceNamePatterns ?? []) {
    const regex = new RegExp(pattern, 'i');
    const matches = variants.flatMap((variant) => (variant.instanceMainComponentNames ?? []).filter((name) => regex.test(name)).map((name) => ({variantId: variant.nodeId ?? variant.id, name})));
    results.push(assertion('structure.forbiddenInstance', `${component.name}/${pattern}`, matches.length === 0, {matches}));
  }

  for (const variant of variants) {
    const size = (variant.values ?? variant.variantProperties)?.size;
    const expected = contract.geometryBySize?.[size];
    if (expected) results.push(assertion('geometry.sizeContract', variant.nodeId ?? variant.id, Object.entries(expected).every(([key, value]) => variant.measurements?.[key] === value), {size, expected, actual: variant.measurements}));
    if (contract.sharedGeometry) results.push(assertion('geometry.sharedContract', variant.nodeId ?? variant.id, Object.entries(contract.sharedGeometry).every(([key, value]) => variant.measurements?.[key] === value), {expected: contract.sharedGeometry, actual: variant.measurements}));
  }

  const officialExamples = pages.flatMap((page) => page.examples ?? []).filter((example) => example.component === component.name || example.officialComponent === component.name);
  for (const example of officialExamples) {
    results.push(assertion('example.lineage', example.nodeId ?? example.name, example.detached !== true && Boolean(example.mainComponentId || example.compositionRootIds?.length), {detached: example.detached, mainComponentId: example.mainComponentId}));
  }

  const binding = component.bindingAudit;
  if (binding) results.push(assertion('token.binding', component.name, ['unboundPaints', 'unboundRadius', 'unboundSpacing'].every((key) => Number(binding[key] ?? 0) === 0), binding));
  return results;
}

export function verifyContracts(figma, contractConfig, scope = []) {
  const selected = scope.length ? new Set(scope) : null;
  const assertions = [];
  for (const [name, contract] of Object.entries(contractConfig.contracts ?? {})) {
    if (selected && !selected.has(name)) continue;
    const component = figma.components.find((entry) => (entry.officialName ?? entry.name) === name);
    if (!component) assertions.push(assertion('component.exists', name, false, null));
    else assertions.push(...verifyComponentContract(component, contract, figma.pages));
  }
  return {status: assertions.every((entry) => entry.passed) ? 'VERIFIED' : 'FAILED', assertions};
}
