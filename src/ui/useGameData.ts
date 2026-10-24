import { useEffect, useState } from 'react';
import { loadGameData, type GameData } from '../data/gameData';

export type DataState =
  { status: 'loading' } | { status: 'ready'; data: GameData } | { status: 'error' };

export const useGameData = (): DataState => {
  const [state, setState] = useState<DataState>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    loadGameData().then(
      (data) => {
        if (alive) setState({ status: 'ready', data });
      },
      () => {
        if (alive) setState({ status: 'error' });
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
};
