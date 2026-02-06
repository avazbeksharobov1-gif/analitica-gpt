fetch('/api/stats')
  .then(r => r.json())
  .then(s => {
    document.getElementById('stats').innerHTML =
      `💰 ${s.revenue}<br>📦 ${s.orders}<br>📢 ${s.ads}`;

    new Chart(document.getElementById('chart'), {
      type: 'bar',
      data: {
        labels: ['Revenue','Orders','Ads'],
        datasets: [{
          data: [s.revenue, s.orders, s.ads],
          backgroundColor: ['#22c55e','#3b82f6','#f97316']
        }]
      }
    });
  });
const sel = document.getElementById('project');
sel.onchange = load;

async function load(){
  const q = sel.value!=='' ? `?project=${sel.value}`:'';
  const s = await fetch('/api/stats'+q).then(r=>r.json());
  document.getElementById('stats').innerHTML =
    `💰 ${s.revenue} | 📦 ${s.orders} | 📢 ${s.ads}`;
}
load();

