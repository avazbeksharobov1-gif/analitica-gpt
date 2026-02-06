const fetch = require('node-fetch');
const TOKEN = process.env.YANDEX_TOKEN;

const COUNTERS = Object.keys(process.env)
  .filter(k => k.startsWith('YANDEX_COUNTER_ID_'))
  .map(k => process.env[k]);

async function fetchOne(counterId, date1 = 'today', date2 = 'today') {
  if (!counterId) {
    return { revenue: 0, orders: 0, ads: 0 };
  }

  const url =
    'https://api-metrika.yandex.net/stat/v1/data/bytime' +
    `?ids=${counterId}` +
    `&metrics=ym:s:revenue,ym:s:visits,ym:s:adClicks` +
    `&date1=${date1}&date2=${date2}`;

  const r = await fetch(url, {
    headers: { Authorization: `OAuth ${TOKEN}` }
  });
  const j = await r.json();

  return {
    revenue: j.totals?.[0] || 0,
    orders: j.totals?.[1] || 0,
    ads: j.totals?.[2] || 0
  };
}

async function getStats(projectIndex = null, date1 = 'today', date2 = 'today') {
  if (projectIndex !== null && projectIndex !== undefined) {
    return fetchOne(COUNTERS[projectIndex], date1, date2);
  }

  if (!COUNTERS.length) {
    return { revenue: 0, orders: 0, ads: 0 };
  }

  const all = await Promise.all(
    COUNTERS.map((id) => fetchOne(id, date1, date2))
  );

  return all.reduce(
    (a, b) => ({
      revenue: a.revenue + b.revenue,
      orders: a.orders + b.orders,
      ads: a.ads + b.ads
    }),
    { revenue: 0, orders: 0, ads: 0 }
  );
}

async function getCompareStats() {
  const thisWeek = await getStats(null, '7daysAgo', 'today');
  const lastWeek = await getStats(null, '14daysAgo', '7daysAgo');

  return { thisWeek, lastWeek };
}

module.exports = {
  getStats,
  getCompareStats
};
