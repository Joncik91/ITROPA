import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { isPinned, pinKey, togglePin, type NewPin } from './pins';

/** Save-to-pins toggle. Never sits inside a folded summary: a button there would be a button inside a button. */
export const PinStar = ({ pin, onChange }: { pin: NewPin; onChange?: () => void }) => {
  const key = pinKey(pin);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false);
  useEffect(() => { let live = true; isPinned(key).then((v) => live && setOn(v)).catch(() => undefined); return () => { live = false; }; }, [key]);
  const flip = async () => {
    if (busy.current) return; // one write at a time; a second tap waits for the first to land
    busy.current = true;
    try { setOn(await togglePin(pin)); setFailed(false); onChange?.(); } catch { setFailed(true); } finally { busy.current = false; }
  };
  return (
    <>
      <button
        type="button"
        aria-pressed={on}
        aria-label={`Pin: ${pin.label}`}
        onClick={flip}
        className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-line text-accent shrink-0"
      >
        <Star className={`w-5 h-5 ${on ? 'fill-current' : ''}`} aria-hidden />
      </button>
      {failed && <span role="alert" className="text-xs text-bad">Could not save the pin.</span>}
    </>
  );
};
