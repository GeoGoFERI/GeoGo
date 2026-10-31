import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import type { LevelId } from '../core/item';
import { levelById } from '../core/levels';
import type { QuestionState } from '../core/question';
import type { GameData } from '../data/gameData';
import { MapView, type MapHandle } from '../map/MapView';
import type { ShapeState } from '../map/types';
import { sl } from '../i18n/sl';
import { FeedbackToast } from './FeedbackToast';
import { PromptBanner } from './PromptBanner';
import { tier2Hint } from './hints';
import { promptFor } from './prompt';
import { displayName } from './names';
import { riddleText, riddlesFor } from './riddleContent';
import { speak, stopSpeaking, useSlovenianVoice } from './speech';
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
  const targetId = q.acceptIds[0] ?? q.itemId;
  const hint = useMemo(() => tier2Hint(q, data), [q, data]);
  const prompt = useMemo(() => promptFor(q, data), [q, data]);
  const shapes = data.shapesFor(level, q);
  // Level 5 spans the world, so each question opens on its target's continent.
  const homeRegion =
    level === 5 ? (data.itemById.get(q.itemId)?.region ?? 'world') : levelById(level).region;
  const voice = useSlovenianVoice();
  const riddle = q.mode === 'fact' ? riddlesFor(data).get(q.promptId) : undefined;
  const readAloud = voice && riddle ? (): void => speak(riddleText(riddle), voice) : undefined;

  // Never keep reading a riddle once the question has changed.
  useEffect(() => stopSpeaking, [q.id]);

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
    mapRef.current?.fitToRegion(homeRegion);
  }, [q.id, homeRegion]);

  const states = useMemo(() => {
    const s: Record<string, ShapeState> = {};
    // A "which hemisphere" question shows its country coloured in.
    if (q.mode === 'hemisphere') s[q.promptId] = 'hint';
    if (hintTier >= 2 && hint.highlightId) s[hint.highlightId] = 'hint';
    if (hintTier >= 2) for (const id of hint.highlightIds ?? []) s[id] = 'hint';
    if (feedback.type === 'wrong') s[feedback.clickedId] = 'wrong';
    if (hintTier >= 3) s[targetId] = 'flash';
    if (question.done) s[targetId] = 'correct';
    return s;
  }, [feedback, hintTier, hint, targetId, question.done, q]);

  let toast: ReactElement | undefined;
  if (feedback.type === 'wrong') {
    const clicked = displayName(feedback.clickedId, data);
    if (clicked)
      toast = (
        <FeedbackToast
          key={question.seq}
          kind="wrong"
          text={sl.wrong(clicked.nameSl, clicked.plural)}
        />
      );
  } else if (feedback.type === 'hint') {
    const text = feedback.tier === 1 ? sl.hintZoom : feedback.tier === 2 ? hint.text : sl.hintFlash;
    toast = <FeedbackToast key={question.seq} kind="hint" text={text} />;
  }

  return (
    <section className="play">
      <PromptBanner
        {...prompt}
        {...(readAloud ? { onReadAloud: readAloud } : {})}
        index={round.index}
        total={round.questions.length}
        onHome={onHome}
      />
      <div className="play__map">
        <MapView
          ref={mapRef}
          shapes={shapes}
          states={states}
          onSelect={onSelect}
          labels={sl.mapLabels}
          shapeLabel={shapeLabel}
          region={homeRegion}
          {...(q.mode === 'coords' ? { annotations: data.gridAnnotations(sl.gridWords) } : {})}
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
