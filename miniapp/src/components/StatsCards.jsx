export default function StatsCards({ stats }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div>💰 {stats.revenue}</div>
      <div>📦 {stats.orders}</div>
      <div>📢 {stats.ads}</div>
    </div>
  );
}
