import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';

// GET a URL and track loading / error. Old data stays visible while a reload is in flight.
export default function useFetch(url, params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(params || {});

  useEffect(() => {
    if (!url) return;
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(url, { params: JSON.parse(key) })
      .then((res) => live && setState({ data: res.data, loading: false, error: null }))
      .catch((err) => live && setState({ data: null, loading: false, error: errMsg(err) }));
    return () => {
      live = false;
    };
  }, [url, key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
