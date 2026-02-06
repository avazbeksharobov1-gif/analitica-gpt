import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function ChartBlock({ stats }) {
  const ref = useRef();

  useEffect(() => {
    new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: ['Revenue', 'Orders', 'Ads'],
        datasets: [{
          data: [stats.revenue, stats.orders, stats.ads],
          backgroundColor: ['#22c55e', '#3b82f6', '#f97316']
        }]
      }
    });
  }, []);

  return <canvas ref={ref} height="120"></canvas>;
}
