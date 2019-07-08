import React from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';

const Settings = ({ accessKeyId, secretAccessKey, onAccessKeyIdChange, onSecretAccessKeyChange }) => {

  const styles = {
    container: {
      padding: 16,
      width: '100%',
      height: '100%'
    }
  };

  const onRestartClick = e => {
    e.preventDefault();
    ipcRenderer.send('restart');
  };

  return (
    <div style={styles.container}>
      <div className={'container-fluid'}>
        <div className={'row'}>
          <div className={'col'}>
            <div className={'form-group'}>
              <label>AWS Access Key ID</label>
              <input type={'text'} className={'form-control'} onChange={onAccessKeyIdChange} value={accessKeyId} />
            </div>
            <div className={'form-group'}>
              <label>AWS Secret Access Key</label>
              <input type={'text'} className={'form-control'} onChange={onSecretAccessKeyChange} value={secretAccessKey} />
            </div>
            <div className={'form-group'}>
              <button type={'button'} className={'btn btn-primary btn-lg d-block w-100'} onClick={onRestartClick}>Restart to Apply Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
Settings.propTypes = {
  accessKeyId: PropTypes.string,
  secretAccessKey: PropTypes.string,
  onAccessKeyIdChange: PropTypes.func,
  onSecretAccessKeyChange: PropTypes.func
};

export default Settings;
