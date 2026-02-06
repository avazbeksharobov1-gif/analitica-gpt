import { useEffect, useState } from 'react';

export default function App() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('https://analitica-gpt-production.up.railway.app/api/stats')
      .then(r => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>📊 Analitica</h1>
      <p>💰 Revenue: {stats.revenue}</p>
      <p>📦 Orders: {stats.orders}</p>
      <p>📢 Ads: {stats.ads}</p>
    </div>
  );
}

