import { connect } from 'react-redux';
import AWS from 'aws-sdk';
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
      AWS.config.accessKeyId = value;
    },
    onSecretAccessKeyChange: e => {
      e.preventDefault();
      const { value } = e.target;
      dispatch(actions.setSecretAccessKey(value));
      AWS.config.secretAccessKey = value;
    }
  })
)(Settings);
