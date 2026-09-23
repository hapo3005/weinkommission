export const demoRequirement = {
  id: 'M-2027-RI-01',
  buyer: 'Peter Mertes',
  supplierGroup: 'Blaues Band',
  supplierMembershipImported: false,
  datasetStatus: 'synthetic',
  targetVolume: 1500000,
  productType: 'wine',
  grape: 'Riesling',
  origin: 'Mosel',
  vintage: 2025,
  deliveryWindow: 'Okt.–Dez. 2026',
  minLoadingVolume: 12000,
  preferredLoadingVolume: 22000
};

const placeRecords = [
  { place:'Bernkastel-Kues', postcode:'54470' },
  { place:'Piesport', postcode:'54498' },
  { place:'Leiwen', postcode:'54340' },
  { place:'Trittenheim', postcode:'54349' },
  { place:'Brauneberg', postcode:'54472' },
  { place:'Wintrich', postcode:'54487' },
  { place:'Ürzig', postcode:'54539' },
  { place:'Graach', postcode:'54470' },
  { place:'Zeltingen-Rachtig', postcode:'54492' },
  { place:'Mehring', postcode:'54346' },
  { place:'Neumagen-Dhron', postcode:'54347' },
  { place:'Kröv', postcode:'54536' }
];

const streetNames = [
  'Moselstraße','Weinbergstraße','Römerstraße','Bergstraße','Im Rebenhof','Uferstraße',
  'Kirchstraße','Schieferweg','Am Sonnenhang','Mühlenweg','Brückenstraße','Winzerweg'
];

const fictionalFamilies = [
  'Ahrensberg','Bellenau','Corten','Demerath','Elsenborn','Falkenau','Gressenich','Harenberg',
  'Ivenau','Josten','Kellenborn','Lamberti','Maringer','Nellesen','Osterau','Pellenz',
  'Quinter','Rosenbach','Scharenberg','Thielenau','Uhlenfeld','Vossen','Wellenburg'
];

const fictionalNameFormats = [
  (name) => `Weingut ${name} & Sohn`,
  (name) => `Familienweingut ${name}`,
  (name) => `Weinhof ${name}`,
  (name) => `Weingut ${name} am Schieferhang`,
  (name) => `Weingut ${name} an der Mosel`,
  (name) => `Weingut ${name} Rebenhof`,
  (name) => `Weingut ${name} Sonnenlay`,
  (name) => `Weingut ${name} Terrassen`,
  (name) => `Weingut ${name} Alte Kelter`,
  (name) => `Hofgut ${name}`
];

function fictionalGrowerName(index) {
  const family = fictionalFamilies[index % fictionalFamilies.length];
  const format = fictionalNameFormats[Math.floor(index / fictionalFamilies.length) % fictionalNameFormats.length];
  return format(family);
}

export const demoGrowers = Array.from({ length: 230 }, (_, index) => {
  const n = index + 1;
  const isBlueBandMember = n <= 200;
  const hectares = Number((5.5 + ((n * 17) % 235) / 10).toFixed(1));
  const annualProduction = Math.round((hectares * (7200 + ((n * 113) % 1800))) / 1000) * 1000;
  const marketVolume = Math.round((annualProduction * (0.38 + ((n % 5) * 0.08))) / 1000) * 1000;
  const storageCapacity = Math.round((annualProduction * (1.05 + ((n % 4) * 0.12))) / 1000) * 1000;
  const largestTank = [8000,12000,16000,20000,25000,30000,40000][n % 7];

  const family = fictionalFamilies[index % fictionalFamilies.length];
  const location = placeRecords[index % placeRecords.length];
  const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const harvestVolume = Math.round((annualProduction * 1.12) / 1000) * 1000;

  return {
    growerId: 'TEST-' + String(n).padStart(3,'0'),
    growerName: fictionalGrowerName(index),
    place: location.place,
    postcode: location.postcode,
    street: streetNames[index % streetNames.length] + ' ' + (2 + ((n * 7) % 48)),
    contactPerson: 'Familie ' + family,
    email: 'kontakt+' + String(n).padStart(3,'0') + '@' + slug + '.example',
    phone: '06531 ' + String(410000 + n),
    businessNumber: 'DEMO-RP-' + String(n).padStart(5,'0'),
    website: 'https://www.' + slug + '.example',
    dataStatus: 'synthetic',
    cooperationStatus: 'active',
    supplierGroups: isBlueBandMember ? ['Blaues Band'] : [],
    membershipDataStatus: 'synthetic',
    profile: {
      completeness: n % 11 === 0 ? 72 : n % 17 === 0 ? 84 : 100,
      hectares,
      annualProduction,
      harvestVolume,
      typicalMarketVolume: marketVolume,
      storageCapacity,
      largestTank,
      maxLoadingVolume: Math.min(largestTank, 26000),
      grapes: n % 9 === 0 ? ['Weißburgunder','Riesling'] : ['Riesling', n % 4 === 0 ? 'Weißburgunder' : 'Müller-Thurgau'],
      offers: n % 6 === 0 ? ['Fasswein','Most'] : ['Fasswein'],
      flexibleRequests: n % 8 !== 0,
      loadingMethod: largestTank >= 12000 ? 'tank-truck' : 'container'
    }
  };
});

const grapes = ['Riesling','Riesling','Riesling','Weißburgunder','Riesling','Müller-Thurgau'];
const vintages = [2025,2025,2024,2025];

export const demoLots = demoGrowers.flatMap((grower, growerIndex) => {
  const n = growerIndex + 1;
  const lotCount = 2 + (n % 3);

  return Array.from({ length: lotCount }, (_, lotIndex) => {
    const serial = n * 10 + lotIndex + 1;
    const grape = grapes[(n + lotIndex) % grapes.length];
    const vintage = vintages[(n + lotIndex) % vintages.length];
    const origin = (n + lotIndex) % 23 === 0 ? 'Saar' : 'Mosel';
    const availableVolume = 4500 + ((n * 3100 + lotIndex * 4700) % 26000);

    return {
      lotId: 'R' + String(vintage).slice(2) + '-' + String(serial).padStart(4,'0'),
      growerId: grower.growerId,
      productType: 'wine',
      grape,
      origin,
      vintage,
      availableVolume,
      analysisConfirmed: serial % 14 !== 0,
      treatmentsConfirmed: serial % 19 !== 0,
      currentVolumeConfirmed: serial % 23 !== 0,
      transportDataComplete: serial % 7 !== 0,
      documentReady: serial % 11 === 0
    };
  });
});

export const demoProcurementRows = demoLots.map(lot => {
  const grower = demoGrowers.find(item => item.growerId === lot.growerId);
  return {
    ...lot,
    growerName: grower.growerName,
    place: grower.place,
    supplierGroups: grower.supplierGroups,
    cooperationStatus: grower.cooperationStatus,
    businessProfile: grower.profile
  };
});

export function getGrowerById(id) {
  return demoGrowers.find(grower => grower.growerId === id);
}

export function getLotsForGrower(id) {
  return demoLots.filter(lot => lot.growerId === id);
}
