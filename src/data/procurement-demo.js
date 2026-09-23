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
  deliveryWindow: 'Okt.–Dez. 2026'
};

const places = ['Bernkastel-Kues','Piesport','Leiwen','Trittenheim','Brauneberg','Wintrich','Ürzig','Graach','Zeltingen-Rachtig','Mehring','Neumagen-Dhron','Kröv'];

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
  const grape = n % 9 === 0 ? 'Weißburgunder' : 'Riesling';
  const origin = n % 17 === 0 ? 'Saar' : 'Mosel';
  const vintage = n % 13 === 0 ? 2024 : 2025;
  const availableVolume = 7000 + ((n * 3700) % 24000);
  const analysisConfirmed = n % 14 !== 0;
  const treatmentsConfirmed = n % 19 !== 0;
  const currentVolumeConfirmed = n % 23 !== 0;
  const isBlueBandMember = n <= 200;

  return {
    growerId: 'TEST-' + String(n).padStart(3,'0'),
    growerName: fictionalGrowerName(index),
    place: places[index % places.length],
    dataStatus: 'synthetic',
    cooperationStatus: 'active',
    supplierGroups: isBlueBandMember ? ['Blaues Band'] : [],
    membershipDataStatus: 'synthetic',
    lotId: 'R25-' + String(10+n).padStart(3,'0'),
    productType: 'wine',
    grape,
    origin,
    vintage,
    availableVolume,
    analysisConfirmed,
    treatmentsConfirmed,
    currentVolumeConfirmed,
    transportDataComplete: n % 7 !== 0,
    documentReady: n % 11 === 0
  };
});
