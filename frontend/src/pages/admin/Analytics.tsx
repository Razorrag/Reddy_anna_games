export default function Analytics() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gold mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-royal p-6">
          <h3 className="text-lg font-semibold text-gold/80 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gold">Loading...</p>
        </div>
        <div className="card-royal p-6">
          <h3 className="text-lg font-semibold text-gold/80 mb-2">Active Games</h3>
          <p className="text-3xl font-bold text-gold">Loading...</p>
        </div>
        <div className="card-royal p-6">
          <h3 className="text-lg font-semibold text-gold/80 mb-2">Total Bets</h3>
          <p className="text-3xl font-bold text-gold">Loading...</p>
        </div>
        <div className="card-royal p-6">
          <h3 className="text-lg font-semibold text-gold/80 mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-gold">Loading...</p>
        </div>
      </div>
    </div>
  );
}