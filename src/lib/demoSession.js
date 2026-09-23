export const ACTIVE_GROWER_KEY = 'wp-demo-active-grower-id';
export const LEGACY_PROFILE_KEY = 'wp-demo-grower-profile';
export const PROFILES_KEY = 'wp-demo-grower-profiles';
export const RESPONSES_KEY = 'wp-demo-grower-responses';
export const APPROVED_GROWERS_KEY = 'wp-demo-approved-growers';
export const CUSTOM_LOTS_KEY = 'wp-demo-custom-lots';

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


export function getCustomLots(growerId) {
  const all = readJson(CUSTOM_LOTS_KEY, {});
  return all[growerId] || [];
}

export function addCustomLot(lot) {
  if (!lot?.growerId || !lot?.lotId) return;
  const all = readJson(CUSTOM_LOTS_KEY, {});
  const current = all[lot.growerId] || [];
  all[lot.growerId] = [lot, ...current.filter(item => item.lotId !== lot.lotId)].slice(0, 50);
  localStorage.setItem(CUSTOM_LOTS_KEY, JSON.stringify(all));
}
