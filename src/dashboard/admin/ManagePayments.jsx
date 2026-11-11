import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { clean, errMsg } from '../../services/api';
import { fmtDateTime, money, shortId } from '../../utils/format';
import { Async, ConfirmDialog, EmptyState, PageHeader, Pagination, StatCard, StatusBadge, Tabs } from '../../components/ui';

const REFUNDABLE = ['Cancelled', 'Rejected', 'Completed'];

export default function ManagePayments() {
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const q = useFetch('/payments', clean({ status: status === 'All' ? '' : status, page, limit: 10 }));
  const revenue = useFetch('/admin/revenue', { months: 12 });

  const refund = (payment) => async () => {
    try {
      await api.post(`/payments/${payment._id}/refund`);
      toast.success('Payment refunded');
    } catch (err) {
      toast.error(errMsg(err));
    }
    q.reload();
    revenue.reload();
  };

  const monthly = revenue.data?.monthly;
  return (
    <>
      <PageHeader title="Payments" subtitle="All transactions, refunds and rental revenue.">
        <Link to="/admin/reports" className="btn btn-outline">Revenue reports</Link>
      </PageHeader>
      {monthly && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={DollarSign} label="Rental revenue, 12 months" value={money(revenue.data.total)} accent />
          <StatCard icon={TrendingUp} label="This month" value={money(monthly.at(-1).revenue)} />
          <StatCard icon={CreditCard} label="Last month" value={money(monthly.at(-2)?.revenue)} />
        </div>
      )}
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} options={['All', 'Paid', 'Pending', 'Failed', 'Refunded']} />
      <Async q={q} isEmpty={(d) => d.items.length === 0} empty={<EmptyState icon={CreditCard} title="No transactions found" text="Payments appear here as customers pay for bookings." />}>
        {(d) => (
          <>
            <div className="card overflow-x-auto">
              <table className="table">
                <thead><tr><th>Date</th><th>Customer</th><th>Booking</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {d.items.map((p) => (
                    <tr key={p._id}>
                      <td className="whitespace-nowrap">{fmtDateTime(p.createdAt)}</td>
                      <td>
                        <p className="font-semibold whitespace-nowrap">{p.userId?.name}</p>
                        <p className="text-xs text-zinc-400">{p.userId?.email}</p>
                      </td>
                      <td>
                        {p.bookingId ? <Link to={`/admin/bookings/${p.bookingId._id}`} className="font-mono text-accent hover:underline">{shortId(p.bookingId._id)}</Link> : '-'}
                        <p className="text-xs whitespace-nowrap text-zinc-400">{p.bookingId?.bikeId?.name}</p>
                      </td>
                      <td className="capitalize">{p.paymentMethod}</td>
                      <td className="max-w-32 truncate font-mono text-xs text-zinc-400" title={p.transactionId}>{p.transactionId}</td>
                      <td className="font-semibold">{money(p.amount)}</td>
                      <td><StatusBadge status={p.paymentStatus} /></td>
                      <td>
                        {p.paymentStatus === 'Paid' && REFUNDABLE.includes(p.bookingId?.bookingStatus) && (
                          <button className="btn btn-outline btn-sm" onClick={() => setConfirm({ title: 'Refund payment', message: `Refund ${money(p.amount)} to ${p.userId?.name}? This cannot be undone.`, confirmText: 'Refund', danger: true, onConfirm: refund(p) })}>Refund</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={d.page} pages={d.pages} onChange={setPage} />
          </>
        )}
      </Async>
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
