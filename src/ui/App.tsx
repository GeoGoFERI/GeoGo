import { useEffect, useMemo, useReducer, useState, type ReactElement } from 'react';
import type { LevelId } from '../core/item';
import { LEVELS } from '../core/levels';
import { isMastered } from '../core/leitner';
import { loadProgress, saveProgress } from '../core/progress';
import { browserStore } from '../core/storage';
import { sl } from '../i18n/sl';
import { gameReducer, type GameState, type Round } from './game';
import { levelItems, makeRng, modesFor, newRound, replayRound, type PlayMode } from './newRound';
import { readTestHooks } from './testHooks';
import { useGameData } from './useGameData';
import { StartScreen, type LevelCardInfo } from './StartScreen';
import { PlayScreen } from './PlayScreen';
import { SummaryScreen } from './SummaryScreen';
import { AtlasScreen } from './AtlasScreen';
import { CoastScreen } from './CoastScreen';
import { dealCoastCards } from '../core/coastGame';
import { itemsInLevel } from '../core/item';
import { FactCard } from './FactCard';
import { factContent, pointFactContent } from './factContent';
import { Confetti } from './Confetti';
import logoUrl from './assets/logo.webp';

const store = browserStore();
const hooks = readTestHooks(window.location.search);
const rng = makeRng(hooks);

function initState(): GameState {
  return { view: { screen: 'start' }, progress: loadProgress(store) };
}

export function App(): ReactElement {
  const [state, dispatch] = useReducer(gameReducer, undefined, initState);
  const [selected, setSelected] = useState<LevelId>(3);
  const [mode, setMode] = useState<PlayMode>('find');
  const dataState = useGameData();
  const data = dataState.status === 'ready' ? dataState.data : undefined;
  const { view, progress } = state;

  // Progress is saved whenever it changes (after each round).
  useEffect(() => {
    saveProgress(store, progress);
  }, [progress]);

  const levelCards = useMemo<LevelCardInfo[]>(
    () =>
      LEVELS.filter((l) => !l.stretch).map((l) => {
        const items = levelItems(data, l.id);
        return {
          level: l.id,
          available: data === undefined ? l.id === 3 : items.length > 0,
          mastered: items.filter((i) => isMastered(progress.items[i.id])).length,
          total: items.length,
        };
      }),
    [data, progress],
  );

  const startCoast = (): void => {
    if (data)
      dispatch({ type: 'startCoast', cards: dealCoastCards(itemsInLevel(data.items, 3), rng) });
  };

  const startLevel = (level: LevelId, playMode: PlayMode = mode): void => {
    if (!data) return;
    // A mode chosen for another level falls back to plain "find".
    const effective = modesFor(level).includes(playMode) ? playMode : 'find';
    if (effective === 'coast') {
      startCoast();
      return;
    }
    dispatch({
      type: 'startRound',
      level,
      questions: newRound(level, data, progress, hooks, rng, effective),
      track: effective !== 'coords',
    });
  };

  // What the fact card shows: the prompt item, the hemisphere after a hemisphere question,
  // or the grid point and what lies there.
  const answered = view.screen === 'fact' ? view.question.question : undefined;
  const factItem = answered
    ? data?.itemById.get(answered.mode === 'hemisphere' ? answered.itemId : answered.promptId)
    : undefined;
  const fact =
    answered && data
      ? answered.mode === 'coords'
        ? { content: pointFactContent(answered, data), kind: 'line' as const }
        : factItem
          ? { content: factContent(factItem, data, answered), kind: factItem.kind }
          : undefined
      : undefined;
  // The mode a finished round was played in, for "Še enkrat" and "Ponovi težje".
  const roundMode = (round: Round): PlayMode => {
    const first = round.questions[0]?.mode;
    return first === 'fact' || first === 'coords' ? first : 'find';
  };

  const status =
    dataState.status === 'loading'
      ? sl.loading
      : dataState.status === 'error'
        ? sl.loadFailed
        : undefined;

  return (
    <div className="app">
      {(view.screen === 'atlas' || view.screen === 'summary' || view.screen === 'coast') && (
        <header className="app__header">
          <button
            type="button"
            className="app__logo-btn"
            onClick={() => dispatch({ type: 'home' })}
            aria-label={sl.logoHome}
          >
            <img src={logoUrl} alt="" className="app__logo" />
          </button>
        </header>
      )}
      <main className="app__main">
        {view.screen === 'start' && (
          <StartScreen
            levels={levelCards}
            selected={selected}
            onSelect={setSelected}
            onStart={() => startLevel(selected)}
            onAtlas={() => dispatch({ type: 'openAtlas' })}
            mode={mode}
            onMode={setMode}
            {...(status ? { status } : {})}
          />
        )}
        {view.screen === 'coast' && data && (
          <CoastScreen
            game={view.game}
            data={data}
            onPick={(choice) => dispatch({ type: 'coast', action: { type: 'pick', choice } })}
            onNext={() => dispatch({ type: 'coast', action: { type: 'next' } })}
            onAgain={startCoast}
            onHome={() => dispatch({ type: 'home' })}
          />
        )}
        {view.screen === 'atlas' && data && (
          <AtlasScreen data={data} progress={progress} onBack={() => dispatch({ type: 'home' })} />
        )}
        {view.screen === 'summary' && data && (
          <SummaryScreen
            level={view.round.level}
            summary={view.summary}
            newStickers={view.newStickers}
            onAgain={() => startLevel(view.round.level, roundMode(view.round))}
            onReplayWeak={() =>
              dispatch({
                type: 'startRound',
                level: view.round.level,
                questions: replayRound(
                  view.round.level,
                  view.summary.weakItemIds,
                  data,
                  rng,
                  roundMode(view.round),
                ),
                track: view.round.track,
              })
            }
            onHome={() => dispatch({ type: 'home' })}
          />
        )}
        {(view.screen === 'play' || view.screen === 'fact') && data && (
          <PlayScreen
            round={view.round}
            question={view.question}
            data={data}
            onSelect={(id) => dispatch({ type: 'click', id })}
            onHelp={() => dispatch({ type: 'help' })}
            onHome={() => dispatch({ type: 'home' })}
            {...(view.screen === 'fact'
              ? {
                  factCard: (
                    <>
                      <Confetti />
                      {fact && (
                        <FactCard
                          content={fact.content}
                          kind={fact.kind}
                          praise={sl.correct[view.round.index % sl.correct.length] ?? sl.correct[0]}
                          onNext={() => dispatch({ type: 'next', items: data.itemById })}
                        />
                      )}
                    </>
                  ),
                }
              : {})}
          />
        )}
      </main>
    </div>
  );
}
