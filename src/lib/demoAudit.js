import { demoGrowers, demoLots, demoProcurementRows, demoRequirement } from '../data/procurement-demo.js';
import { runProcurement } from './procurementEngine.js';

export function runDemoAudit() {
  const checks = [];
  const add = (id, label, pass, detail) => checks.push({ id, label, pass: Boolean(pass), detail });

  const growerIds = new Set(demoGrowers.map(g => g.growerId));
  const growerNames = new Set(demoGrowers.map(g => g.growerName));
  const businessNumbers = new Set(demoGrowers.map(g => g.businessNumber));
  const emails = new Set(demoGrowers.map(g => g.email));
  const lotIds = new Set(demoLots.map(l => l.lotId));

  add('grower-count','230 Demobetriebe vorhanden',demoGrowers.length === 230,`${demoGrowers.length}/230`);
  add('unique-grower-id','Betriebs-IDs eindeutig',growerIds.size === demoGrowers.length,`${growerIds.size} eindeutige IDs`);
  add('unique-grower-name','Betriebsnamen eindeutig',growerNames.size === demoGrowers.length,`${growerNames.size} eindeutige Namen`);
  add('no-generic-name','Keine generischen Testweingut-Namen',demoGrowers.every(g => !/^Testweingut/i.test(g.growerName)),'realistisch benannte synthetische Betriebe');
  add('unique-business-number','Betriebsnummern eindeutig',businessNumbers.size === demoGrowers.length,`${businessNumbers.size} eindeutige Nummern`);
  add('unique-email','E-Mail-Adressen eindeutig',emails.size === demoGrowers.length,`${emails.size} eindeutige Adressen`);

  const fullMaster = demoGrowers.every(g =>
    g.growerId && g.growerName && g.street && g.postcode && g.place &&
    g.contactPerson && g.email && g.phone && g.businessNumber && g.website
  );
  add('master-data','Alle Betriebe mit vollständigen Demo-Stammdaten',fullMaster,fullMaster ? 'Adresse, Kontakt, Betriebsnummer und Website vorhanden' : 'Stammdatenlücke gefunden');

  const profileOk = demoGrowers.every(g =>
    g.profile &&
    g.profile.hectares > 0 &&
    g.profile.annualProduction > 0 &&
    g.profile.typicalMarketVolume >= 0 &&
    g.profile.storageCapacity > 0 &&
    g.profile.largestTank > 0 &&
    g.profile.maxLoadingVolume > 0 &&
    Array.isArray(g.profile.grapes) && g.profile.grapes.length > 0 &&
    Array.isArray(g.profile.offers) && g.profile.offers.length > 0
  );
  add('profile-data','Jeder Betrieb mit nutzbarem Produktionsprofil',profileOk,profileOk ? 'Größe, Produktion, Kapazität und Sortiment vorhanden' : 'Profilfehler gefunden');

  const blueBand = demoGrowers.filter(g => g.supplierGroups.includes('Blaues Band')).length;
  add('blue-band','Blaues-Band-Demoscope konsistent',blueBand === 200,`${blueBand}/200 Testzuordnungen`);

  add('lot-id','Partie-IDs eindeutig',lotIds.size === demoLots.length,`${lotIds.size} eindeutige Partien`);
  add('lot-reference','Jede Partie referenziert einen Betrieb',demoLots.every(l => growerIds.has(l.growerId)),'keine verwaisten Partien');
  add('lot-volume','Jede Partie mit positiver Menge',demoLots.every(l => l.availableVolume > 0),'alle Mengen > 0');

  const lotCounts = new Map();
  demoLots.forEach(lot => lotCounts.set(lot.growerId,(lotCounts.get(lot.growerId) || 0) + 1));
  const everyGrowerLots = demoGrowers.every(g => (lotCounts.get(g.growerId) || 0) >= 2);
  add('grower-lots','Jeder Betrieb besitzt mindestens zwei Partien',everyGrowerLots,`${demoLots.length} Partien über ${demoGrowers.length} Betriebe`);

  add('row-count','Procurement-Zeilen entsprechen Partien',demoProcurementRows.length === demoLots.length,`${demoProcurementRows.length} Matching-Zeilen`);
  add('row-reference','Matching-Zeilen vollständig verknüpft',demoProcurementRows.every(r => growerIds.has(r.growerId) && r.businessProfile && r.growerName),'Betrieb und Profil je Zeile vorhanden');

  const model = runProcurement(demoRequirement,demoProcurementRows);
  const requiredStatuses = ['waiting','transport','document','ready','reserve'];
  const statuses = new Set(model.allocationRows.map(r => r.status));
  requiredStatuses.forEach(status => add(
    'scenario-' + status,
    'Pitch-Szenario vorhanden: ' + status,
    statuses.has(status),
    statuses.has(status) ? 'demonstrierbar' : 'fehlt'
  ));

  add('scenario-incomplete-profile','Pitch-Szenario: unvollständiges Profil',demoGrowers.some(g => g.profile.completeness < 100),'demonstrierbar');
  add('scenario-non-blueband','Pitch-Szenario: Partner außerhalb Blaues Band',demoGrowers.some(g => !g.supplierGroups.includes('Blaues Band')),'demonstrierbar');
  add('model-allocation','Großbedarf erzeugt reale Demo-Zuteilungen',model.allocations.length > 0 && model.allocatedVolume > 0,`${model.allocations.length} Zuteilungen · ${model.allocatedVolume} l`);
  add('model-transports','Zuteilungen erzeugen Transporte',model.transports.length === model.allocations.length,`${model.transports.length} Transporte`);

  return {
    checks,
    passed: checks.filter(c => c.pass).length,
    failed: checks.filter(c => !c.pass).length,
    total: checks.length,
    ok: checks.every(c => c.pass),
    stats: {
      growers: demoGrowers.length,
      lots: demoLots.length,
      blueBand,
      allocations: model.allocations.length,
      transports: model.transports.length
    }
  };
}
