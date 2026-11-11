import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { Spinner } from '../components/ui';

// Stripe sends the customer back here after checkout; we ask the API to verify the session.
export default function PaymentResult() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const bookingId = params.get('booking');
  const [state, setState] = useState({ status: 'checking', message: '' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // React StrictMode runs effects twice in development
    started.current = true;
    if (!sessionId) return setState({ status: 'failed', message: 'Missing payment reference.' });
    api
      .post('/payments/verify', { transactionId: sessionId })
      .then(() => setState({ status: 'paid', message: '' }))
      .catch((err) => setState({ status: 'failed', message: errMsg(err) }));
  }, [sessionId]);

  const back = bookingId ? `/dashboard/bookings/${bookingId}` : '/dashboard/bookings';
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-md p-8 text-center" aria-live="polite">
        {state.status === 'checking' && (
          <>
            <Spinner className="mx-auto h-10 w-10 text-accent" />
            <h1 className="mt-4 text-xl font-bold">Confirming your payment...</h1>
          </>
        )}
        {state.status === 'paid' && (
          <>
            <CircleCheck className="mx-auto h-14 w-14 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
            <p className="mt-2 text-sm text-zinc-400">Your booking is now waiting for approval. We will notify you as soon as it is confirmed.</p>
          </>
        )}
        {state.status === 'failed' && (
          <>
            <CircleX className="mx-auto h-14 w-14 text-red-400" />
            <h1 className="mt-4 text-2xl font-bold">Payment not completed</h1>
            <p className="mt-2 text-sm text-zinc-400">{state.message} You can try again from your booking.</p>
          </>
        )}
        {state.status !== 'checking' && (
          <Link to={back} className="btn btn-primary mt-6">
            View booking
          </Link>
        )}
      </div>
    </div>
  );
}
