import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import type { LevelId } from '../core/item';
import { levelById } from '../core/levels';
import type { QuestionState } from '../core/question';
import type { GameData } from '../data/gameData';
import { flagUrl } from '../data/flags';
import { MapView, type MapHandle } from '../map/MapView';
import type { ShapeState } from '../map/types';
import { sl } from '../i18n/sl';
import { FeedbackToast } from './FeedbackToast';
import { PromptBanner } from './PromptBanner';
import { neighbourHint } from './hints';
import { BulbIcon } from './icons';
import type { Round } from './game';
import './styles/play.css';

export type PlayScreenProps = {
  round: Round;
  question: QuestionState;
  data: GameData;
  onSelect: (id: string) => void;
  onHelp: () => void;
  onHome: () => void;
  factCard?: ReactElement;
};

const shapeLabel = (): string => sl.mapShape;

export function PlayScreen({
  round,
  question,
  data,
  onSelect,
  onHelp,
  onHome,
  factCard,
}: PlayScreenProps): ReactElement {
  const mapRef = useRef<MapHandle>(null);
  const factRef = useRef<HTMLDivElement>(null);
  const level: LevelId = round.level;
  const { question: q, feedback, hintTier } = question;
  const target = data.itemById.get(q.promptId);
  const targetId = q.acceptIds[0] ?? q.itemId;
  const hint = useMemo(() => (target ? neighbourHint(target, data) : undefined), [target, data]);

  // Help tiers move the view: 1 zooms to the target's surroundings, 3 closer in to the flash.
  useEffect(() => {
    if (feedback.type !== 'hint') return;
    if (feedback.tier === 3) mapRef.current?.fitToShape(targetId, 8);
    else mapRef.current?.fitToShape(targetId, 16);
  }, [feedback, targetId]);

  // After a correct answer, centre the target in the part of the map the fact card leaves free.
  useEffect(() => {
    if (!question.done) return;
    const card = factRef.current?.querySelector('.fact');
    const inset = card instanceof HTMLElement ? card.offsetHeight + 24 : 0;
    mapRef.current?.fitToShape(targetId, 20, inset);
  }, [question.done, targetId]);

  // Each new question starts from the level's home view.
  useEffect(() => {
    mapRef.current?.fitToRegion(levelById(level).region);
  }, [q.id, level]);

  const states = useMemo(() => {
    const s: Record<string, ShapeState> = {};
    if (hintTier >= 2 && hint?.highlightId) s[hint.highlightId] = 'hint';
    if (feedback.type === 'wrong') s[feedback.clickedId] = 'wrong';
    if (hintTier >= 3) s[targetId] = 'flash';
    if (question.done) s[targetId] = 'correct';
    return s;
  }, [feedback, hintTier, hint, targetId, question.done]);

  let toast: ReactElement | undefined;
  if (feedback.type === 'wrong') {
    const clicked = data.nameOf(feedback.clickedId);
    if (clicked)
      toast = (
        <FeedbackToast
          key={question.seq}
          kind="wrong"
          text={sl.wrong(clicked.nameSl, clicked.plural)}
        />
      );
  } else if (feedback.type === 'hint') {
    const text =
      feedback.tier === 1
        ? sl.hintZoom
        : feedback.tier === 2
          ? (hint?.text ?? sl.hintZoom)
          : sl.hintFlash;
    toast = <FeedbackToast key={question.seq} kind="hint" text={text} />;
  }

  const name = target?.nameSl ?? '';
  const flag = target?.kind === 'country' ? flagUrl(target.flag) : undefined;

  return (
    <section className="play">
      <PromptBanner
        label={sl.find}
        name={name}
        {...(flag ? { flagUrl: flag } : {})}
        index={round.index}
        total={round.questions.length}
        onHome={onHome}
      />
      <div className="play__map">
        <MapView
          ref={mapRef}
          shapes={data.shapesForLevel(level)}
          states={states}
          onSelect={onSelect}
          labels={sl.mapLabels}
          shapeLabel={shapeLabel}
          region={levelById(level).region}
        />
        <div className="play__toasts">{toast}</div>
        {!question.done && (
          <button type="button" className="btn btn--help" onClick={onHelp}>
            <BulbIcon size={26} />
            {sl.help}
          </button>
        )}
        <div ref={factRef} className="play__fact">
          {factCard}
        </div>
      </div>
    </section>
  );
}
