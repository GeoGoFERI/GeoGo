import type { ReactElement } from 'react';
import type { LevelId } from '../core/item';
import { sl } from '../i18n/sl';
import { LevelIcon, StarIcon } from './icons';

export const Sticker = ({ level, earned }: { level: LevelId; earned: boolean }): ReactElement => {
  const name = sl.levels[level];
  return (
    <figure
      className={`sticker${earned ? ' sticker--earned' : ''}`}
      data-testid={`sticker-${String(level)}`}
    >
      <div className="sticker__badge" aria-hidden="true">
        <LevelIcon level={level} size={44} />
        {earned && (
          <span className="sticker__star">
            <StarIcon size={22} />
          </span>
        )}
      </div>
      <figcaption>{earned ? name : sl.stickerLocked(name)}</figcaption>
    </figure>
  );
};
