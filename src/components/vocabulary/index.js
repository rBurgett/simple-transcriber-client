import { connect } from 'react-redux';
import Vocabulary from './vocabulary';
import * as appActions from '../../actions/app-actions';

export default connect(
  ({ appState }) => ({
    windowHeight: appState.windowHeight,
    transcriptions: appState.transcriptions,
    vocabulary: appState.vocabulary,
    vocabularyFilter: appState.vocabularyFilter,
    appliedVocabularyFilter: appState.appliedVocabularyFilter
  }),
  dispatch => ({
    setVocabularyFilter: vocabularyFilter => dispatch(appActions.setVocabularyFilter(vocabularyFilter)),
    setAppliedVocabularyFilter: () => dispatch(appActions.setAppliedVocabularyFilter()),
    setVocabulary: vocabulary => dispatch(appActions.setVocabulary(vocabulary))
  })
)(Vocabulary);
