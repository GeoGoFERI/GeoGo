import { useReducer, useState, type ReactElement } from 'react';
import { sl } from '../i18n/sl';
import { initialScreen, screenReducer } from './screens';
import { MapView } from '../map/MapView';
import { worldCountryShapes } from './devShapes';
import logoUrl from './assets/logo.webp';
import './styles/fonts';
import './styles/tokens.css';
import './styles/global.css';
import './styles/app.css';

export function App(): ReactElement {
  const [screen, dispatch] = useReducer(screenReducer, initialScreen);
  // Temporary readout for the map engine phase.
  const [lastClicked, setLastClicked] = useState('');

  return (
    <div className="app">
      <header className="app__header">
        <button
          type="button"
          className="app__logo-btn"
          onClick={() => dispatch({ type: 'home' })}
          aria-label={sl.appName}
        >
          <img src={logoUrl} alt="" className="app__logo" />
        </button>
      </header>
      <main className="app__main">
        {screen.name === 'start' && (
          <section className="placeholder">
            <h1>{sl.appName}</h1>
            <button
              type="button"
              className="btn btn--big"
              onClick={() => dispatch({ type: 'play' })}
            >
              {sl.start}
            </button>
            <button
              type="button"
              className="btn btn--plain"
              onClick={() => dispatch({ type: 'openAtlas' })}
            >
              {sl.atlas}
            </button>
          </section>
        )}
        {screen.name === 'play' && (
          <section className="placeholder placeholder--map">
            <p>{sl.placeholderPlay}</p>
            <MapView
              shapes={worldCountryShapes}
              labels={sl.mapLabels}
              shapeLabel={() => sl.mapShape}
              onSelect={(id) => setLastClicked(id)}
            />
            <p data-testid="last-clicked">{lastClicked}</p>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'answered' })}>
              {sl.next}
            </button>
          </section>
        )}
        {screen.name === 'fact' && (
          <section className="placeholder">
            <p>{sl.placeholderFact}</p>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'roundDone' })}>
              {sl.next}
            </button>
          </section>
        )}
        {screen.name === 'summary' && (
          <section className="placeholder">
            <p>{sl.placeholderSummary}</p>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'home' })}>
              {sl.again}
            </button>
          </section>
        )}
        {screen.name === 'atlas' && (
          <section className="placeholder">
            <p>{sl.placeholderAtlas}</p>
            <button
              type="button"
              className="btn btn--plain"
              onClick={() => dispatch({ type: 'home' })}
            >
              {sl.back}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
