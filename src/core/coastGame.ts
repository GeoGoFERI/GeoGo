import type { Item } from './item';
import { shuffle, type Rng } from './random';

export type CoastChoice = 'coastal' | 'landlocked';

export type CoastCard = { itemId: string; answer: CoastChoice };

export type CoastGameState = {
  cards: readonly CoastCard[];
  index: number;
  picked?: CoastChoice;
  correct: number;
  done: boolean;
};

export type CoastAction = { type: 'pick'; choice: CoastChoice } | { type: 'next' };

export const COAST_CARDS = 10;

export const dealCoastCards = (
  items: readonly Item[],
  rng: Rng,
  size = COAST_CARDS,
): CoastCard[] => {
  const countries = items.filter((i) => i.kind === 'country' && i.coastal !== undefined);
  const coastal = shuffle(
    countries.filter((i) => i.coastal),
    rng,
  ).slice(0, Math.ceil(size / 2));
  const landlocked = shuffle(
    countries.filter((i) => !i.coastal),
    rng,
  ).slice(0, Math.floor(size / 2));
  return shuffle([...coastal, ...landlocked], rng).map((i) => ({
    itemId: i.id,
    answer: i.coastal ? 'coastal' : 'landlocked',
  }));
};

export const startCoastGame = (cards: readonly CoastCard[]): CoastGameState => {
  return { cards, index: 0, correct: 0, done: cards.length === 0 };
};

export const coastReducer = (state: CoastGameState, action: CoastAction): CoastGameState => {
  if (state.done) return state;
  const card = state.cards[state.index];
  if (!card) return state;
  if (action.type === 'pick') {
    if (state.picked) return state;
    return {
      ...state,
      picked: action.choice,
      correct: state.correct + (action.choice === card.answer ? 1 : 0),
    };
  }
  if (!state.picked) return state;
  const index = state.index + 1;
  // Build the next state without `picked`, so the new card starts unanswered.
  return { cards: state.cards, index, correct: state.correct, done: index >= state.cards.length };
};
