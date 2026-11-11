import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext';
import Logo from './Logo';

const links = [
  ['/', 'Home'],
  ['/bikes', 'Browse Bikes'],
  ['/about', 'About Us'],
  ['/contact', 'Contact'],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }) => `text-sm font-medium transition hover:text-accent ${isActive ? 'text-accent' : 'text-zinc-300'}`;
  const authButtons = user ? (
    <>
      <Link to={homeFor(user)} className="btn btn-primary">
        Dashboard
      </Link>
      <button onClick={logout} className="btn btn-outline">
        Log out
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-outline">
        Log in
      </Link>
      <Link to="/register" className="btn btn-primary">
        Sign up
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">{authButtons}</div>
        <button className="rounded-md p-2 text-zinc-300 hover:bg-zinc-800 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-zinc-800 px-4 py-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-5 flex gap-3">{authButtons}</div>
        </div>
      )}
    </header>
  );
}
