import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-zinc-400">Premium motorcycles, fair daily rates and no surprises. Pick a bike, pick your dates and ride.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase">Explore</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            {[['/bikes', 'Browse Bikes'], ['/about', 'About Us'], ['/contact', 'Contact Us'], ['/register', 'Create account']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-accent">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase">Contact</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> 21 Throttle Street, Motor City</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +1 (555) 010-2030</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> hello@rideon.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-500">&copy; {new Date().getFullYear()} RideOn Rentals. All rights reserved.</div>
    </footer>
  );
}
