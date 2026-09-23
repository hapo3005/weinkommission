export const ACTIVE_GROWER_KEY = 'wp-demo-active-grower-id';
export const LEGACY_PROFILE_KEY = 'wp-demo-grower-profile';
export const PROFILES_KEY = 'wp-demo-grower-profiles';
export const RESPONSES_KEY = 'wp-demo-grower-responses';
export const APPROVED_GROWERS_KEY = 'wp-demo-approved-growers';
export const CUSTOM_LOTS_KEY = 'wp-demo-custom-lots';
export const BUYER_REQUESTS_KEY = 'wp-demo-buyer-requests';
export const ACTIVE_BUYER_REQUEST_KEY = 'wp-demo-active-buyer-request';
export const DRIVER_CONFIRMATIONS_KEY = 'wp-demo-driver-confirmations';
export const REGISTRATION_REQUESTS_KEY = 'wp-demo-registration-requests';
export const GROWER_ACCOUNT_KEY = 'wp-demo-grower-account';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setActiveGrowerId(id) {
  if (id) localStorage.setItem(ACTIVE_GROWER_KEY, id);
}

export function resolveActiveGrower(growers, search = window.location.search, fallbackId = 'TEST-001') {
  const params = new URLSearchParams(search || '');
  const requestedId = params.get('grower') || params.get('invite');
  const account = readJson('wp-demo-grower-account', null);
  const storedId = localStorage.getItem(ACTIVE_GROWER_KEY);
  const approved = getApprovedGrowers();
  const ids = [requestedId, storedId, account?.growerId, fallbackId].filter(Boolean);
  const grower = ids
    .map(id => growers.find(item => item.growerId === id) || approved[id])
    .find(Boolean) || growers[0];
  if (grower) setActiveGrowerId(grower.growerId);
  return grower;
}

export function getGrowerProfile(growerId) {
  const profiles = readJson(PROFILES_KEY, {});
  if (profiles[growerId]) return profiles[growerId];
  const legacy = readJson(LEGACY_PROFILE_KEY, null);
  if (legacy?.growerId === growerId) {
    profiles[growerId] = legacy;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return legacy;
  }
  return null;
}

export function saveGrowerProfile(profile) {
  if (!profile?.growerId) return;
  const profiles = readJson(PROFILES_KEY, {});
  profiles[profile.growerId] = profile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify(profile));
}

export function getAllGrowerResponses() {
  return readJson(RESPONSES_KEY, {});
}

export function getGrowerResponses(growerId) {
  const all = getAllGrowerResponses();
  return all[growerId] || [];
}

export function addGrowerResponse(response) {
  if (!response?.growerId) return;
  const all = readJson(RESPONSES_KEY, {});
  const current = all[response.growerId] || [];
  all[response.growerId] = [response, ...current].slice(0, 20);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(all));
  localStorage.setItem('wp-demo-grower-response', JSON.stringify(response));
}


export function getApprovedGrowers() {
  return readJson(APPROVED_GROWERS_KEY, {});
}

export function saveApprovedGrower(grower) {
  if (!grower?.growerId) return;
  const approved = getApprovedGrowers();
  approved[grower.growerId] = grower;
  localStorage.setItem(APPROVED_GROWERS_KEY, JSON.stringify(approved));
}


export function getAllCustomLots() {
  return readJson(CUSTOM_LOTS_KEY, {});
}

export function getCustomLots(growerId) {
  const all = getAllCustomLots();
  return all[growerId] || [];
}

export function addCustomLot(lot) {
  if (!lot?.growerId || !lot?.lotId) return;
  const all = readJson(CUSTOM_LOTS_KEY, {});
  const current = all[lot.growerId] || [];
  all[lot.growerId] = [lot, ...current.filter(item => item.lotId !== lot.lotId)].slice(0, 50);
  localStorage.setItem(CUSTOM_LOTS_KEY, JSON.stringify(all));
}


export function parseDemoVolume(value) {
  return Number(String(value || '').replace(/\./g,'').replace(',','.').replace(/[^0-9.]/g,'')) || 0;
}

export function getGrowerAccount() {
  return readJson(GROWER_ACCOUNT_KEY, null);
}

export function getRegistrationRequests() {
  return readJson(REGISTRATION_REQUESTS_KEY, []);
}

export function getBuyerRequests() {
  return readJson(BUYER_REQUESTS_KEY, []);
}

export function saveBuyerRequests(requests) {
  localStorage.setItem(BUYER_REQUESTS_KEY, JSON.stringify((requests || []).slice(0, 20)));
}

export function buyerRequestToRequirement(request, baseRequirement) {
  if (!request) return {...baseRequirement};
  return {
    ...baseRequirement,
    id: request.id,
    buyer: request.company,
    grape: request.grape,
    origin: request.origin,
    vintage: Number(request.vintage),
    targetVolume: parseDemoVolume(request.targetVolume),
    deliveryWindow: request.deliveryWindow,
    quality: request.quality,
    note: request.note,
    datasetStatus: 'buyer-request-demo'
  };
}

export function resolveActiveRequirement(baseRequirement, search = typeof window !== 'undefined' ? window.location.search : '') {
  const params = new URLSearchParams(search || '');
  const requestedId = params.get('request') || localStorage.getItem(ACTIVE_BUYER_REQUEST_KEY);
  const request = getBuyerRequests().find(item => item.id === requestedId && item.status === 'accepted');
  if (!request) return {...baseRequirement};
  localStorage.setItem(ACTIVE_BUYER_REQUEST_KEY, request.id);
  return buyerRequestToRequirement(request, baseRequirement);
}

export function getDriverConfirmations() {
  return readJson(DRIVER_CONFIRMATIONS_KEY, []);
}

export function saveDriverConfirmation(item) {
  if (!item?.transportId) return;
  const confirmations = getDriverConfirmations();
  const next = [item, ...confirmations.filter(entry => entry.transportId !== item.transportId)].slice(0, 30);
  localStorage.setItem(DRIVER_CONFIRMATIONS_KEY, JSON.stringify(next));
}

export function buildDemoWorkingRows(demoRows, demoGrowers) {
  const approvedGrowers = getApprovedGrowers();
  const growerLookup = new Map([
    ...(demoGrowers || []).map(grower => [grower.growerId, grower]),
    ...Object.values(approvedGrowers).map(grower => [grower.growerId, grower])
  ]);

  const customRows = Object.entries(getAllCustomLots()).flatMap(([growerId, lots]) => {
    const grower = growerLookup.get(growerId);
    if (!grower) return [];
    return (lots || []).map(lot => ({
      ...lot,
      growerName: grower.growerName,
      place: grower.place,
      supplierGroups: grower.supplierGroups || [],
      cooperationStatus: grower.cooperationStatus || 'active',
      businessProfile: grower.profile
    }));
  });

  const responses = getAllGrowerResponses();
  return [...(demoRows || []), ...customRows].map(row => {
    const rowResponses = responses[row.growerId] || [];
    const confirmation = rowResponses.find(item => item.lotId === row.lotId && item.type === 'confirmation');
    const loading = rowResponses.find(item => item.lotId === row.lotId && item.type === 'loading');
    return {
      ...row,
      analysisConfirmed: confirmation ? true : row.analysisConfirmed,
      treatmentsConfirmed: confirmation ? true : row.treatmentsConfirmed,
      currentVolumeConfirmed: confirmation ? true : row.currentVolumeConfirmed,
      transportDataComplete: loading ? true : row.transportDataComplete
    };
  });
}
