import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { clean } from '../../services/api';
import { BOOKING_STATUSES, fmtDateTime, money, shortId } from '../../utils/format';
import { Async, EmptyState, PageHeader, Pagination, StatusBadge, Tabs } from '../../components/ui';
import SearchBox from './SearchBox';

export default function ManageBookings() {
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useFetch('/bookings', clean({ status: status === 'All' ? '' : status, search, page, limit: 10 }));

  return (
    <>
      <PageHeader title="Bookings" subtitle="Approve requests, hand over bikes and close rentals. Open a booking to act on it.">
        <SearchBox placeholder="Search customer or bike" onSearch={(s) => { setSearch(s); setPage(1); }} />
      </PageHeader>
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} options={['All', ...BOOKING_STATUSES]} />
      <Async q={q} isEmpty={(d) => d.items.length === 0} empty={<EmptyState icon={CalendarCheck} title="No bookings found" text="Bookings matching your filters will appear here." />}>
        {(d) => (
          <>
            <div className="card overflow-x-auto">
              <table className="table">
                <thead><tr><th>Booking</th><th>Customer</th><th>Bike</th><th>Pickup</th><th>Return</th><th>Total</th><th>Status</th><th>Payment</th><th><span className="sr-only">Open</span></th></tr></thead>
                <tbody>
                  {d.items.map((b) => (
                    <tr key={b._id}>
                      <td className="font-mono">{shortId(b._id)}</td>
                      <td>
                        <p className="font-semibold whitespace-nowrap">{b.userId?.name}</p>
                        <p className="text-xs text-zinc-400">{b.userId?.email}</p>
                      </td>
                      <td className="whitespace-nowrap">{b.bikeId?.name || '-'}</td>
                      <td className="whitespace-nowrap">{fmtDateTime(b.pickupDate)}</td>
                      <td className="whitespace-nowrap">{fmtDateTime(b.returnDate)}</td>
                      <td className="font-semibold">{money(b.totalAmount)}</td>
                      <td><StatusBadge status={b.bookingStatus} /></td>
                      <td><StatusBadge status={b.paymentStatus} /></td>
                      <td><Link to={`/admin/bookings/${b._id}`} className="btn btn-outline btn-sm">Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={d.page} pages={d.pages} onChange={setPage} />
          </>
        )}
      </Async>
    </>
  );
}
