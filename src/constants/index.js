export const actions = {
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_WINDOW_SIZE: 'SET_WINDOW_SIZE',
  SET_TRANSCRIPTIONS: 'SET_TRANSCRIPTIONS',
  SET_ACCESS_KEY_ID: 'SET_ACCESS_KEY_ID',
  SET_SECRET_ACCESS_KEY: 'SET_SECRET_ACCESS_KEY',
  SET_UPLOADING: 'SET_UPLOADING'
};

export const activeTabs = {
  NEW: 'NEW',
  TRANSCRIPTIONS: 'TRANSCRIPTIONS',
  SETTINGS: 'SETTINGS'
};

export const localStorageKeys = {
  TEMP_OBJ: 'TEMP_OBJ',
  ACCESS_KEY_ID: 'ACCESS_KEY_ID',
  SECRET_ACCESS_KEY: 'SECRET_ACCESS_KEY'
};

export const aws = {
  REGION: 'us-east-2',
  BUCKET: 'transcriber.temp.bucket'
};

export const transcriptionStatuses = {
  UNKNOWN: 'UNKNOWN',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED'
};
