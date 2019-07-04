import { actions, activeTabs, localStorageKeys } from '../constants';

const getInitialState = () => ({
  activeTab: activeTabs.NEW,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  transcriptions: [],
  accessKeyId: localStorage.getItem(localStorageKeys.ACCESS_KEY_ID) || '',
  secretAccessKey: localStorage.getItem(localStorageKeys.SECRET_ACCESS_KEY) || ''
});

export default (state = getInitialState(), { type, payload }) => {
  switch(type) {
    case actions.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: payload.activeTab
      };
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
    case actions.SET_ACCESS_KEY_ID:
      localStorage.setItem(localStorageKeys.ACCESS_KEY_ID, payload.accessKeyId);
      return {
        ...state,
        accessKeyId: payload.accessKeyId
      };
    case actions.SET_SECRET_ACCESS_KEY:
      localStorage.setItem(localStorageKeys.SECRET_ACCESS_KEY, payload.secretAccessKey);
      return {
        ...state,
        secretAccessKey: payload.secretAccessKey
      };
    default:
      return state;
  }
};
