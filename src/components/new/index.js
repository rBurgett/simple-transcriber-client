import { connect } from 'react-redux';
import * as actions from '../../actions/app-actions';
import New from './new';

export default connect(
  ({ appState }) => ({
    transcriptions: appState.transcriptions,
    TranscriptionModel: appState.TranscriptionModel
  }),
  dispatch => ({
    setTranscriptions: transcriptions => dispatch(actions.setTranscriptions(transcriptions)),
    setUploading: uploading => dispatch(actions.setUploading(uploading))
  })
)(New);
