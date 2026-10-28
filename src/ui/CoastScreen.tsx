import { useEffect, useRef, type ReactElement } from 'react';
import type { CoastChoice, CoastGameState } from '../core/coastGame';
import type { GameData } from '../data/gameData';
import { flagUrl } from '../data/flags';
import { sl } from '../i18n/sl';
import { CheckIcon, CrossIcon, KindIcon } from './icons';
import './styles/coast.css';

export type CoastScreenProps = {
  game: CoastGameState;
  data: GameData;
  onPick: (choice: CoastChoice) => void;
  onNext: () => void;
  onAgain: () => void;
  onHome: () => void;
};

const LABEL: Record<CoastChoice, string> = { coastal: sl.coastal, landlocked: sl.landlocked };

export const CoastScreen = ({
  game,
  data,
  onPick,
  onNext,
  onAgain,
  onHome,
}: CoastScreenProps): ReactElement => {
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (game.picked) nextRef.current?.focus({ preventScroll: true });
  }, [game.picked]);

  if (game.done) {
    const share = game.cards.length === 0 ? 0 : game.correct / game.cards.length;
    const headline = share >= 0.8 ? 'excellent' : share >= 0.5 ? 'good' : 'practice';
    return (
      <section className="coast">
        <h1>{sl.modes.coast}</h1>
        <p className="coast__score">{sl.coastScore(game.correct, game.cards.length)}</p>
        <p className="coast__headline" data-testid="coast-headline">
          {sl.coastHeadlines[headline]}
        </p>
        <p>{sl.coastTip}</p>
        <div className="coast__actions">
          <button type="button" className="btn btn--accent btn--big" onClick={onAgain}>
            {sl.again}
          </button>
          <button type="button" className="btn btn--plain" onClick={onHome}>
            {sl.home}
          </button>
        </div>
      </section>
    );
  }

  const card = game.cards[game.index];
  const item = card ? data.itemById.get(card.itemId) : undefined;
  if (!card || !item) return <section className="coast" />;
  const flag = flagUrl(item.flag);
  const right = game.picked === card.answer;

  return (
    <section className="coast">
      <p className="coast__count">{sl.cardOf(game.index + 1, game.cards.length)}</p>
      <div className="coast__card card">
        {flag && <img src={flag} alt={sl.flagOf(item.nameSl)} width={96} height={96} />}
        <h1 data-testid="coast-name">{item.nameSl}</h1>
        <p>{sl.coastPrompt}</p>
      </div>
      <div className="coast__bins">
        {(['coastal', 'landlocked'] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            className={`btn btn--big coast__bin${game.picked && choice === card.answer ? ' coast__bin--answer' : ''}`}
            aria-pressed={game.picked === choice}
            disabled={game.picked !== undefined}
            onClick={() => onPick(choice)}
          >
            <KindIcon kind={choice === 'coastal' ? 'sea' : 'mountain'} size={32} />
            {LABEL[choice]}
          </button>
        ))}
      </div>
      {game.picked && (
        <div className={`toast coast__feedback toast--${right ? 'right' : 'wrong'}`} role="status">
          {right ? <CheckIcon /> : <CrossIcon />}
          <span>
            {right ? sl.coastRight : sl.coastWrong}{' '}
            {sl.coastAnswer(item.nameSl, LABEL[card.answer])}
          </span>
        </div>
      )}
      {game.picked && (
        <button ref={nextRef} type="button" className="btn btn--big" onClick={onNext}>
          {sl.next}
        </button>
      )}
    </section>
  );
};
