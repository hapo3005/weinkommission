export function evaluateLot(requirement, lot) {
  const reasons = [];
  const tasks = [];

  if (lot.productType !== requirement.productType) reasons.push('Erzeugnisart passt nicht');
  if (lot.grape !== requirement.grape) reasons.push('Rebsorte passt nicht');
  if (lot.origin !== requirement.origin) reasons.push('Herkunft passt nicht');
  if (lot.vintage !== requirement.vintage) reasons.push('Jahrgang passt nicht');
  if (!lot.analysisConfirmed) tasks.push('Analyse bestätigen');
  if (!lot.treatmentsConfirmed) tasks.push('Behandlungscode prüfen');
  if (!lot.currentVolumeConfirmed) tasks.push('verfügbare Menge bestätigen');
  if (!(lot.availableVolume > 0)) reasons.push('keine verfügbare Menge');

  return {
    eligible: reasons.length === 0,
    readyForAllocation: reasons.length === 0 && tasks.length === 0,
    reasons,
    tasks
  };
}

export function runProcurement(requirement, growers) {
  const evaluated = growers.map(lot => ({ ...lot, evaluation: evaluateLot(requirement, lot) }));

  const eligible = evaluated.filter(x => x.evaluation.eligible);
  const matchingReady = eligible.filter(x => x.evaluation.readyForAllocation);
  const waiting = eligible.filter(x => !x.evaluation.readyForAllocation);
  const excluded = evaluated.filter(x => !x.evaluation.eligible);

  let remaining = requirement.targetVolume;
  const allocations = [];

  for (const lot of matchingReady) {
    if (remaining <= 0) break;
    const allocatedVolume = Math.min(lot.availableVolume, remaining);
    remaining -= allocatedVolume;

    let status = 'ready';
    let label = 'bereit';
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
    label: 'wartet auf Winzer',
    issue: lot.evaluation.tasks.join(' · ')
  }));

  const excludedRows = excluded.slice(0, 12).map(lot => ({
    ...lot,
    allocatedVolume: 0,
    status: 'exception',
    label: 'nicht passend',
    issue: lot.evaluation.reasons.join(' · ')
  }));

  const unallocatedReady = matchingReady.filter(x => !allocatedIds.has(x.lotId)).map(lot => ({
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
    ...excluded.map(lot => ({
      growerName: lot.growerName,
      lotId: lot.lotId,
      type: 'mismatch',
      detail: lot.evaluation.reasons.join(' · ')
    })),
    ...waiting.map(lot => ({
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
      growersTotal: growers.length,
      eligibleLots: eligible.length,
      readyLots: matchingReady.length,
      growersAllocated: new Set(allocations.map(x => x.growerId)).size,
      waitingGrowers: new Set(waiting.map(x => x.growerId)).size,
      exceptionCount: exceptions.length,
      transports: transports.length,
      documentsReady: transports.filter(x => x.state === 'document-ready').length
    }
  };
}

export function formatLiters(value) {
  return new Intl.NumberFormat('de-DE').format(Math.round(value)) + ' l';
}
