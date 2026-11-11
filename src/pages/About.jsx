import { Link } from 'react-router-dom';
import { Bike, HeartHandshake, ShieldCheck, Wrench } from 'lucide-react';

const values = [
  [Bike, 'A fleet worth riding', 'We only stock bikes we would want to ride ourselves, and we replace them before they get tired.'],
  [Wrench, 'Maintained in-house', 'Our own mechanics service every motorcycle on schedule and inspect it before each rental.'],
  [ShieldCheck, 'Safety first', 'Fully insured bikes, quality helmets and honest advice about which bike suits your experience.'],
  [HeartHandshake, 'Fair and simple', 'One daily rate, a refundable deposit and clear cancellation rules. Nothing hidden.'],
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-sm font-semibold tracking-widest text-accent uppercase">About us</p>
      <h1 className="heading mt-2 text-4xl sm:text-5xl">Built by riders, for riders</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">
        RideOn started with a simple frustration: renting a great motorcycle was harder than it should be. So we built the rental shop we always wanted. Pick a bike online, see the real price up front, and collect the keys when you arrive.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {values.map(([Icon, title, text]) => (
          <div key={title} className="card p-6">
            <Icon className="h-8 w-8 text-accent" />
            <h2 className="mt-4 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/bikes" className="btn btn-primary px-6 py-3 text-base">
          See the fleet
        </Link>
      </div>
    </div>
  );
}
