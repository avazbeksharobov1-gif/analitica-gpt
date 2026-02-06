async function loadStats(range) {
  let from = new Date();
  let to = new Date();

  if (range === '7d') from.setDate(from.getDate() - 6);
  if (range === '30d') from.setDate(from.getDate() - 29);

  const r = await fetch(`/api/stats?from=${from.toISOString()}&to=${to.toISOString()}`);
  const s = await r.json();

  document.getElementById('revenue').innerText =
    `Daromad / Доход: ${s.revenue}`;
  document.getElementById('orders').innerText =
    `Buyurtmalar / Заказы: ${s.orders}`;
  document.getElementById('ads').innerText =
    `Harajat / Расходы: ${s.expenses}`;
}

fetch('/api/insight')
  .then(r => r.text())
  .then(t => {
    document.getElementById('ai-insight').innerHTML = t;
  })
  .catch(() => {
    document.getElementById('ai-insight').innerText =
      'AI tahlil mavjud emas / AI анализ недоступен';
  });

fetch('/api/recommend')
  .then(r => r.text())
  .then(t => {
    document.getElementById('ai-recommend').innerHTML = t;
  })
  .catch(() => {
    document.getElementById('ai-recommend').innerText =
      'AI tavsiyalar mavjud emas / AI рекомендации недоступны';
  });
