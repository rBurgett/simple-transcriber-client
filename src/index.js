import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import swal from 'sweetalert';
import appReducer from './reducers/app-reducer';
import * as appActions from './actions/app-actions';
import Transcription from './types/transcription';
import App from './components/app';

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
  console.log('state', state.appState);
});

window.addEventListener('resize', e => {
  const { innerWidth, innerHeight } = e.target;
  store.dispatch(appActions.setWindowSize(innerWidth, innerHeight));
});

setTimeout(() => {

  const getRandomIndex = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const data = [];
  const text = 'On the shores of Gitche Gumee, Of the shining Big-Sea-Water, Stood Nokomis, the old woman, Pointing with her finger westward, O\'er the water pointing westward, To the purple clouds of sunset.   Fiercely the red sun descending Burned his way along the heavens, Set the sky on fire behind him, As war-parties, when retreating, Burn the prairies on their war-trail; And the moon, the Night-sun, eastward, Suddenly starting from his ambush, Followed fast those bloody footprints, Followed in that fiery war-trail, With its glare upon his features.   And Nokomis, the old woman, Pointing with her finger westward, Spake these words to Hiawatha: "Yonder dwells the great Pearl-Feather, Megissogwon, the Magician, Manito of Wealth and Wampum, Guarded by his fiery serpents, Guarded by the black pitch-water. You can see his fiery serpents, The Kenabeek, the great serpents, Coiling, playing in the water; You can see the black pitch-water Stretching far away beyond them, To the purple clouds of sunset!';
  const splitText = text
    .split(/\s+/g)
    .filter(w => !/\W/.test(w))
    .reduce((arr, w) => arr.includes(w) ? arr : [...arr, w], []);

  for(let i = 0; i < 2500; i++) {
    const date = new Date().toISOString();
    const idx = getRandomIndex(splitText.length);
    data.push(new Transcription({
      createdAt: date,
      title: splitText.slice(idx, idx + 4).join(' '),
      text,
      audioUrl: 'https://something.com/something.mp3',
      postUrl: 'https://something.com/something',
      postDate: date
    }));
  }
  store.dispatch(appActions.setTranscriptions(data));
}, 100);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('js-main')
);
