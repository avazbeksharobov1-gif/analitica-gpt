export async function getStats() {
  const r = await fetch('/api/stats');
  return r.json();
}

export async function getInsight() {
  const r = await fetch('/api/compare');
  return r.json();
}
