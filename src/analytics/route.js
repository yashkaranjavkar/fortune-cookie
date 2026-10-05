// The Analytics page lives at #analytics (e.g. http://localhost:3000/#analytics)
export const DASHBOARD_HASH = '#analytics';

export function isDashboardRoute() {
  return typeof window !== 'undefined' && window.location.hash === DASHBOARD_HASH;
}

// Opens the Analytics page in a new tab, so the game in this tab keeps its progress
export function openDashboard() {
  window.open(`${window.location.pathname}${DASHBOARD_HASH}`, '_blank', 'noopener');
}
