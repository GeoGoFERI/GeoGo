import type { CSSProperties, ReactElement } from 'react';

const COLOURS = ['--geogo-yellow', '--geogo-sky', '--geogo-green', '--geogo-orange'];
const PIECES = 14;

export function Confetti(): ReactElement {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2;
        const style = {
          '--dx': `${String(Math.round(Math.cos(angle) * 120))}px`,
          '--dy': `${String(Math.round(Math.sin(angle) * 80 - 40))}px`,
          background: `var(${COLOURS[i % COLOURS.length] ?? '--geogo-yellow'})`,
        } as CSSProperties;
        return <span key={i} className="confetti__piece" style={style} />;
      })}
    </div>
  );
}
