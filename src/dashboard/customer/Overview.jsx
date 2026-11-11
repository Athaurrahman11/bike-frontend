import { Link } from 'react-router-dom';
import { CalendarCheck, CircleCheck, CircleX, Zap } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Async, EmptyState, PageHeader, Skeleton, StatCard } from '../../components/ui';
import BookingRow from './BookingRow';

export default function Overview() {
  const { user } = useAuth();
  const q = useFetch('/bookings/my-bookings', { limit: 5 });

  return (
    <>
      <PageHeader title={`Hi, ${user.name.split(' ')[0]}`} subtitle="Here is what is happening with your rentals.">
        <Link to="/bikes" className="btn btn-primary">Book a bike</Link>
      </PageHeader>
      <Async q={q} skeleton={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>}>
        {({ items, total, stats }) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={CalendarCheck} label="Total bookings" value={total} accent />
              <StatCard icon={Zap} label="Active rentals" value={stats.Active || 0} />
              <StatCard icon={CircleCheck} label="Completed rentals" value={stats.Completed || 0} />
              <StatCard icon={CircleX} label="Cancelled bookings" value={stats.Cancelled || 0} />
            </div>
            <div className="mt-8 mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Recent booking activity</h2>
              {total > 0 && <Link to="/dashboard/bookings" className="text-sm font-semibold text-accent hover:underline">View all</Link>}
            </div>
            {items.length === 0 ? (
              <EmptyState title="No bookings yet" text="Find a motorcycle you like and book your first ride." action={<Link to="/bikes" className="btn btn-primary">Browse bikes</Link>} />
            ) : (
              <div className="space-y-3">
                {items.map((b) => <BookingRow key={b._id} booking={b} />)}
              </div>
            )}
          </>
        )}
      </Async>
    </>
  );
}
