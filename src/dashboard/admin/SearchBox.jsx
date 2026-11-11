import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

// Debounced search input: calls onSearch 350ms after the admin stops typing.
export default function SearchBox({ onSearch, placeholder }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => onSearch(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input className="input pl-9" type="search" placeholder={placeholder} aria-label={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}
