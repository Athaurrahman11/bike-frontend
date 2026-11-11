// One booking, used by both dashboards. Customers can pay / cancel / get the invoice; admins drive the workflow.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Banknote, Check, ChevronLeft, CreditCard, FileText } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import api, { errMsg, imgUrl, onImgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmtDateTime, money, shortId } from '../utils/format';
import { Async, ConfirmDialog, Modal, Skeleton, Spinner, StatusBadge } from '../components/ui';

const STEPS = ['Pending', 'Confirmed', 'Active', 'Completed'];
const STEP_LABEL = { Pending: 'Requested', Confirmed: 'Approved', Active: 'Picked up', Completed: 'Returned' };

function Progress({ status }) {
  const current = STEPS.indexOf(status);
  if (current === -1) return <p className="rounded-lg bg-zinc-800 p-3 text-sm text-zinc-300">This booking was {status.toLowerCase()}.</p>;
  return (
    <ol className="flex items-center">
      {STEPS.map((step, i) => (
        <li key={step} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`} aria-current={i === current ? 'step' : undefined}>
          <div className="flex flex-col items-center gap-1">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= current ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-zinc-500'}`}>
              {i < current || status === 'Completed' ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-[11px] whitespace-nowrap ${i <= current ? 'text-zinc-200' : 'text-zinc-500'}`}>{STEP_LABEL[step]}</span>
          </div>
          {i < STEPS.length - 1 && <span className={`mx-2 mb-5 h-0.5 flex-1 ${i < current ? 'bg-accent' : 'bg-zinc-800'}`} />}
        </li>
      ))}
    </ol>
  );
}

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-4 py-2 text-sm">
    <dt className="text-zinc-400">{label}</dt>
    <dd className="text-right font-medium">{children}</dd>
  </div>
);

export default function BookingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const q = useFetch(`/bookings/${id}`);
  const [confirm, setConfirm] = useState(null);
  const [demo, setDemo] = useState(null); // demo-payment modal: { transactionId, amount }
  const [paying, setPaying] = useState(false);

  // runs an API call, shows the outcome, refreshes the booking
  const run = (request, success) => async () => {
    try {
      const res = await request();
      toast.success(typeof success === 'function' ? success(res.data) : success);
    } catch (err) {
      toast.error(errMsg(err));
    }
    q.reload();
  };
  const setStatus = (status, success) => run(() => api.patch(`/bookings/${id}/status`, { status }), success);
  const ask = (title, message, confirmText, onConfirm, danger) => () => setConfirm({ title, message, confirmText, onConfirm, danger });

  const pay = async () => {
    setPaying(true);
    try {
      const res = await api.post('/payments/create', { bookingId: id });
      if (res.data.url) return window.location.assign(res.data.url); // Stripe Checkout
      setDemo(res.data);
    } catch (err) {
      toast.error(errMsg(err));
      q.reload();
    } finally {
      setPaying(false);
    }
  };
  const payCash = run(() => api.post('/payments/create', { bookingId: id, method: 'cash' }), 'Cash on delivery selected. Your booking is waiting for approval.');
  const payDemo = async () => {
    setPaying(true);
    await run(() => api.post('/payments/verify', { transactionId: demo.transactionId }), 'Payment successful. Your booking is waiting for approval.')();
    setPaying(false);
    setDemo(null);
  };

  return (
    <>
      <Link to={isAdmin ? '/admin/bookings' : '/dashboard/bookings'} className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-accent">
        <ChevronLeft className="h-4 w-4" /> Back to bookings
      </Link>
      <Async q={q} skeleton={<div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>}>
        {({ booking: b, payments }) => {
          const unpaid = ['Pending', 'Failed'].includes(b.paymentStatus);
          const cod = b.paymentMethod === 'cash';
          const actions = isAdmin
            ? [
                b.bookingStatus === 'Pending' && (!unpaid || cod) && ['Approve booking', 'btn-primary', setStatus('Confirmed', 'Booking approved')],
                ['Pending', 'Confirmed'].includes(b.bookingStatus) && unpaid && ['Confirm cash received', b.bookingStatus === 'Confirmed' ? 'btn-primary' : 'btn-outline', ask('Confirm cash payment', `Record that ${money(b.totalAmount)} was received in cash for this booking?`, 'Confirm cash received', run(() => api.post('/payments/confirm', { bookingId: id }), 'Cash payment recorded'))],
                b.bookingStatus === 'Pending' && ['Reject', 'btn-danger', ask('Reject booking', 'Reject this booking request? Any payment will be refunded.', 'Reject booking', setStatus('Rejected', 'Booking rejected'), true)],
                b.bookingStatus === 'Confirmed' && !unpaid && ['Mark as picked up', 'btn-primary', ask('Start rental', 'Confirm that the customer has collected the bike?', 'Mark picked up', setStatus('Active', 'Rental started'))],
                b.bookingStatus === 'Active' && ['Mark as returned', 'btn-primary', ask('Complete rental', 'Confirm that the bike has been returned?', 'Mark returned', setStatus('Completed', 'Rental completed'))],
                b.bookingStatus === 'Confirmed' && ['Cancel booking', 'btn-danger', ask('Cancel booking', 'Cancel this confirmed booking? The customer will be refunded.', 'Cancel booking', run(() => api.patch(`/bookings/${id}/cancel`), 'Booking cancelled'), true)],
              ]
            : [
                ['Pending', 'Confirmed'].includes(b.bookingStatus) && ['Cancel booking', 'btn-danger', ask('Cancel booking', 'Are you sure you want to cancel? Any payment you made will be refunded.', 'Cancel booking', run(() => api.patch(`/bookings/${id}/cancel`), (d) => (d.refunded ? 'Booking cancelled and refunded' : 'Booking cancelled')), true)],
              ];
          const visible = actions.filter(Boolean);

          return (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold">Booking {shortId(b._id)}</h1>
                      <p className="text-sm text-zinc-400">Created {fmtDateTime(b.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge status={b.bookingStatus} />
                      <StatusBadge status={b.paymentStatus} label={`Payment: ${b.paymentStatus}`} />
                    </div>
                  </div>
                  <Progress status={b.bookingStatus} />
                </div>

                <div className="card flex flex-col gap-5 p-6 sm:flex-row">
                  <img src={imgUrl(b.bikeId?.images?.[0])} onError={onImgError} alt="" className="h-36 w-full rounded-xl object-cover sm:w-52" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-widest text-accent uppercase">{b.bikeId?.brand}</p>
                    <h2 className="text-xl font-bold">{b.bikeId?.name || 'Bike no longer listed'}</h2>
                    <dl className="mt-3 divide-y divide-zinc-800">
                      <Row label="Pickup">{fmtDateTime(b.pickupDate)}</Row>
                      <Row label="Return">{fmtDateTime(b.returnDate)}</Row>
                      <Row label="Duration">{b.rentalDays} day{b.rentalDays === 1 ? '' : 's'}</Row>
                    </dl>
                  </div>
                </div>

                {isAdmin && (
                  <div className="card p-6">
                    <h2 className="mb-2 font-bold">Customer</h2>
                    <dl className="divide-y divide-zinc-800">
                      <Row label="Name">{b.userId?.name}</Row>
                      <Row label="Email">{b.userId?.email}</Row>
                      <Row label="Phone">{b.userId?.phone || '-'}</Row>
                    </dl>
                  </div>
                )}

                {payments.length > 0 && (
                  <div className="card overflow-x-auto">
                    <h2 className="px-6 pt-5 pb-2 font-bold">Payments</h2>
                    <table className="table">
                      <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p._id}>
                            <td className="whitespace-nowrap">{fmtDateTime(p.createdAt)}</td>
                            <td className="capitalize">{p.paymentMethod}</td>
                            <td className="max-w-40 truncate font-mono text-xs text-zinc-400" title={p.transactionId}>{p.transactionId}</td>
                            <td>{money(p.amount)}</td>
                            <td><StatusBadge status={p.paymentStatus} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <aside className="space-y-6">
                <div className="card p-6">
                  <h2 className="mb-2 font-bold">Price summary</h2>
                  <dl className="divide-y divide-zinc-800">
                    <Row label={`Rental (${b.rentalDays} day${b.rentalDays === 1 ? '' : 's'})`}>{money(b.rentalPrice)}</Row>
                    <Row label="Security deposit (refundable)">{money(b.securityDeposit)}</Row>
                    <Row label="Payment method">{cod ? 'Cash on delivery' : 'Online'}</Row>
                    <div className="flex justify-between py-3 text-lg font-bold"><dt>Total</dt><dd className="text-accent">{money(b.totalAmount)}</dd></div>
                  </dl>
                  {cod && unpaid && ['Pending', 'Confirmed'].includes(b.bookingStatus) && (
                    <p className="mt-1 flex gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">
                      <Banknote className="mt-0.5 h-4 w-4 shrink-0" />
                      {isAdmin ? `Cash on delivery: collect ${money(b.totalAmount)} and confirm it before handing over the bike.` : `Cash on delivery: bring ${money(b.totalAmount)} in cash when you collect the bike.`}
                    </p>
                  )}
                  {!isAdmin && b.bookingStatus === 'Pending' && unpaid && (
                    <>
                      <button className="btn btn-primary mt-3 w-full py-3" onClick={pay} disabled={paying}>
                        {paying ? <Spinner className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />} Pay {money(b.totalAmount)} online
                      </button>
                      {!cod && (
                        <button className="btn btn-outline mt-3 w-full py-3" onClick={payCash} disabled={paying}>
                          <Banknote className="h-4 w-4" /> Cash on delivery (pay at pickup)
                        </button>
                      )}
                      <p className="mt-2 text-xs text-zinc-500">{cod ? 'Prefer to pay now? You can still pay online.' : 'Your booking is sent for approval once you pay online or choose cash on delivery.'}</p>
                    </>
                  )}
                  <Link to={`/invoice/${b._id}`} target="_blank" className="btn btn-outline mt-3 w-full">
                    <FileText className="h-4 w-4" /> Download invoice
                  </Link>
                </div>

                {visible.length > 0 && (
                  <div className="card space-y-3 p-6">
                    <h2 className="font-bold">Actions</h2>
                    {visible.map(([label, style, onClick]) => (
                      <button key={label} className={`btn ${style} w-full`} onClick={onClick}>
                        {label}
                      </button>
                    ))}
                    {!isAdmin && <p className="text-xs text-zinc-500">Pending bookings can be cancelled any time. Confirmed bookings can be cancelled up to 24 hours before pickup.</p>}
                  </div>
                )}
              </aside>
            </div>
          );
        }}
      </Async>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <Modal open={Boolean(demo)} title="Demo payment" onClose={() => !paying && setDemo(null)}>
        <p className="text-sm text-zinc-300">
          No payment gateway is configured, so this is a simulated payment. <strong>No money will be charged.</strong> Add a Stripe key on the server to take real card payments.
        </p>
        <p className="mt-4 text-center text-3xl font-black text-accent">{money(demo?.amount)}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-outline" onClick={() => setDemo(null)} disabled={paying}>Cancel</button>
          <button className="btn btn-primary" onClick={payDemo} disabled={paying}>
            {paying && <Spinner className="h-4 w-4" />} Pay now (demo)
          </button>
        </div>
      </Modal>
    </>
  );
}
