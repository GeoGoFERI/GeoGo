import { useEffect, useMemo, useReducer, useState, type ReactElement } from 'react';
import type { LevelId } from '../core/item';
import { LEVELS } from '../core/levels';
import { isMastered } from '../core/leitner';
import { loadProgress, saveProgress } from '../core/progress';
import { browserStore } from '../core/storage';
import { sl } from '../i18n/sl';
import { gameReducer, type GameState } from './game';
import { levelItems, makeRng, newRound } from './newRound';
import { readTestHooks } from './testHooks';
import { useGameData } from './useGameData';
import { StartScreen, type LevelCardInfo } from './StartScreen';
import { PlayScreen } from './PlayScreen';
import { FactCard } from './FactCard';
import { factContent } from './factContent';
import { Confetti } from './Confetti';
import logoUrl from './assets/logo.webp';
import './styles/fonts';
import './styles/tokens.css';
import './styles/global.css';
import './styles/app.css';

const store = browserStore();
const hooks = readTestHooks(window.location.search);
const rng = makeRng(hooks);

function initState(): GameState {
  return { view: { screen: 'start' }, progress: loadProgress(store) };
}

export function App(): ReactElement {
  const [state, dispatch] = useReducer(gameReducer, undefined, initState);
  const [selected, setSelected] = useState<LevelId>(3);
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

  const startLevel = (level: LevelId): void => {
    if (!data) return;
    dispatch({ type: 'startRound', level, questions: newRound(level, data, progress, hooks, rng) });
  };

  // The item the fact card is about: the prompt item (the country for hemisphere questions).
  const factTarget =
    view.screen === 'fact' ? data?.itemById.get(view.question.question.promptId) : undefined;

  const status =
    dataState.status === 'loading'
      ? sl.loading
      : dataState.status === 'error'
        ? sl.loadFailed
        : undefined;

  return (
    <div className="app">
      {(view.screen === 'atlas' || view.screen === 'summary') && (
        <header className="app__header">
          <button
            type="button"
            className="app__logo-btn"
            onClick={() => dispatch({ type: 'home' })}
            aria-label={sl.home}
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
            {...(status ? { status } : {})}
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
                      {factTarget && (
                        <FactCard
                          content={factContent(factTarget, data)}
                          kind={factTarget.kind}
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
