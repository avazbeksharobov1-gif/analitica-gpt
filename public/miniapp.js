const tg = window.Telegram.WebApp;
tg.ready();

const user = tg.initDataUnsafe.user;

fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tgId: user.id,
    username: user.username || ''
  })
});

fetch('/api/stats')
  .then(r => r.json())
  .then(s => {
    document.getElementById('revenue').innerHTML =
      `💰 Revenue: <b>${s.revenue}</b>`;

    document.getElementById('orders').innerHTML =
      `📦 Orders: <b>${s.orders}</b>`;

    document.getElementById('ads').innerHTML =
      `📢 Ads: <b>${s.ads}</b>`;

    new Chart(document.getElementById('chart'), {
      type: 'bar',
      data: {
        labels: ['Revenue','Orders','Ads'],
        datasets: [{
          data: [s.revenue,s.orders,s.ads],
          backgroundColor:['#22c55e','#3b82f6','#f97316']
        }]
      }
    });
  });
fetch('/api/ai-insight')
  .then(r => r.json())
  .then(d => {
    document.getElementById('aiInsight').innerHTML =
      d.ok ? d.text : 'AI таҳлил мавжуд эмас';
  });
