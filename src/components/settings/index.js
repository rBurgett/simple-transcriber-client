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
      const { value } = e.target;
      dispatch(actions.setAccessKeyId(value));
    },
    onSecretAccessKeyChange: e => {
      e.preventDefault();
      const { value } = e.target;
      dispatch(actions.setSecretAccessKey(value));
    }
  })
)(Settings);
