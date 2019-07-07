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
