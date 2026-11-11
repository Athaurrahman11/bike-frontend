const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: import.meta.env.VITE_CURRENCY || 'USD' });

export const money = (n) => currency.format(n || 0);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '-');
export const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;

// value for <input type="datetime-local"> in the visitor's own timezone
export const toLocalInput = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Rejected'];

export const STATUS_STYLE = {
  Pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  Confirmed: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  Active: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Paid: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  available: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Cancelled: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
  Refunded: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  Rejected: 'bg-red-500/15 text-red-300 ring-red-500/30',
  Failed: 'bg-red-500/15 text-red-300 ring-red-500/30',
  Blocked: 'bg-red-500/15 text-red-300 ring-red-500/30',
  unavailable: 'bg-red-500/15 text-red-300 ring-red-500/30',
};
