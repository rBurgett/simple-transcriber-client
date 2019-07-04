import { connect } from 'react-redux';
import Transcriptions from './transcriptions';

export default connect(
  ({ appState }) => ({
    windowHeight: appState.windowHeight,
    transcriptions: appState.transcriptions
  })
)(Transcriptions);
