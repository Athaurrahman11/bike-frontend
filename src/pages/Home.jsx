import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CreditCard, Search, ShieldCheck, Wrench, Zap } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import BikeCard, { BikeGridSkeleton } from '../components/BikeCard';
import { Async, EmptyState } from '../components/ui';

const HERO = 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=1920&q=70&auto=format&fit=crop';

const steps = [
  [Search, 'Choose your bike', 'Browse sport, cruiser, classic and electric motorcycles with clear daily prices.'],
  [CalendarCheck, 'Pick your dates', 'Select pickup and return times. We check availability and price it instantly.'],
  [CreditCard, 'Pay your way', 'Pay online, or choose cash on delivery and pay when you collect the bike.'],
  [Zap, 'Ride', 'Once we approve your booking, collect the keys and hit the road.'],
];

const perks = [
  [ShieldCheck, 'Insured & inspected', 'Every bike is insured and checked before each rental.'],
  [Wrench, 'Workshop maintained', 'Serviced on schedule by our own mechanics.'],
  [CreditCard, 'Transparent pricing', 'One daily rate. Your deposit comes back when the bike does.'],
];

export default function Home() {
  const popular = useFetch('/bikes', { sort: 'popular', limit: 6, available: true });
  const categories = useFetch('/categories');

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/30" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-36">
          <p className="rise mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase">Premium motorcycle rentals</p>
          <h1 className="heading rise max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
            Rent the ride. <span className="text-accent">Own the road.</span>
          </h1>
          <p className="rise mt-6 max-w-xl text-lg text-zinc-300">From nimble city bikes to litre-class legends. Book in minutes, ride for a day or a month.</p>
          <div className="rise mt-8 flex flex-wrap gap-4">
            <Link to="/bikes" className="btn btn-primary px-6 py-3 text-base">
              Browse bikes <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/about" className="btn btn-outline px-6 py-3 text-base">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Most rented</p>
            <h2 className="heading mt-1 text-3xl sm:text-4xl">Popular bikes</h2>
          </div>
          <Link to="/bikes" className="hidden items-center gap-1 text-sm font-semibold text-accent hover:underline sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Async
          q={popular}
          skeleton={<BikeGridSkeleton />}
          isEmpty={(d) => d.items.length === 0}
          empty={<EmptyState title="No bikes yet" text="Run the seed script or add bikes from the admin dashboard." />}
        >
          {(d) => (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {d.items.map((bike) => (
                <BikeCard key={bike._id} bike={bike} />
              ))}
            </div>
          )}
        </Async>
      </section>

      {categories.data?.categories.length > 0 && (
        <section className="border-y border-zinc-800 bg-zinc-900/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="heading mb-8 text-3xl sm:text-4xl">Ride your style</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {categories.data.categories.map((c) => (
                <Link key={c._id} to={`/bikes?category=${c._id}`} className="card group p-5 transition hover:-translate-y-1 hover:border-accent/60">
                  <h3 className="text-lg font-bold group-hover:text-accent">{c.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{c.description}</p>
                  <p className="mt-3 text-xs font-semibold text-accent">{c.bikeCount} bike{c.bikeCount === 1 ? '' : 's'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="heading mb-10 text-center text-3xl sm:text-4xl">How it works</h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([Icon, title, text], i) => (
            <li key={title} className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-zinc-950">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="heading text-4xl text-zinc-800">0{i + 1}</span>
              </div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {perks.map(([Icon, title, text]) => (
            <div key={title} className="flex gap-4">
              <Icon className="h-8 w-8 shrink-0 text-accent" />
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl bg-accent px-8 py-10 text-zinc-950 md:flex-row">
          <div>
            <h2 className="heading text-3xl">Ready when you are</h2>
            <p className="mt-1 font-medium">Create a free account and book your first ride today.</p>
          </div>
          <Link to="/bikes" className="btn bg-zinc-950 px-6 py-3 text-base text-white hover:bg-zinc-800">
            Find my bike <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
