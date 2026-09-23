export function evaluateLot(requirement, lot) {
  const reasons = [];
  const tasks = [];
  const profile = lot.businessProfile || {};

  if (lot.cooperationStatus && lot.cooperationStatus !== 'active') reasons.push('Kooperation nicht aktiv');
  if (lot.productType !== requirement.productType) reasons.push('Erzeugnisart passt nicht');
  if (lot.grape !== requirement.grape) reasons.push('Rebsorte passt nicht');
  if (lot.origin !== requirement.origin) reasons.push('Herkunft passt nicht');
  if (lot.vintage !== requirement.vintage) reasons.push('Jahrgang passt nicht');
  if (!(lot.availableVolume > 0)) reasons.push('keine verfügbare Menge');

  if (Array.isArray(profile.grapes) && !profile.grapes.includes(requirement.grape)) {
    reasons.push('Rebsorte nicht im Betriebsprofil');
  }
  if (requirement.minLoadingVolume && profile.maxLoadingVolume && profile.maxLoadingVolume < requirement.minLoadingVolume) {
    reasons.push('Verladekapazität unter Mindestgröße');
  }

  if ((profile.completeness || 0) < 80) tasks.push('Betriebsprofil vervollständigen');
  if (!lot.analysisConfirmed) tasks.push('Analyse bestätigen');
  if (!lot.treatmentsConfirmed) tasks.push('Behandlungscode prüfen');
  if (!lot.currentVolumeConfirmed) tasks.push('verfügbare Menge bestätigen');

  return {
    eligible: reasons.length === 0,
    readyForAllocation: reasons.length === 0 && tasks.length === 0,
    logisticallyCapable: !requirement.minLoadingVolume || !profile.maxLoadingVolume || profile.maxLoadingVolume >= requirement.minLoadingVolume,
    reasons,
    tasks
  };
}

export function runProcurement(requirement, rows) {
  const allRows = rows || [];
  const inScopeRows = requirement.supplierGroup
    ? allRows.filter(row => Array.isArray(row.supplierGroups) && row.supplierGroups.includes(requirement.supplierGroup))
    : allRows;

  const evaluated = inScopeRows.map(row => ({ ...row, evaluation: evaluateLot(requirement, row) }));
  const eligible = evaluated.filter(x => x.evaluation.eligible);
  const matchingReady = eligible.filter(x => x.evaluation.readyForAllocation);
  const waiting = eligible.filter(x => !x.evaluation.readyForAllocation);
  const excluded = evaluated.filter(x => !x.evaluation.eligible);

  const rankedReady = [...matchingReady].sort((a, b) => {
    const aCapacity = a.businessProfile?.maxLoadingVolume || 0;
    const bCapacity = b.businessProfile?.maxLoadingVolume || 0;
    if (bCapacity !== aCapacity) return bCapacity - aCapacity;
    return b.availableVolume - a.availableVolume;
  });

  let remaining = requirement.targetVolume;
  const allocations = [];

  for (const lot of rankedReady) {
    if (remaining <= 0) break;
    const allocatedVolume = Math.min(lot.availableVolume, remaining);
    remaining -= allocatedVolume;

    let status = 'ready';
    let label = 'für Bedarf vorbereitet';
    let issue = '';

    if (lot.documentReady) {
      status = 'document';
      label = 'Dokument bereit';
    } else if (!lot.transportDataComplete) {
      status = 'transport';
      label = 'Transport offen';
      issue = 'Transportdaten vervollständigen';
    }

    allocations.push({ ...lot, allocatedVolume, status, label, issue });
  }

  const allocatedIds = new Set(allocations.map(x => x.lotId));
  const waitingRows = waiting.map(lot => ({
    ...lot,
    allocatedVolume: 0,
    status: 'waiting',
    label: 'Rückmeldung offen',
    issue: lot.evaluation.tasks.join(' · ')
  }));

  const excludedRows = excluded.map(lot => ({
    ...lot,
    allocatedVolume: 0,
    status: 'exception',
    label: 'nicht passend',
    issue: lot.evaluation.reasons.join(' · ')
  }));

  const unallocatedReady = rankedReady.filter(x => !allocatedIds.has(x.lotId)).map(lot => ({
    ...lot,
    allocatedVolume: 0,
    status: 'reserve',
    label: 'Reserve',
    issue: 'derzeit nicht benötigt'
  }));

  const allocatedVolume = requirement.targetVolume - remaining;
  const coverage = requirement.targetVolume > 0 ? allocatedVolume / requirement.targetVolume : 0;

  const tasks = [
    ...waiting.flatMap(lot => lot.evaluation.tasks.map(task => ({
      owner: 'grower',
      growerId: lot.growerId,
      growerName: lot.growerName,
      lotId: lot.lotId,
      task
    }))),
    ...allocations.filter(x => !x.transportDataComplete).map(x => ({
      owner: 'grower',
      growerId: x.growerId,
      growerName: x.growerName,
      lotId: x.lotId,
      task: 'Transportdaten ergänzen'
    }))
  ];

  const exceptions = [
    ...waiting.map(lot => ({
      growerId: lot.growerId,
      growerName: lot.growerName,
      lotId: lot.lotId,
      type: 'missing-data',
      detail: lot.evaluation.tasks.join(' · ')
    }))
  ];

  const transports = allocations.map((x, index) => ({
    transportId: 'T-' + requirement.id + '-' + String(index + 1).padStart(3,'0'),
    growerId: x.growerId,
    growerName: x.growerName,
    lotId: x.lotId,
    volume: x.allocatedVolume,
    state: x.transportDataComplete ? (x.documentReady ? 'document-ready' : 'prepared') : 'waiting-for-loading-data'
  }));

  const uniqueGrowers = list => new Set(list.map(x => x.growerId)).size;
  const scopeGrowers = uniqueGrowers(inScopeRows);
  const partnerGrowers = uniqueGrowers(allRows);
  const matchingGrowers = uniqueGrowers(eligible);
  const logisticallyCapableGrowers = uniqueGrowers(
    evaluated.filter(x => x.evaluation.logisticallyCapable && x.grape === requirement.grape && x.origin === requirement.origin && x.vintage === requirement.vintage)
  );
  const autoAllocatableGrowers = uniqueGrowers(matchingReady);

  return {
    requirement,
    evaluated,
    eligible,
    matchingReady,
    waiting,
    excluded,
    allocations,
    allocationRows: [...allocations, ...waitingRows, ...unallocatedReady, ...excludedRows],
    allocatedVolume,
    remainingVolume: remaining,
    coverage,
    tasks,
    exceptions,
    transports,
    stats: {
      growersTotal: scopeGrowers,
      partnerGrowersTotal: partnerGrowers,
      totalLots: inScopeRows.length,
      eligibleLots: eligible.length,
      readyLots: matchingReady.length,
      matchingGrowers,
      logisticallyCapableGrowers,
      autoAllocatableGrowers,
      growersAllocated: uniqueGrowers(allocations),
      waitingGrowers: uniqueGrowers(waiting),
      exceptionCount: exceptions.length,
      transports: transports.length,
      documentsReady: transports.filter(x => x.state === 'document-ready').length
    }
  };
}

export function formatLiters(value) {
  return new Intl.NumberFormat('de-DE').format(Math.round(value || 0)) + ' l';
}
