import type { Question } from './round';
import { starsFor } from './stars';

export type HintTier = 0 | 1 | 2 | 3;

export type Feedback =
  | { type: 'none' }
  | { type: 'wrong'; clickedId: string }
  | { type: 'correct' }
  | { type: 'hint'; tier: Exclude<HintTier, 0> };

export type QuestionState = {
  question: Question;
  attempts: number;
  wrongIds: readonly string[];
  hintTier: HintTier;
  done: boolean;
  stars?: 1 | 2 | 3;
  feedback: Feedback;
  seq: number;
};

export type QuestionAction = { type: 'click'; id: string } | { type: 'help' };

export type QuestionResult = {
  questionId: string;
  itemId: string;
  stars: 1 | 2 | 3;
  attempts: number;
  hintsUsed: number;
  wrongIds: readonly string[];
};

export function startQuestion(question: Question): QuestionState {
  return {
    question,
    attempts: 0,
    wrongIds: [],
    hintTier: 0,
    done: false,
    feedback: { type: 'none' },
    seq: 0,
  };
}

export function questionReducer(state: QuestionState, action: QuestionAction): QuestionState {
  if (state.done) return state;
  const { question } = state;

  if (action.type === 'help') {
    const tier = Math.min(state.hintTier + 1, 3) as Exclude<HintTier, 0>;
    return { ...state, hintTier: tier, feedback: { type: 'hint', tier }, seq: state.seq + 1 };
  }

  // Clicks outside the offered choices (orientation pairs) are ignored.
  if (question.choiceIds && !question.choiceIds.includes(action.id)) return state;

  if (question.acceptIds.includes(action.id)) {
    const attempts = state.attempts + 1;
    return {
      ...state,
      attempts,
      done: true,
      stars: starsFor(attempts, state.hintTier),
      feedback: { type: 'correct' },
      seq: state.seq + 1,
    };
  }

  const repeated = state.wrongIds.includes(action.id);
  return {
    ...state,
    attempts: repeated ? state.attempts : state.attempts + 1,
    wrongIds: repeated ? state.wrongIds : [...state.wrongIds, action.id],
    feedback: { type: 'wrong', clickedId: action.id },
    seq: state.seq + 1,
  };
}

export function questionResult(state: QuestionState): QuestionResult | undefined {
  if (!state.done || state.stars === undefined) return undefined;
  return {
    questionId: state.question.id,
    itemId: state.question.itemId,
    stars: state.stars,
    attempts: state.attempts,
    hintsUsed: state.hintTier,
    wrongIds: state.wrongIds,
  };
}
