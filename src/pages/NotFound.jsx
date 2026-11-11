import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="heading text-8xl text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">You took a wrong turn</h1>
      <p className="mt-2 text-zinc-400">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
