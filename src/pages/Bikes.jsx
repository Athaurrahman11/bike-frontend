import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { clean } from '../services/api';
import BikeCard, { BikeGridSkeleton } from '../components/BikeCard';
import { Async, EmptyState, Pagination } from '../components/ui';

const ENGINES = [
  ['', 'Any engine size'],
  ['0-150', 'Up to 150 cc'],
  ['151-400', '151 - 400 cc'],
  ['401-800', '401 - 800 cc'],
  ['801-', 'Over 800 cc'],
];

// Filters live in the URL, so results can be shared, bookmarked and survive the back button.
export default function Bikes() {
  const [params, setParams] = useSearchParams();
  const get = (key) => params.get(key) || '';
  const [search, setSearch] = useState(get('search'));
  const [showFilters, setShowFilters] = useState(false);
  const categories = useFetch('/categories');

  const set = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  // debounce typing so we do not query on every keystroke
  useEffect(() => {
    if (search === get('search')) return;
    const timer = setTimeout(() => set({ search }), 350);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const [minEngine, maxEngine] = get('engine').split('-');
  const bikes = useFetch(
    '/bikes',
    clean({
      search: get('search'), category: get('category'), minPrice: get('minPrice'), maxPrice: get('maxPrice'),
      minEngine, maxEngine, available: get('available'), sort: get('sort') || 'popular', page: get('page'), limit: 9,
    })
  );
  const hasFilters = [...params.keys()].some((k) => k !== 'page' && k !== 'sort');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="heading text-4xl">Browse bikes</h1>
      <p className="mt-2 text-zinc-400">{bikes.data ? `${bikes.data.total} motorcycle${bikes.data.total === 1 ? '' : 's'} found` : 'Finding motorcycles...'}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input className="input pl-9" type="search" placeholder="Search by name or brand" aria-label="Search bikes" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-56" aria-label="Sort by" value={get('sort') || 'popular'} onChange={(e) => set({ sort: e.target.value })}>
          <option value="popular">Most popular</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="newest">Newest</option>
        </select>
        <button className="btn btn-outline lg:hidden" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="card space-y-5 p-5 lg:sticky lg:top-24">
            <div>
              <label className="label" htmlFor="f-category">Category</label>
              <select id="f-category" className="input" value={get('category')} onChange={(e) => set({ category: e.target.value })}>
                <option value="">All categories</option>
                {categories.data?.categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">Price per day</legend>
              <div className="flex items-center gap-2">
                <input className="input" type="number" min="0" placeholder="Min" aria-label="Minimum price" value={get('minPrice')} onChange={(e) => set({ minPrice: e.target.value })} />
                <span className="text-zinc-500">-</span>
                <input className="input" type="number" min="0" placeholder="Max" aria-label="Maximum price" value={get('maxPrice')} onChange={(e) => set({ maxPrice: e.target.value })} />
              </div>
            </fieldset>
            <div>
              <label className="label" htmlFor="f-engine">Engine capacity</label>
              <select id="f-engine" className="input" value={get('engine')} onChange={(e) => set({ engine: e.target.value })}>
                {ENGINES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={get('available') === 'true'} onChange={(e) => set({ available: e.target.checked ? 'true' : '' })} />
              Available bikes only
            </label>
            {hasFilters && (
              <button className="btn btn-outline w-full" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <section aria-label="Results">
          <Async
            q={bikes}
            skeleton={<BikeGridSkeleton count={9} />}
            isEmpty={(d) => d.items.length === 0}
            empty={<EmptyState icon={Search} title="No bikes match your filters" text="Try a different search or clear some filters." />}
          >
            {(d) => (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {d.items.map((bike) => (
                    <BikeCard key={bike._id} bike={bike} />
                  ))}
                </div>
                <Pagination page={d.page} pages={d.pages} onChange={(page) => { set({ page: String(page) }); window.scrollTo(0, 0); }} />
              </>
            )}
          </Async>
        </section>
      </div>
    </div>
  );
}
