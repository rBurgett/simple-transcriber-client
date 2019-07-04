import { connect } from 'react-redux';
import Settings from './settings';
import * as actions from '../../actions/app-actions';

export default connect(
  ({ appState }) => ({
    accessKeyId: appState.accessKeyId,
    secretAccessKey: appState.secretAccessKey
  }),
  dispatch => ({
    onAccessKeyIdChange: e => {
      e.preventDefault();
      dispatch(actions.setAccessKeyId(e.target.value))
    },
    onSecretAccessKeyChange: e => {
      e.preventDefault();
      dispatch(actions.setSecretAccessKey(e.target.value))
    }
  })
)(Settings);
