import type { ReactElement } from 'react';
import { BulbIcon, CrossIcon } from './icons';

export type ToastKind = 'wrong' | 'hint';

export function FeedbackToast({ kind, text }: { kind: ToastKind; text: string }): ReactElement {
  return (
    <div className={`toast toast--${kind}${kind === 'wrong' ? ' shake' : ''}`} role="status">
      {kind === 'wrong' ? <CrossIcon /> : <BulbIcon />}
      <span>{text}</span>
    </div>
  );
}
