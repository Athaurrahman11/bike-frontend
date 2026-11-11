import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bike, Pencil, Plus, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { clean, errMsg, imgUrl, onImgError } from '../../services/api';
import { money } from '../../utils/format';
import { Async, ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../components/ui';
import SearchBox from './SearchBox';

export default function ManageBikes() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const q = useFetch('/bikes', clean({ search, page, limit: 10 }));

  const patch = async (bike, changes) => {
    try {
      await api.put(`/bikes/${bike._id}`, changes);
      toast.success(`${bike.name} updated`);
    } catch (err) {
      toast.error(errMsg(err));
    }
    q.reload();
  };
  const remove = (bike) => async () => {
    try {
      await api.delete(`/bikes/${bike._id}`);
      toast.success(`${bike.name} deleted`);
    } catch (err) {
      toast.error(errMsg(err));
    }
    q.reload();
  };

  return (
    <>
      <PageHeader title="Bikes" subtitle="Add motorcycles, set prices and control availability.">
        <SearchBox placeholder="Search name or brand" onSearch={(s) => { setSearch(s); setPage(1); }} />
        <Link to="/admin/bikes/new" className="btn btn-primary"><Plus className="h-4 w-4" /> Add bike</Link>
      </PageHeader>
      <Async q={q} isEmpty={(d) => d.items.length === 0} empty={<EmptyState icon={Bike} title="No bikes found" text={search ? 'Try a different search.' : 'Add your first motorcycle to get started.'} action={<Link to="/admin/bikes/new" className="btn btn-primary">Add bike</Link>} />}>
        {(d) => (
          <>
            <div className="card overflow-x-auto">
              <table className="table">
                <thead><tr><th>Bike</th><th>Category</th><th>Price / day</th><th>Deposit</th><th>Availability</th><th>Maintenance</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {d.items.map((bike) => (
                    <tr key={bike._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={imgUrl(bike.images?.[0])} onError={onImgError} alt="" className="h-11 w-16 rounded-md object-cover" />
                          <div>
                            <p className="font-semibold whitespace-nowrap">{bike.name}</p>
                            <p className="text-xs text-zinc-400">{bike.brand} &middot; {bike.engineCapacity ? `${bike.engineCapacity} cc` : 'Electric'}</p>
                          </div>
                        </div>
                      </td>
                      <td>{bike.category?.name || '-'}</td>
                      <td className="font-semibold">{money(bike.pricePerDay)}</td>
                      <td>{money(bike.securityDeposit)}</td>
                      <td>
                        <select className="input w-36 py-1.5" aria-label={`Availability of ${bike.name}`} value={bike.availabilityStatus} onChange={(e) => patch(bike, { availabilityStatus: e.target.value })}>
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </td>
                      <td>
                        <select className="input w-40 py-1.5" aria-label={`Maintenance status of ${bike.name}`} value={bike.maintenanceStatus} onChange={(e) => patch(bike, { maintenanceStatus: e.target.value })}>
                          <option value="good">Good</option>
                          <option value="in_maintenance">In maintenance</option>
                        </select>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/bikes/${bike._id}/edit`} className="btn btn-outline btn-sm" aria-label={`Edit ${bike.name}`}><Pencil className="h-4 w-4" /></Link>
                          <button className="btn btn-outline btn-sm text-red-400" aria-label={`Delete ${bike.name}`} onClick={() => setConfirm({ title: 'Delete bike', message: `Delete ${bike.brand} ${bike.name}? This cannot be undone.`, confirmText: 'Delete', danger: true, onConfirm: remove(bike) })}>
                            <Trash2 className="h-4 w-4" />
                          </button>
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
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
