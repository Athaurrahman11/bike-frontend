import { Link } from 'react-router-dom';
import { ArrowRight, Fuel, Gauge, Settings2 } from 'lucide-react';
import { imgUrl, onImgError } from '../services/api';
import { money } from '../utils/format';
import { Skeleton, StatusBadge } from './ui';

export const isRentable = (bike) => bike.availabilityStatus === 'available' && bike.maintenanceStatus === 'good';

export default function BikeCard({ bike }) {
  const rentable = isRentable(bike);
  return (
    <Link to={`/bikes/${bike._id}`} className="card group rise flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        <img src={imgUrl(bike.images?.[0])} onError={onImgError} alt={`${bike.brand} ${bike.name}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {bike.category?.name && <span className="absolute top-3 left-3 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-semibold backdrop-blur">{bike.category.name}</span>}
        <span className="absolute top-3 right-3">
          <StatusBadge status={rentable ? 'available' : 'unavailable'} label={rentable ? 'Available' : bike.maintenanceStatus === 'good' ? 'Unavailable' : 'In maintenance'} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">{bike.brand}</p>
        <h3 className="mt-1 text-lg font-bold">{bike.name}</h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
          <li className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {bike.engineCapacity ? `${bike.engineCapacity} cc` : 'Electric'}</li>
          <li className="flex items-center gap-1"><Settings2 className="h-3.5 w-3.5" /> {bike.transmission}</li>
          <li className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {bike.fuelType}</li>
        </ul>
        <div className="mt-auto flex items-end justify-between pt-5">
          <p>
            <span className="text-2xl font-black">{money(bike.pricePerDay)}</span>
            <span className="text-sm text-zinc-400"> / day</span>
          </p>
          <span className="flex items-center gap-1 text-sm font-semibold text-accent">
            Details <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export const BikeCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-7 w-24" />
    </div>
  </div>
);

export const BikeGridSkeleton = ({ count = 6 }) => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }, (_, i) => (
      <BikeCardSkeleton key={i} />
    ))}
  </div>
);
