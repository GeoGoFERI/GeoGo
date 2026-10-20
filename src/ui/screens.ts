// The app's screen state machine. No router: a reducer moves between a small set of screens.

export type Screen =
  { name: 'start' } | { name: 'play' } | { name: 'fact' } | { name: 'summary' } | { name: 'atlas' };

export type ScreenAction =
  | { type: 'play' }
  | { type: 'answered' }
  | { type: 'continue' }
  | { type: 'roundDone' }
  | { type: 'openAtlas' }
  | { type: 'home' };

export const initialScreen: Screen = { name: 'start' };

// allowed transitions; anything else leaves the screen unchanged
export const screenReducer = (screen: Screen, action: ScreenAction): Screen => {
  switch (action.type) {
    case 'play':
      return { name: 'play' };
    case 'answered':
      return screen.name === 'play' ? { name: 'fact' } : screen;
    case 'continue':
      return screen.name === 'fact' ? { name: 'play' } : screen;
    case 'roundDone':
      return screen.name === 'fact' || screen.name === 'play' ? { name: 'summary' } : screen;
    case 'openAtlas':
      return { name: 'atlas' };
    case 'home':
      return initialScreen;
  }
};
