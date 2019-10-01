import { actions } from '../constants';

export const setWindowSize = (width, height) => ({
  type: actions.SET_WINDOW_SIZE,
  payload: { width, height }
});

export const setTranscriptions = transcriptions => ({
  type: actions.SET_TRANSCRIPTIONS,
  payload: { transcriptions }
});

export const setActiveTab = activeTab => ({
  type: actions.SET_ACTIVE_TAB,
  payload: { activeTab }
});

export const setAccessKeyId = accessKeyId => ({
  type: actions.SET_ACCESS_KEY_ID,
  payload: { accessKeyId }
});

export const setSecretAccessKey = secretAccessKey => ({
  type: actions.SET_SECRET_ACCESS_KEY,
  payload: { secretAccessKey }
});

export const setUploading = uploading => ({
  type: actions.SET_UPLOADING,
  payload: { uploading }
});

export const setFilter = filter => ({
  type: actions.SET_FILTER,
  payload: { filter }
});

export const setFilterType = filterType => ({
  type: actions.SET_FILTER_TYPE,
  payload: { filterType }
});

export const setAppliedFilter = filter => ({
  type: actions.SET_APPLIED_FILTER,
  payload: { filter }
});

export const setVocabulary = vocabulary => ({
  type: actions.SET_VOCABULARY,
  payload: { vocabulary }
});

export const setVocabularyFilter = vocabularyFilter => ({
  type: actions.SET_VOCABULARY_FILTER,
  payload: { vocabularyFilter }
});

export const setAppliedVocabularyFilter = () => ({
  type: actions.SET_APPLIED_VOCABULARY_FILTER,
  payload: {}
});

export const setUpdatingVocabularyList = updating => ({
  type: actions.SET_UPDATING_VOCABULARY_LIST,
  payload: { updating }
});

export const setSelectedWords = selectedWords => ({
  type: actions.SET_SELECTED_WORDS,
  payload: { selectedWords }
});
