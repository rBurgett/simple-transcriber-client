import { actions } from '../constants';

const getInitialState = () => ({
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  transcriptions: []
});

export default (state = getInitialState(), { type, payload }) => {
  switch(type) {
    case actions.SET_WINDOW_SIZE:
      return {
        ...state,
        windowWidth: payload.width,
        windowHeight: payload.height
      };
    case actions.SET_TRANSCRIPTIONS:
      return {
        ...state,
        transcriptions: payload.transcriptions
      };
    default:
      return state;
  }
};
