import { useState } from 'react';
import { CalendarCheck, CircleCheck, DollarSign, Download } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { fmtDate, money } from '../../utils/format';
import { Async, PageHeader, StatCard, StatusBadge } from '../../components/ui';
import { ChartCard, CountChart, RevenueChart } from './Charts';

const day = (offset = 0) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

function downloadCsv(report, range) {
  const rows = [
    ['Revenue report', `${range.from} to ${range.to}`],
    [],
    ['Rental revenue', report.summary.revenue],
    ['Paid bookings', report.summary.paidBookings],
    ['All bookings', report.summary.totalBookings],
    [],
    ['Date', 'Revenue', 'Paid bookings'],
    ...report.daily.map((d) => [d.date, d.revenue, d.bookings]),
    [],
    ['Bike', 'Revenue', 'Bookings', 'Rental days'],
    ...report.topBikes.map((b) => [b.name, b.revenue, b.bookings, b.days]),
    [],
    ['Category', 'Revenue', 'Bookings'],
    ...report.byCategory.map((c) => [c.name, c.revenue, c.bookings]),
  ];
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `revenue-report-${range.from}-to-${range.to}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function Reports() {
  const [range, setRange] = useState({ from: day(-30), to: day() });
  const q = useFetch('/admin/reports', range);

  return (
    <>
      <PageHeader title="Reports & analytics" subtitle="Rental revenue excludes refundable security deposits.">
        <label className="text-sm text-zinc-400">From <input type="date" className="input mt-1 w-40" max={range.to} value={range.from} onChange={(e) => e.target.value && setRange({ ...range, from: e.target.value })} /></label>
        <label className="text-sm text-zinc-400">To <input type="date" className="input mt-1 w-40" min={range.from} value={range.to} onChange={(e) => e.target.value && setRange({ ...range, to: e.target.value })} /></label>
        <button className="btn btn-primary self-end" disabled={!q.data} onClick={() => downloadCsv(q.data, range)}><Download className="h-4 w-4" /> Export CSV</button>
      </PageHeader>
      <Async q={q}>
        {(r) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={DollarSign} label="Rental revenue" value={money(r.summary.revenue)} accent />
              <StatCard icon={CircleCheck} label="Paid bookings" value={r.summary.paidBookings} />
              <StatCard icon={CalendarCheck} label="All bookings" value={r.summary.totalBookings} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Daily revenue" empty={r.daily.length === 0}>
                <RevenueChart data={r.daily} xKey="date" formatX={(d) => fmtDate(d).replace(/,? \d{4}$/, '')} />
              </ChartCard>
              <ChartCard title="Revenue by category" empty={r.byCategory.length === 0}>
                <CountChart data={r.byCategory} xKey="name" yKey="revenue" label="Revenue" formatY={money} />
              </ChartCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="card overflow-x-auto xl:col-span-2">
                <h2 className="px-5 pt-5 pb-2 font-bold">Top earning bikes</h2>
                {r.topBikes.length === 0 ? (
                  <p className="px-5 pb-6 text-sm text-zinc-500">No paid bookings in this period.</p>
                ) : (
                  <table className="table">
                    <thead><tr><th>Bike</th><th>Bookings</th><th>Rental days</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {r.topBikes.map((b) => (
                        <tr key={b._id}><td className="font-semibold">{b.name}</td><td>{b.bookings}</td><td>{b.days}</td><td className="font-semibold text-accent">{money(b.revenue)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="card p-5">
                <h2 className="mb-3 font-bold">Bookings by status</h2>
                {r.byStatus.length === 0 ? (
                  <p className="text-sm text-zinc-500">No bookings in this period.</p>
                ) : (
                  <ul className="space-y-3">
                    {r.byStatus.map((s) => (
                      <li key={s.status} className="flex items-center justify-between"><StatusBadge status={s.status} /><span className="font-bold">{s.count}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </Async>
    </>
  );
}
