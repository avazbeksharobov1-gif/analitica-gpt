async function loadAI() {
  const forecastEl = document.getElementById('ai-forecast');
  const adsEl = document.getElementById('ai-ads');

  if (!forecastEl || !adsEl) return;

  try {
    forecastEl.textContent = '⏳ Юкланяпти...';
    adsEl.textContent = '⏳ Юкланяпти...';

    const forecastRes = await fetch('/api/ai/forecast');
    const adsRes = await fetch('/api/ai/ads');

    if (forecastRes.ok) {
      const f = await forecastRes.json();
      forecastEl.textContent = f.result || 'Маълумот йўқ';
    } else {
      forecastEl.textContent = 'AI прогноз уланмаган';
    }

    if (adsRes.ok) {
      const a = await adsRes.json();
      adsEl.textContent = a.result || 'Маълумот йўқ';
    } else {
      adsEl.textContent = 'AI реклама уланмаган';
    }

  } catch (e) {
    forecastEl.textContent = 'AI ҳозирча фаол эмас';
    adsEl.textContent = 'AI ҳозирча фаол эмас';
  }
}

document.addEventListener('DOMContentLoaded', loadAI);
