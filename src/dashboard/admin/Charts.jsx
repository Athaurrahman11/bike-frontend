// Thin wrappers so every chart in the admin area shares one dark-theme look.
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../../utils/format';

const axis = { stroke: '#71717a', fontSize: 12, tickLine: false, axisLine: false };
const tooltip = { contentStyle: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fafafa' }, cursor: { fill: '#27272a55' } };
const compact = new Intl.NumberFormat(undefined, { notation: 'compact' });

export const monthLabel = (ym) => new Date(`${ym}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short' });

export function ChartCard({ title, children, empty }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-bold">{title}</h2>
      {empty ? <p className="grid h-64 place-items-center text-sm text-zinc-500">No data for this period yet.</p> : <div className="h-64">{children}</div>}
    </div>
  );
}

export function RevenueChart({ data, xKey, formatX }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 5 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#27272a" vertical={false} />
        <XAxis dataKey={xKey} tickFormatter={formatX} {...axis} />
        <YAxis tickFormatter={(v) => compact.format(v)} width={44} {...axis} />
        <Tooltip {...tooltip} labelFormatter={formatX} formatter={(v) => [money(v), 'Revenue']} />
        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CountChart({ data, xKey, yKey, label, formatX, formatY }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 5 }}>
        <CartesianGrid stroke="#27272a" vertical={false} />
        <XAxis dataKey={xKey} tickFormatter={formatX} {...axis} />
        <YAxis allowDecimals={false} tickFormatter={formatY || ((v) => compact.format(v))} width={44} {...axis} />
        <Tooltip {...tooltip} labelFormatter={formatX} formatter={(v) => [formatY ? formatY(v) : v, label]} />
        <Bar dataKey={yKey} fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
