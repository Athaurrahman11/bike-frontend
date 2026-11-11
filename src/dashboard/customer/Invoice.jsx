import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { fmtDate, fmtDateTime, money, shortId } from '../../utils/format';
import { ErrorState, FullPageSpinner } from '../../components/ui';

// Print-ready invoice. "Download" uses the browser's own Save as PDF, so no PDF library is needed.
export default function Invoice() {
  const { id } = useParams();
  const q = useFetch(`/bookings/${id}`);
  if (q.loading && !q.data) return <FullPageSpinner />;
  if (q.error) return <div className="mx-auto max-w-xl p-10"><ErrorState message={q.error} onRetry={q.reload} /></div>;

  const { booking: b, payments } = q.data;
  const paid = payments.find((p) => ['Paid', 'Refunded'].includes(p.paymentStatus));

  return (
    <div className="min-h-screen bg-zinc-200 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl justify-end px-4">
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Download / print PDF
        </button>
      </div>
      <article className="mx-auto max-w-3xl bg-white p-10 text-zinc-900 shadow-xl print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-zinc-900 pb-6">
          <div>
            <p className="text-3xl font-black tracking-tight uppercase italic">Ride<span className="text-orange-500">On</span></p>
            <p className="mt-1 text-sm text-zinc-500">21 Throttle Street, Motor City</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-sm text-zinc-500">No. INV-{shortId(b._id).slice(1)}</p>
            <p className="text-sm text-zinc-500">Issued {fmtDate(b.createdAt)}</p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <h2 className="mb-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">Billed to</h2>
            <p className="font-semibold">{b.userId?.name}</p>
            <p>{b.userId?.email}</p>
            <p>{b.userId?.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="mb-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">Booking</h2>
            <p>Status: <strong>{b.bookingStatus}</strong></p>
            <p>Payment: <strong>{b.paymentStatus}</strong></p>
            {paid && <p className="break-all text-xs text-zinc-500">Ref: {paid.transactionId}</p>}
          </div>
        </section>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-left text-xs tracking-wider text-zinc-500 uppercase">
              <th className="py-2">Description</th><th className="py-2 text-right">Days</th><th className="py-2 text-right">Rate</th><th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-200">
              <td className="py-3">
                <p className="font-semibold">{b.bikeId ? `${b.bikeId.brand} ${b.bikeId.name}` : 'Motorcycle'} rental</p>
                <p className="text-xs text-zinc-500">{fmtDateTime(b.pickupDate)} to {fmtDateTime(b.returnDate)}</p>
              </td>
              <td className="py-3 text-right">{b.rentalDays}</td>
              <td className="py-3 text-right">{money(b.rentalPrice / b.rentalDays)}</td>
              <td className="py-3 text-right">{money(b.rentalPrice)}</td>
            </tr>
            <tr className="border-b border-zinc-200">
              <td className="py-3" colSpan="3">Security deposit (refundable)</td>
              <td className="py-3 text-right">{money(b.securityDeposit)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 text-right text-base font-bold" colSpan="3">Total</td>
              <td className="pt-4 text-right text-base font-bold">{money(b.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
          The security deposit is returned in full when the motorcycle is returned undamaged and on time. Thank you for riding with RideOn.
        </footer>
      </article>
    </div>
  );
}
