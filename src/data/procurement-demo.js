export const demoRequirement = {
  id: 'M-2027-RI-01',
  buyer: 'Peter Mertes',
  supplierGroup: 'Blaues Band',
  targetVolume: 1500000,
  productType: 'wine',
  grape: 'Riesling',
  origin: 'Mosel',
  vintage: 2025,
  deliveryWindow: 'Okt.–Dez. 2026'
};

const places = ['Bernkastel-Kues','Piesport','Leiwen','Trittenheim','Brauneberg','Wintrich','Ürzig','Graach','Zeltingen-Rachtig','Mehring','Neumagen-Dhron','Kröv'];

export const demoGrowers = Array.from({ length: 200 }, (_, index) => {
  const n = index + 1;
  const grape = n % 9 === 0 ? 'Weißburgunder' : 'Riesling';
  const origin = n % 17 === 0 ? 'Saar' : 'Mosel';
  const vintage = n % 13 === 0 ? 2024 : 2025;
  const availableVolume = 7000 + ((n * 3700) % 24000);
  const analysisConfirmed = n % 14 !== 0;
  const treatmentsConfirmed = n % 19 !== 0;
  const currentVolumeConfirmed = n % 23 !== 0;

  return {
    growerId: 'BB-' + String(n).padStart(3,'0'),
    growerName: n <= 12 ? [
      'Weingut Musterberg','Weingut Sonnenhang','Weingut Klosterblick','Weingut Moselterrassen',
      'Weingut Römerhang','Weingut Felsenhof','Weingut Goldtröpfchen','Weingut Schieferblick',
      'Weingut Laurentiushof','Weingut Moselbogen','Weingut Rosenberg','Weingut Sonnenuhr'
    ][n-1] : 'Blaues-Band-Betrieb ' + String(n).padStart(3,'0'),
    place: places[index % places.length],
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
