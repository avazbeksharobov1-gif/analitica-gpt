const { prisma } = require('./db');
const { fetchOrdersByDate, fetchReturnsByDate, fetchPayoutsByDate } = require('./yandexSeller');

function toDateOnly(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function sumMoney(items, field) {
  return items.reduce((s, it) => s + (Number(it[field]) || 0), 0);
}

async function syncDay(projectId, date) {
  const day = toDateOnly(date);
  const dateStr = day.toISOString().slice(0, 10);

  const [ordersData, returnsData, payoutsData] = await Promise.all([
    fetchOrdersByDate(dateStr, dateStr).catch(() => ({ orders: [] })),
    fetchReturnsByDate(dateStr, dateStr).catch(() => ({ returns: [] })),
    fetchPayoutsByDate(dateStr, dateStr).catch(() => ({ payouts: [] }))
  ]);

  const orders = ordersData.orders || [];
  const returns = returnsData.returns || [];
  const payouts = payoutsData.payouts || [];

  let revenue = 0;
  let ordersCount = 0;
  let fees = 0;
  let logistics = 0;
  let returnsSum = 0;

  const itemAgg = new Map();

  for (const o of orders) {
    ordersCount += 1;
    revenue += Number(o.total) || 0;
    fees += Number(o.fee) || 0;
    logistics += Number(o.delivery) || 0;
    if (Array.isArray(o.items)) {
      for (const it of o.items) {
        const sku = String(it.offerId || it.sku || 'unknown');
        const prev = itemAgg.get(sku) || { quantity: 0, revenue: 0, fees: 0, logistics: 0, returns: 0 };
        prev.quantity += Number(it.count) || 0;
        prev.revenue += Number(it.price) * (Number(it.count) || 0);
        itemAgg.set(sku, prev);
      }
    }
  }

  returnsSum = sumMoney(returns, 'amount');

  await prisma.sellerDaily.upsert({
    where: { projectId_date: { projectId, date: day } },
    update: { revenue, orders: ordersCount, fees, logistics, returns: returnsSum },
    create: { projectId, date: day, revenue, orders: ordersCount, fees, logistics, returns: returnsSum }
  });

  await prisma.sellerItemDaily.deleteMany({ where: { projectId, date: day } });

  for (const [sku, v] of itemAgg.entries()) {
    await prisma.sellerItemDaily.create({
      data: {
        projectId,
        date: day,
        sku,
        quantity: v.quantity,
        revenue: v.revenue,
        fees: v.fees,
        logistics: v.logistics,
        returns: v.returns
      }
    });
  }

  return { revenue, orders: ordersCount, fees, logistics, returns: returnsSum };
}

module.exports = { syncDay };
