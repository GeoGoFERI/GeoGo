import { useEffect, useRef, type ReactElement } from 'react';
import type { ItemKind } from '../core/item';
import { sl } from '../i18n/sl';
import type { FactContent } from './factContent';
import { CheckIcon, KindIcon } from './icons';

export type FactCardProps = {
  content: FactContent;
  kind: ItemKind;
  praise: string;
  onNext: () => void;
};

export function FactCard({ content, kind, praise, onNext }: FactCardProps): ReactElement {
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
      <h2 id="fact-title" className="fact__title">
        {content.flagUrl ? (
          <img
            className="flag flag--big"
            src={content.flagUrl}
            alt={sl.flagOf(content.title)}
            width={44}
            height={44}
          />
        ) : (
          <KindIcon kind={kind} />
        )}
        {content.title}
      </h2>
      {content.lines.length > 0 && (
        <ul className="fact__lines">
          {content.lines.map((line) => (
            <li key={line.label}>
              {line.value ? (
                <>
                  <strong>{line.label}:</strong> {line.value}
                </>
              ) : (
                <strong>{line.label}</strong>
              )}
            </li>
          ))}
        </ul>
      )}
      {content.text && <p className="fact__text">{content.text}</p>}
      <button ref={nextRef} type="button" className="btn btn--big" onClick={onNext}>
        {sl.next}
      </button>
    </div>
  );
}
