import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { fmtDateTime, money, shortId } from '../../utils/format';
import { Async, EmptyState, PageHeader, Pagination, StatusBadge } from '../../components/ui';

export default function PaymentHistory() {
  const [page, setPage] = useState(1);
  const q = useFetch('/payments/my-payments', { page, limit: 10 });

  return (
    <>
      <PageHeader title="Payment history" subtitle="Every payment and refund on your account." />
      <Async q={q} isEmpty={(d) => d.items.length === 0} empty={<EmptyState icon={CreditCard} title="No payments yet" text="Payments for your bookings will appear here." />}>
        {(d) => (
          <>
            <div className="card overflow-x-auto">
              <table className="table">
                <thead><tr><th>Date</th><th>Booking</th><th>Bike</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {d.items.map((p) => (
                    <tr key={p._id}>
                      <td className="whitespace-nowrap">{fmtDateTime(p.createdAt)}</td>
                      <td>{p.bookingId ? <Link className="font-mono text-accent hover:underline" to={`/dashboard/bookings/${p.bookingId._id}`}>{shortId(p.bookingId._id)}</Link> : '-'}</td>
                      <td>{p.bookingId?.bikeId?.name || '-'}</td>
                      <td className="capitalize">{p.paymentMethod}</td>
                      <td className="font-semibold">{money(p.amount)}</td>
                      <td><StatusBadge status={p.paymentStatus} /></td>
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
