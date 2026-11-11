import { Link } from 'react-router-dom';
import { Bike } from 'lucide-react';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-zinc-950">
        <Bike className="h-5 w-5" />
      </span>
      <span className="heading text-xl">
        Ride<span className="text-accent">On</span>
      </span>
    </Link>
  );
}
