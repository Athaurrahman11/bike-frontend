// Small shared building blocks used across the public site and both dashboards.
import { useEffect, useId, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { STATUS_STYLE } from '../utils/format';

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-lg bg-zinc-800 ${className}`} />;

export const Spinner = ({ className = 'h-5 w-5' }) => <LoaderCircle className={`animate-spin ${className}`} aria-label="Loading" />;

export const FullPageSpinner = () => (
  <div className="grid min-h-screen place-items-center text-accent">
    <Spinner className="h-8 w-8" />
  </div>
);

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-zinc-800 text-zinc-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-zinc-400">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="card flex flex-col items-center border-red-900/60 px-6 py-12 text-center">
      <TriangleAlert className="mb-3 h-8 w-8 text-red-400" />
      <h3 className="text-lg font-semibold">Could not load this</h3>
      <p className="mt-1 text-sm text-zinc-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline mt-5">
          Try again
        </button>
      )}
    </div>
  );
}

// Renders the right state for a useFetch() result: skeleton -> error -> empty -> content
export function Async({ q, skeleton, isEmpty, empty, children }) {
  if (q.loading && !q.data) return skeleton ?? <TableSkeleton />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;
  if (isEmpty?.(q.data)) return empty;
  return <div className={q.loading ? 'opacity-60 transition' : 'transition'}>{children(q.data)}</div>;
}

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="card space-y-3 p-4">
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} className="h-10" />
    ))}
  </div>
);

export const StatusBadge = ({ status, label }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap capitalize ring-1 ring-inset ${STATUS_STYLE[status] || STATUS_STYLE.Cancelled}`}>
    {label || String(status).replace('_', ' ')}
  </span>
);

export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3 text-sm">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      <span className="text-zinc-400">
        Page {page} of {pages}
      </span>
      <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export function Modal({ open, title, onClose, children, wide }) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={`card rise w-full p-6 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Pass `state` = null (closed) or { title, message, confirmText, danger, onConfirm }
export function ConfirmDialog({ state, onClose }) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await state.onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={Boolean(state)} title={state?.title} onClose={busy ? () => {} : onClose}>
      <p className="text-sm text-zinc-300">{state?.message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-outline" onClick={onClose} disabled={busy}>
          Back
        </button>
        <button className={`btn ${state?.danger ? 'btn-danger' : 'btn-primary'}`} onClick={confirm} disabled={busy} autoFocus>
          {busy && <Spinner className="h-4 w-4" />} {state?.confirmText || 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}

export function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${accent ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-accent'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</p>
        <p className="truncate text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export function Field({ label, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-400">
          {error.message || error}
        </span>
      )}
    </label>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

export function Tabs({ value, onChange, options }) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${value === opt ? 'bg-accent text-zinc-950' : 'bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
