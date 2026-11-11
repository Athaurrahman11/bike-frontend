import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';
import { fmtDateTime } from '../utils/format';

// shortcut: polls every 60s instead of a Socket.IO push; switch if notifications must be instant.
export default function NotificationBell() {
  const [data, setData] = useState({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const load = () => api.get('/notifications').then((res) => setData(res.data)).catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e) => (e.key === 'Escape' || (e.type === 'mousedown' && !box.current?.contains(e.target))) && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const toggle = () => {
    setOpen(!open);
    if (!open && data.unread) {
      api.patch('/notifications/read-all').catch(() => {});
      setData((d) => ({ ...d, unread: 0 }));
    }
  };

  return (
    <div className="relative" ref={box}>
      <button onClick={toggle} aria-label={`Notifications${data.unread ? `, ${data.unread} unread` : ''}`} aria-expanded={open} className="relative rounded-lg p-2 text-zinc-300 hover:bg-zinc-800">
        <Bell className="h-5 w-5" />
        {data.unread > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-zinc-950">{data.unread > 9 ? '9+' : data.unread}</span>}
      </button>
      {open && (
        <div className="card rise absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto shadow-2xl">
          <p className="border-b border-zinc-800 px-4 py-3 text-sm font-semibold">Notifications</p>
          {data.items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">You are all caught up.</p>
          ) : (
            <ul>
              {data.items.map((n) => (
                <li key={n._id} className="border-b border-zinc-800 px-4 py-3 last:border-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{n.message}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{fmtDateTime(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
