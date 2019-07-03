import { actions } from '../constants';

export const setWindowSize = (width, height) => ({
  type: actions.SET_WINDOW_SIZE,
  payload: { width, height }
});

export const setTranscriptions = transcriptions => ({
  type: actions.SET_TRANSCRIPTIONS,
  payload: { transcriptions }
});
