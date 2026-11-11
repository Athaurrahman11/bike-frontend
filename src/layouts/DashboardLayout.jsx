import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bike, CalendarCheck, ChartColumn, CreditCard, LayoutDashboard, LogOut, Menu, Search, Tags, User, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { imgUrl, onImgError } from '../services/api';
import Logo from '../components/Logo';
import NotificationBell from '../components/NotificationBell';

const NAV = {
  customer: [
    ['/dashboard', 'Overview', LayoutDashboard],
    ['/bikes', 'Browse Bikes', Search],
    ['/dashboard/bookings', 'My Bookings', CalendarCheck],
    ['/dashboard/payments', 'Payment History', CreditCard],
    ['/dashboard/profile', 'My Profile', User],
  ],
  admin: [
    ['/admin', 'Dashboard', LayoutDashboard],
    ['/admin/bikes', 'Bikes', Bike],
    ['/admin/bookings', 'Bookings', CalendarCheck],
    ['/admin/customers', 'Customers', Users],
    ['/admin/payments', 'Payments', CreditCard],
    ['/admin/categories', 'Categories', Tags],
    ['/admin/reports', 'Reports', ChartColumn],
    ['/admin/profile', 'My Profile', User],
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen lg:pl-64">
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <Logo />
          <button className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV[user.role].map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/admin'}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-accent text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
            >
              <Icon className="h-4.5 w-4.5" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-zinc-800 p-3">
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white">
            <LogOut className="h-4.5 w-4.5" /> Log out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/85 px-4 backdrop-blur sm:px-6">
        <button className="rounded-md p-2 text-zinc-300 hover:bg-zinc-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <p className="hidden text-sm text-zinc-400 lg:block">{user.role === 'admin' ? 'Admin panel' : 'Customer dashboard'}</p>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-semibold">{user.name}</p>
              <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
            </div>
            {user.profileImage ? (
              <img src={imgUrl(user.profileImage)} onError={onImgError} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-700" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-bold text-zinc-950">{user.name[0]?.toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
