import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarX, ChevronLeft, CircleCheck, CircleX, Fuel, Gauge, Settings2, ShieldCheck, Tag } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import api, { errMsg, imgUrl, onImgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmtDateTime, money, toLocalInput } from '../utils/format';
import { isRentable } from '../components/BikeCard';
import { ConfirmDialog, ErrorState, Skeleton, Spinner, StatusBadge } from '../components/ui';

const TERMS = [
  'A valid motorcycle licence and government ID are required at pickup.',
  'Riders must be at least 21 years old. A helmet must be worn at all times.',
  'The security deposit is refunded in full when the bike is returned undamaged and on time.',
  'Any started 24-hour period is charged as a full rental day.',
  'Pending bookings can be cancelled any time. Confirmed bookings can be cancelled for a full refund up to 24 hours before pickup.',
  'Fuel is not included. Return the bike with the same fuel level.',
];

export default function BikeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const q = useFetch(`/bikes/${id}`);
  const [active, setActive] = useState(0);
  const [dates, setDates] = useState({ pickup: '', ret: '' });
  const [quote, setQuote] = useState({ loading: false, data: null, error: '' });
  const [confirm, setConfirm] = useState(null);

  // Ask the server for availability and price whenever both dates are set (the server is the source of truth for both)
  useEffect(() => {
    if (!dates.pickup || !dates.ret) return setQuote({ loading: false, data: null, error: '' });
    let live = true;
    setQuote((s) => ({ ...s, loading: true }));
    const timer = setTimeout(() => {
      api
        .get(`/bikes/${id}/availability`, { params: { pickupDate: new Date(dates.pickup).toISOString(), returnDate: new Date(dates.ret).toISOString() } })
        .then((res) => live && setQuote({ loading: false, data: res.data, error: '' }))
        .catch((err) => live && setQuote({ loading: false, data: null, error: errMsg(err) }));
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [dates, id]);

  if (q.loading && !q.data)
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="aspect-[16/10]" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  if (q.error)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState message={q.error} onRetry={q.reload} />
      </div>
    );

  const { bike, bookedRanges } = q.data;
  const rentable = isRentable(bike);
  const images = bike.images.length ? bike.images : [null];

  const book = async () => {
    try {
      const res = await api.post('/bookings', { bikeId: bike._id, pickupDate: new Date(dates.pickup).toISOString(), returnDate: new Date(dates.ret).toISOString() });
      toast.success('Booking created. Pay online or choose cash on delivery to send it for approval.');
      navigate(`/dashboard/bookings/${res.data.booking._id}`);
    } catch (err) {
      toast.error(errMsg(err));
      q.reload();
    }
  };

  const onBookClick = () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setConfirm({
      title: 'Confirm your booking',
      message: `${bike.brand} ${bike.name} from ${fmtDateTime(dates.pickup)} to ${fmtDateTime(dates.ret)} (${quote.data.rentalDays} day${quote.data.rentalDays === 1 ? '' : 's'}). Total due: ${money(quote.data.totalAmount)}, including a refundable deposit of ${money(quote.data.securityDeposit)}.`,
      confirmText: 'Confirm booking',
      onConfirm: book,
    });
  };

  const specs = [
    [Gauge, 'Engine', bike.engineCapacity ? `${bike.engineCapacity} cc` : 'Electric motor'],
    [Fuel, 'Fuel', bike.fuelType],
    [Settings2, 'Transmission', bike.transmission],
    [Tag, 'Category', bike.category?.name || '-'],
  ];
  const now = toLocalInput(new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/bikes" className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-accent">
        <ChevronLeft className="h-4 w-4" /> Back to all bikes
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="card overflow-hidden">
            <img src={imgUrl(images[active])} onError={onImgError} alt={`${bike.brand} ${bike.name}`} className="aspect-[16/10] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === active} className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === active ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={imgUrl(src)} onError={onImgError} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">{bike.brand}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="heading text-4xl">{bike.name}</h1>
              <StatusBadge status={rentable ? 'available' : 'unavailable'} label={rentable ? 'Available' : bike.maintenanceStatus === 'good' ? 'Unavailable' : 'In maintenance'} />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map(([Icon, label, value]) => (
                <div key={label} className="card p-4">
                  <Icon className="h-5 w-5 text-accent" />
                  <dt className="mt-2 text-xs text-zinc-400">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-8 text-xl font-bold">About this bike</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-zinc-300">{bike.description || 'No description provided.'}</p>

            <h2 className="mt-8 text-xl font-bold">Rental terms &amp; conditions</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {TERMS.map((term) => (
                <li key={term} className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {term}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside>
          <div className="card p-6 lg:sticky lg:top-24">
            <p>
              <span className="text-3xl font-black">{money(bike.pricePerDay)}</span>
              <span className="text-zinc-400"> / day</span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">+ {money(bike.securityDeposit)} refundable security deposit</p>

            {!rentable ? (
              <p className="mt-6 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                <CircleX className="h-4 w-4 shrink-0" /> This bike is not available for rent right now.
              </p>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="label">Pickup date &amp; time</span>
                    <input type="datetime-local" className="input" min={now} value={dates.pickup} onChange={(e) => setDates({ ...dates, pickup: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="label">Return date &amp; time</span>
                    <input type="datetime-local" className="input" min={dates.pickup || now} value={dates.ret} onChange={(e) => setDates({ ...dates, ret: e.target.value })} />
                  </label>
                </div>

                <div className="mt-5 min-h-28" aria-live="polite">
                  {quote.loading && <p className="flex items-center gap-2 text-sm text-zinc-400"><Spinner className="h-4 w-4" /> Checking availability...</p>}
                  {!quote.loading && quote.error && <p className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"><CircleX className="h-4 w-4 shrink-0" /> {quote.error}</p>}
                  {!quote.loading && quote.data && (
                    <>
                      <p className={`mb-3 flex items-center gap-2 rounded-lg p-3 text-sm ${quote.data.available ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                        {quote.data.available ? <CircleCheck className="h-4 w-4 shrink-0" /> : <CircleX className="h-4 w-4 shrink-0" />}
                        {quote.data.available ? 'Available for your dates' : quote.data.reason}
                      </p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt className="text-zinc-400">Duration</dt><dd>{quote.data.rentalDays} day{quote.data.rentalDays === 1 ? '' : 's'}</dd></div>
                        <div className="flex justify-between"><dt className="text-zinc-400">Rental ({money(bike.pricePerDay)} x {quote.data.rentalDays})</dt><dd>{money(quote.data.rentalPrice)}</dd></div>
                        <div className="flex justify-between"><dt className="text-zinc-400">Security deposit (refundable)</dt><dd>{money(quote.data.securityDeposit)}</dd></div>
                        <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-bold"><dt>Total due now</dt><dd className="text-accent">{money(quote.data.totalAmount)}</dd></div>
                      </dl>
                    </>
                  )}
                  {!quote.loading && !quote.data && !quote.error && <p className="text-sm text-zinc-500">Select both dates to see availability and the total price.</p>}
                </div>

                <button className="btn btn-primary mt-4 w-full py-3 text-base" disabled={!quote.data?.available || quote.loading || user?.role === 'admin'} onClick={onBookClick}>
                  {!user ? 'Log in to book' : user.role === 'admin' ? 'Bookings are made from customer accounts' : 'Book now'}
                </button>
              </>
            )}

            {bookedRanges.length > 0 && (
              <div className="mt-6 border-t border-zinc-800 pt-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarX className="h-4 w-4 text-accent" /> Already booked</p>
                <ul className="space-y-1 text-xs text-zinc-400">
                  {bookedRanges.map((r) => (
                    <li key={r.pickupDate}>{fmtDateTime(r.pickupDate)} &rarr; {fmtDateTime(r.returnDate)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
