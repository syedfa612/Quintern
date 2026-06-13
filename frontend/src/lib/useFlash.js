import { useEffect, useRef, useState } from 'react';

// "Flash" a string for `ms` then clear it. Cancellable: starting a new flash
// resets the timer instead of overlapping (which was the prior bug).
export function useFlash(ms = 2500) {
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const timer = useRef(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const flash = (text) => {
    if (timer.current) clearTimeout(timer.current);
    setMsg(text);
    timer.current = setTimeout(() => setMsg(''), ms);
  };

  const flashError = (text) => {
    if (timer.current) clearTimeout(timer.current);
    setErr(text);
    timer.current = setTimeout(() => setErr(''), ms);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    setMsg('');
    setErr('');
  };

  return { message: msg, error: err, flash, flashError, clear };
}
