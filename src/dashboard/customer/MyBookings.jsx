import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { clean } from '../../services/api';
import { BOOKING_STATUSES } from '../../utils/format';
import { Async, EmptyState, PageHeader, Pagination, Tabs } from '../../components/ui';
import BookingRow from './BookingRow';

export default function MyBookings() {
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const q = useFetch('/bookings/my-bookings', clean({ status: status === 'All' ? '' : status, page, limit: 8 }));

  return (
    <>
      <PageHeader title="My bookings" subtitle="Current bookings and your full rental history.">
        <Link to="/bikes" className="btn btn-primary">Book a bike</Link>
      </PageHeader>
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} options={['All', ...BOOKING_STATUSES]} />
      <Async
        q={q}
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState title={status === 'All' ? 'No bookings yet' : `No ${status.toLowerCase()} bookings`} text="Bookings you make will show up here." action={<Link to="/bikes" className="btn btn-primary">Browse bikes</Link>} />}
      >
        {(d) => (
          <>
            <div className="space-y-3">
              {d.items.map((b) => <BookingRow key={b._id} booking={b} />)}
            </div>
            <Pagination page={d.page} pages={d.pages} onChange={setPage} />
          </>
        )}
      </Async>
    </>
  );
}
