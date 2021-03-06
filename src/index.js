/* eslint require-atomic-updates:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import swal from 'sweetalert';
import AWS from 'aws-sdk';
import request from 'superagent';
import db from 'dynogels-promisified';
import { ipcRenderer } from 'electron';
import appReducer from './reducers/app-reducer';
import * as appActions from './actions/app-actions';
import Transcription from './types/transcription';
import VocabularyType from './types/vocabulary-word';
import App from './components/app';
import * as constants from './constants';
import { splitWords } from './util';

ipcRenderer.on('errorNotification', (e, message) => {
  swal({
    icon: 'error',
    text: message
  });
});

ipcRenderer.on('notification', (e, notification) => {
  swal({
    icon: 'info',
    text: notification
  });
});

const version = ipcRenderer.sendSync('getVersion');

document.title = document.title + ' v' + version;

localStorage.setItem(constants.localStorageKeys.TEMP_OBJ, JSON.stringify({}));

window.handleError = err => {
  console.error(err);
  swal({
    title: 'Oops!',
    text: err.message,
    icon: 'error'
  });
};

const combinedReducers = combineReducers({
  appState: appReducer
});

const store = createStore(combinedReducers);

store.subscribe(() => {
  const state = store.getState();
  const { updatingVocabularyList } = state.appState;
  const updatingMessage = ' (Updating vocabulary list)';
  const { title } = document;
  const includesMessage = title.includes(updatingMessage);
  if(updatingVocabularyList && !includesMessage) {
    document.title = title + updatingMessage;
  } else if(!updatingVocabularyList && includesMessage) {
    document.title = title.replace(updatingMessage, '');
  }
  console.log('state', state.appState);
});

window.addEventListener('resize', e => {
  const { innerWidth, innerHeight } = e.target;
  store.dispatch(appActions.setWindowSize(innerWidth, innerHeight));
});

let IndexedWordsModel;

(function() {
  const { accessKeyId = '', secretAccessKey = '' } = store.getState().appState;
  db.AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region: constants.aws.REGION
  });
  AWS.config.accessKeyId = accessKeyId;
  AWS.config.secretAccessKey = secretAccessKey;
  AWS.config.region = constants.aws.REGION;

  const TranscriptionModel = require('./models/transcription')
    .default({ db });
  window.db = db;
  window.TranscriptionModel = TranscriptionModel;
  IndexedWordsModel = require('./models/transcription-indexed-words')
    .default({ db });
  window.IndexedWordsModel = IndexedWordsModel;
  const VocabularyWordModel = require('./models/vocabulary')
    .default({ db });
  window.VocabularyWordModel = VocabularyWordModel;

  if(!accessKeyId || !secretAccessKey) return;

  const intCol = new Intl.Collator('en-US');
  VocabularyWordModel
    .scan()
    .loadAll()
    .execAsync()
    .then(({ Items: models }) => {
      const vocabularyWords = models
        .map(model => new VocabularyType({...model.attrs, model}))
        .sort((a, b) => intCol.compare(a.word, b.word));
      store.dispatch(appActions.setVocabulary(vocabularyWords));
    })
    .catch(handleError);

  TranscriptionModel
    .scan()
    .loadAll()
    .attributes([
      '_id',
      'title',
      'audioUrl',
      'postUrl',
      'postDate',
      's3Key',
      's3Url',
      'status',
      'createdAt',
      'updatedAt'
    ])
    .execAsync()
    .then(({ Items: models }) => {
      const transcriptions = models
        .map(model => new Transcription({...TranscriptionModel.inflate(model.attrs), model}));
      store.dispatch(appActions.setTranscriptions(transcriptions));
      setTimeout(checkTranscriptions, 0);
      checkTranscriptions()
        .then(() => {

          const _updateVocabularyList = async function(list = []) {
            const json = localStorage.getItem(constants.localStorageKeys.UPDATED_VOCABULARY_LIST);
            const listFromStorage = json ? JSON.parse(json) : [];
            const { VocabularyState } = await new Promise((resolve, reject) => {
              transcribeService.getVocabulary({
                VocabularyName: constants.CUSTOM_VOCAB_NAME
              }, (err, res) => err ? reject(err) : resolve(res));
            });
            if(VocabularyState === 'PENDING') {
              store.dispatch(appActions.setUpdatingVocabularyList(true));
              return;
            } else {
              store.dispatch(appActions.setUpdatingVocabularyList(false));
            }
            if(list.length === 0 && listFromStorage.length === 0 && VocabularyState === 'READY') return;
            if(list.length === 0) {
              const { Items: wordModels } = await VocabularyWordModel
                .scan()
                .loadAll()
                .execAsync();
              list = wordModels
                .map(m => m.get('word'));
            }
            await new Promise((resolve, reject) => {
              transcribeService.updateVocabulary({
                LanguageCode: 'en-US',
                VocabularyName: constants.CUSTOM_VOCAB_NAME,
                Phrases: list
              }, err => err ? reject(err) : resolve());
            });
            localStorage.setItem(constants.localStorageKeys.UPDATED_VOCABULARY_LIST, JSON.stringify([]));
            store.dispatch(appActions.setUpdatingVocabularyList(true));
          };

          setInterval(_updateVocabularyList, 30000);

          window.updateVocabularyList = (list = []) => {
            localStorage.setItem(constants.localStorageKeys.UPDATED_VOCABULARY_LIST, JSON.stringify(list));
            _updateVocabularyList(list);
          };

          _updateVocabularyList();

        })
        .catch(handleError);
    })
    .catch(handleError);
})();

const checkTranscriptions = async function() {
  try {
    const transcribe = new AWS.TranscribeService();
    window.transcribeService = transcribe;
    const { accessKeyId, secretAccessKey, transcriptions: originalTranscriptions, uploading } = store.getState().appState;
    if(!accessKeyId || !secretAccessKey) return;


    if(uploading) return;
    const processing = originalTranscriptions
      .filter(t => t.status === constants.transcriptionStatuses.PROCESSING)
      .reverse();
    for(const transcription of processing) {
      let newTranscription;
      try {
        const modelFromDB = await TranscriptionModel
          .getAsync(transcription._id);
        if(modelFromDB.get('updatedAt') > transcription.updatedAt) {
          newTranscription = transcription.set({
            ...modelFromDB.attrs,
            model: modelFromDB
          });
        } else {
          const data = await new Promise((resolve, reject) => {
            transcribe.getTranscriptionJob({ TranscriptionJobName: transcription._id }, (err, res) => {
              if(err) reject(err);
              else resolve(res);
            });
          });
          if(data.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
            const { TranscriptFileUri } = data.TranscriptionJob.Transcript;
            const res = await request.get(TranscriptFileUri).responseType('blob');
            const json = res.body.toString('utf8');
            const parsed = JSON.parse(json);
            const text = parsed.results.transcripts.map(t => t.transcript).join('\n\n');
            transcription.model.set({
              status: constants.transcriptionStatuses.READY,
              text
            });
            const newModel = await transcription.model.updateAsync();
            newTranscription = transcription.set({
              ...newModel.attrs,
              model: newModel
            });
            const split = splitWords(text);
            if(split.length > 1) {
              await Promise.all(split.map(word => IndexedWordsModel.createAsync({ word, transcription: newTranscription._id })));
            }

          } else if(data.TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
            newTranscription = transcription.set({
              status: constants.transcriptionStatuses.FAILED
            });
          }
        }
      } catch(err) {
        handleError(err);
        newTranscription = transcription.set({
          status: constants.transcriptionStatuses.FAILED
        });
      }
      if(newTranscription) {
        const { transcriptions } = store.getState().appState;
        const idx = transcriptions.findIndex(t => t._id === newTranscription._id);
        const newTranscriptions = [
          ...transcriptions.slice(0, idx),
          newTranscription,
          ...transcriptions.slice(idx + 1)
        ];
        store.dispatch(appActions.setTranscriptions(newTranscriptions));

        {
          // Delete finished transcription job
          const params = {
            TranscriptionJobName: newTranscription._id
          };
          transcribe.deleteTranscriptionJob(params, err => {
            if(err) handleError(err);
          });
        }

        {
          // Delete file from S3 bucket
          const s3 = new AWS.S3();
          const params = {
            Bucket: constants.aws.BUCKET,
            Key: newTranscription.s3Key
          };
          s3.deleteObject(params, err => {
            if(err) handleError(err);
          });
        }

      }
    }
  } catch(err) {
    handleError(err);
  }
};

// Check to see if any transcriptions are finished processing
setInterval(checkTranscriptions, 30000);

// setTimeout(() => {
//
//   const getRandomIndex = max => {
//     return Math.floor(Math.random() * Math.floor(max));
//   };
//
//   const data = [];
//   const text = 'On the shores of Gitche Gumee, Of the shining Big-Sea-Water, Stood Nokomis, the old woman, Pointing with her finger westward, O\'er the water pointing westward, To the purple clouds of sunset.   Fiercely the red sun descending Burned his way along the heavens, Set the sky on fire behind him, As war-parties, when retreating, Burn the prairies on their war-trail; And the moon, the Night-sun, eastward, Suddenly starting from his ambush, Followed fast those bloody footprints, Followed in that fiery war-trail, With its glare upon his features.   And Nokomis, the old woman, Pointing with her finger westward, Spake these words to Hiawatha: "Yonder dwells the great Pearl-Feather, Megissogwon, the Magician, Manito of Wealth and Wampum, Guarded by his fiery serpents, Guarded by the black pitch-water. You can see his fiery serpents, The Kenabeek, the great serpents, Coiling, playing in the water; You can see the black pitch-water Stretching far away beyond them, To the purple clouds of sunset!';
//   const splitText = text
//     .split(/\s+/g)
//     .filter(w => !/\W/.test(w))
//     .reduce((arr, w) => arr.includes(w) ? arr : [...arr, w], []);
//
//   for(let i = 0; i < 100; i++) {
//     const date = new Date().toISOString();
//     const idx = getRandomIndex(splitText.length);
//     data.push(new Transcription({
//       _id: uuid.v4(),
//       createdAt: date,
//       title: splitText.slice(idx, idx + 4).join(' '),
//       text,
//       audioUrl: 'https://something.com/something.mp3',
//       postUrl: 'https://something.com/something',
//       postDate: date,
//       status: constants.transcriptionStatuses.READY
//     }));
//   }
//   store.dispatch(appActions.setTranscriptions(data));
// }, 100);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('js-main')
);
