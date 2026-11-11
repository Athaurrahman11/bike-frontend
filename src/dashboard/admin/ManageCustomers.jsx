import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { clean, errMsg } from '../../services/api';
import { fmtDate, money, shortId } from '../../utils/format';
import { Async, ConfirmDialog, EmptyState, Modal, PageHeader, Pagination, StatusBadge, TableSkeleton } from '../../components/ui';
import SearchBox from './SearchBox';

function History({ customer, onClose }) {
  const q = useFetch(customer ? `/admin/users/${customer._id}` : null);
  return (
    <Modal open={Boolean(customer)} title={`Booking history: ${customer?.name}`} onClose={onClose} wide>
      <Async q={q} skeleton={<TableSkeleton rows={3} />} isEmpty={(d) => d.bookings.length === 0} empty={<p className="py-6 text-center text-sm text-zinc-400">This customer has no bookings yet.</p>}>
        {(d) => (
          <div className="max-h-96 overflow-auto">
            <table className="table">
              <thead><tr><th>Booking</th><th>Bike</th><th>Pickup</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {d.bookings.map((b) => (
                  <tr key={b._id}>
                    <td><Link to={`/admin/bookings/${b._id}`} className="font-mono text-accent hover:underline">{shortId(b._id)}</Link></td>
                    <td>{b.bikeId?.name || '-'}</td>
                    <td className="whitespace-nowrap">{fmtDate(b.pickupDate)}</td>
                    <td>{money(b.totalAmount)}</td>
                    <td><StatusBadge status={b.bookingStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Async>
    </Modal>
  );
}

export default function ManageCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const q = useFetch('/admin/users', clean({ search, page, limit: 10 }));

  const setBlocked = (customer, isBlocked) => async () => {
    try {
      await api.patch(`/admin/users/${customer._id}/block`, { isBlocked });
      toast.success(`${customer.name} ${isBlocked ? 'blocked' : 'unblocked'}`);
    } catch (err) {
      toast.error(errMsg(err));
    }
    q.reload();
  };

  return (
    <>
      <PageHeader title="Customers" subtitle="View customers, their booking history and account status.">
        <SearchBox placeholder="Search name, email or phone" onSearch={(s) => { setSearch(s); setPage(1); }} />
      </PageHeader>
      <Async q={q} isEmpty={(d) => d.items.length === 0} empty={<EmptyState icon={Users} title="No customers found" text={search ? 'Try a different search.' : 'Customers appear here when they register.'} />}>
        {(d) => (
          <>
            <div className="card overflow-x-auto">
              <table className="table">
                <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {d.items.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-zinc-400">{c.email}</p>
                      </td>
                      <td className="whitespace-nowrap">{c.phone || '-'}</td>
                      <td className="whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                      <td><StatusBadge status={c.isBlocked ? 'Blocked' : 'available'} label={c.isBlocked ? 'Blocked' : 'Active'} /></td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => setViewing(c)}>History</button>
                          {c.isBlocked ? (
                            <button className="btn btn-outline btn-sm" onClick={setBlocked(c, false)}>Unblock</button>
                          ) : (
                            <button className="btn btn-outline btn-sm text-red-400" onClick={() => setConfirm({ title: 'Block customer', message: `Block ${c.name}? They will be signed out and unable to log in or book.`, confirmText: 'Block', danger: true, onConfirm: setBlocked(c, true) })}>Block</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={d.page} pages={d.pages} onChange={setPage} />
          </>
        )}
      </Async>
      <History customer={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
