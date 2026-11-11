import { Link } from 'react-router-dom';
import { Bike, CalendarCheck, CircleCheck, CircleX, Clock, DollarSign, Users, Zap } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { imgUrl, onImgError } from '../../services/api';
import { fmtDate, money, shortId } from '../../utils/format';
import { Async, PageHeader, Skeleton, StatCard, StatusBadge } from '../../components/ui';
import { ChartCard, CountChart, RevenueChart, monthLabel } from './Charts';

export default function Overview() {
  const q = useFetch('/admin/dashboard');
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Revenue, bookings and fleet at a glance." />
      <Async q={q} skeleton={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        {({ stats, monthly, mostRented, recentBookings, recentCustomers }) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={DollarSign} label="Total revenue" value={money(stats.revenue)} accent />
              <StatCard icon={Users} label="Total customers" value={stats.customers} />
              <StatCard icon={Bike} label="Total motorcycles" value={stats.bikes} />
              <StatCard icon={CalendarCheck} label="Total bookings" value={stats.bookings} />
              <StatCard icon={Zap} label="Active rentals" value={stats.active} />
              <StatCard icon={Clock} label="Pending bookings" value={stats.pending} />
              <StatCard icon={CircleCheck} label="Completed bookings" value={stats.completed} />
              <StatCard icon={CircleX} label="Cancelled bookings" value={stats.cancelled} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Revenue, last 12 months">
                <RevenueChart data={monthly} xKey="month" formatX={monthLabel} />
              </ChartCard>
              <ChartCard title="Bookings per month">
                <CountChart data={monthly} xKey="month" yKey="bookings" label="Bookings" formatX={monthLabel} />
              </ChartCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="card overflow-x-auto xl:col-span-2">
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                  <h2 className="font-bold">Recent bookings</h2>
                  <Link to="/admin/bookings" className="text-sm font-semibold text-accent hover:underline">View all</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <p className="px-5 pb-6 text-sm text-zinc-500">No bookings yet.</p>
                ) : (
                  <table className="table">
                    <thead><tr><th>Booking</th><th>Customer</th><th>Bike</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b._id}>
                          <td><Link to={`/admin/bookings/${b._id}`} className="font-mono text-accent hover:underline">{shortId(b._id)}</Link></td>
                          <td>{b.userId?.name}</td>
                          <td>{b.bikeId?.name || '-'}</td>
                          <td>{money(b.totalAmount)}</td>
                          <td><StatusBadge status={b.bookingStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="card p-5">
                <h2 className="mb-3 font-bold">Most rented bikes</h2>
                {mostRented.length === 0 ? (
                  <p className="text-sm text-zinc-500">No rentals yet.</p>
                ) : (
                  <ol className="space-y-3">
                    {mostRented.map((bike, i) => (
                      <li key={bike._id} className="flex items-center gap-3">
                        <span className="w-4 text-sm font-bold text-zinc-500">{i + 1}</span>
                        <img src={imgUrl(bike.images?.[0])} onError={onImgError} alt="" className="h-10 w-14 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{bike.name}</p>
                          <p className="text-xs text-zinc-400">{bike.brand}</p>
                        </div>
                        <span className="text-sm font-bold text-accent">{bike.bookingCount}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Recent customer registrations</h2>
                <Link to="/admin/customers" className="text-sm font-semibold text-accent hover:underline">View all</Link>
              </div>
              {recentCustomers.length === 0 ? (
                <p className="text-sm text-zinc-500">No customers yet.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {recentCustomers.map((c) => (
                    <li key={c._id} className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-bold text-zinc-950">{c.name[0]?.toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="truncate text-xs text-zinc-400">{c.email} &middot; {fmtDate(c.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Async>
    </>
  );
}
