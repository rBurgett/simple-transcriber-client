import { Set } from 'immutable';
import { actions, activeTabs, localStorageKeys, filterTypes } from '../constants';

const initialAccessKeyId = localStorage.getItem(localStorageKeys.ACCESS_KEY_ID) || '';
const initialSecretAccessKey = localStorage.getItem(localStorageKeys.SECRET_ACCESS_KEY) || '';

const getInitialState = () => ({
  activeTab: (initialAccessKeyId && initialSecretAccessKey) ? activeTabs.NEW : activeTabs.SETTINGS,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  transcriptions: [],
  accessKeyId: initialAccessKeyId,
  secretAccessKey: initialSecretAccessKey,
  uploading: false,
  filter: '',
  filterType: filterTypes.TITLE,
  appliedFilter: '',
  appliedFilterType: '',
  vocabulary: [],
  vocabularyFilter: '',
  appliedVocabularyFilter: '',
  updatingVocabularyList: false,
  selectedWords: Set()
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
        transcriptions: [...payload.transcriptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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
    case actions.SET_UPLOADING:
      return {
        ...state,
        uploading: payload.uploading
      };
    case actions.SET_FILTER:
      return {
        ...state,
        filter: payload.filter
      };
    case actions.SET_FILTER_TYPE:
      return {
        ...state,
        filterType: payload.filterType
      };
    case actions.SET_APPLIED_FILTER:
      return {
        ...state,
        appliedFilter: payload.filter ? payload.filter.trim() : state.filter.trim(),
        appliedFilterType: state.filterType
      };
    case actions.SET_VOCABULARY:
      return {
        ...state,
        vocabulary: payload.vocabulary
      };
    case actions.SET_VOCABULARY_FILTER:
      return {
        ...state,
        vocabularyFilter: payload.vocabularyFilter
      };
    case actions.SET_APPLIED_VOCABULARY_FILTER:
      return {
        ...state,
        appliedVocabularyFilter: state.vocabularyFilter.trim()
      };
    case actions.SET_UPDATING_VOCABULARY_LIST:
      return {
        ...state,
        updatingVocabularyList: payload.updating
      };
    case actions.SET_SELECTED_WORDS:
      return {
        ...state,
        selectedWords: payload.selectedWords
      };
    default:
      return state;
  }
};
