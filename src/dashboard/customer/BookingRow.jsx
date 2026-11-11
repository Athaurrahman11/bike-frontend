import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { imgUrl, onImgError } from '../../services/api';
import { fmtDateTime, money, shortId } from '../../utils/format';
import { StatusBadge } from '../../components/ui';

export default function BookingRow({ booking: b }) {
  return (
    <Link to={`/dashboard/bookings/${b._id}`} className="card flex items-center gap-4 p-4 transition hover:border-accent/60">
      <img src={imgUrl(b.bikeId?.images?.[0])} onError={onImgError} alt="" className="hidden h-16 w-24 rounded-lg object-cover sm:block" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{b.bikeId ? `${b.bikeId.brand} ${b.bikeId.name}` : 'Bike no longer listed'}</p>
        <p className="truncate text-xs text-zinc-400">{shortId(b._id)} &middot; {fmtDateTime(b.pickupDate)} &rarr; {fmtDateTime(b.returnDate)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge status={b.bookingStatus} />
          <StatusBadge status={b.paymentStatus} label={`Payment: ${b.paymentStatus}`} />
        </div>
      </div>
      <p className="font-bold whitespace-nowrap">{money(b.totalAmount)}</p>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-500" />
    </Link>
  );
}
