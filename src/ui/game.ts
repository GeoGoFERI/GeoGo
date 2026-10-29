import type { Item, LevelId } from '../core/item';
import { recordRound, type Progress } from '../core/progress';
import {
  questionReducer,
  questionResult,
  startQuestion,
  type QuestionResult,
  type QuestionState,
} from '../core/question';
import type { Question } from '../core/round';
import { buildSummary, type RoundSummary } from '../core/summary';
import { awardStickers } from '../core/stickers';
import {
  coastReducer,
  startCoastGame,
  type CoastAction,
  type CoastCard,
  type CoastGameState,
} from '../core/coastGame';

export type Round = {
  level: LevelId;
  questions: readonly Question[];
  index: number;
  results: readonly QuestionResult[];
  track: boolean;
};

export type View =
  | { screen: 'start' }
  | { screen: 'atlas' }
  | { screen: 'play' | 'fact'; round: Round; question: QuestionState }
  | { screen: 'summary'; round: Round; summary: RoundSummary; newStickers: readonly LevelId[] }
  | { screen: 'coast'; game: CoastGameState };

export type GameState = { view: View; progress: Progress };

export type GameAction =
  | { type: 'startRound'; level: LevelId; questions: readonly Question[]; track?: boolean }
  | { type: 'click'; id: string }
  | { type: 'help' }
  | { type: 'next'; items: ReadonlyMap<string, Item> }
  | { type: 'startCoast'; cards: readonly CoastCard[] }
  | { type: 'coast'; action: CoastAction }
  | { type: 'openAtlas' }
  | { type: 'home' };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  const { view } = state;
  switch (action.type) {
    case 'startRound': {
      const [first] = action.questions;
      if (!first) return state;
      const round: Round = {
        level: action.level,
        questions: action.questions,
        index: 0,
        results: [],
        track: action.track ?? true,
      };
      return { ...state, view: { screen: 'play', round, question: startQuestion(first) } };
    }
    case 'click':
    case 'help': {
      if (view.screen !== 'play') return state;
      const question = questionReducer(view.question, action);
      if (question === view.question) return state;
      return { ...state, view: { ...view, screen: question.done ? 'fact' : 'play', question } };
    }
    case 'next': {
      if (view.screen !== 'fact') return state;
      const result = questionResult(view.question);
      if (!result) return state;
      const results = [...view.round.results, result];
      const index = view.round.index + 1;
      const nextQuestion = view.round.questions[index];
      if (nextQuestion) {
        const round = { ...view.round, index, results };
        return { ...state, view: { screen: 'play', round, question: startQuestion(nextQuestion) } };
      }
      const round = { ...view.round, index, results };
      const recorded = round.track ? recordRound(state.progress, results) : state.progress;
      const { progress, added } = awardStickers(recorded, [...action.items.values()]);
      return {
        progress,
        view: {
          screen: 'summary',
          round,
          summary: buildSummary(results, action.items),
          newStickers: added,
        },
      };
    }
    case 'startCoast':
      return { ...state, view: { screen: 'coast', game: startCoastGame(action.cards) } };
    case 'coast': {
      if (view.screen !== 'coast') return state;
      const game = coastReducer(view.game, action.action);
      return game === view.game ? state : { ...state, view: { screen: 'coast', game } };
    }
    case 'openAtlas':
      return { ...state, view: { screen: 'atlas' } };
    case 'home':
      return { ...state, view: { screen: 'start' } };
  }
};
