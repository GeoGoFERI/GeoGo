import { useEffect, useRef, type ReactElement } from 'react';
import { sl } from '../i18n/sl';
import { CheckIcon } from './icons';

export type FactCardProps = {
  name: string;
  praise: string;
  onNext: () => void;
};

export function FactCard({ name, praise, onNext }: FactCardProps): ReactElement {
  const nextRef = useRef<HTMLButtonElement>(null);
  // Focus "Naprej" so keyboard users can continue at once.
  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="fact" role="dialog" aria-labelledby="fact-title">
      <p className="fact__praise">
        <CheckIcon />
        {praise}
      </p>
      <h2 id="fact-title">{name}</h2>
      <button ref={nextRef} type="button" className="btn btn--big" onClick={onNext}>
        {sl.next}
      </button>
    </div>
  );
}
