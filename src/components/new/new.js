import React from 'react';
import { remote } from 'electron';

const { dialog, BrowserWindow } = remote;

const New = () => {

  const styles = {
    container: {
      padding: 16,
      width: '100%',
      height: '100%'
    },
    pasteArea: {
      borderStyle: 'dashed',
      borderWidth: 4,
      borderRadius: '10px',
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flexWrap: 'nowrap'
    }
  };

  const onBrowseClick = e => {
    e.preventDefault();
    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'MP3 Files', extensions: ['mp3'] }
      ]
    }, filePaths => {
      console.log(filePaths);
    });
  };

  return (
    <div style={styles.container}>
      <div className={'paste-area'} style={styles.pasteArea} onClick={onBrowseClick}>
        <h1 className={'text-center'}>Drag MP3 file(s) here<br />or click to browse.</h1>
      </div>
    </div>
  );
};

export default New;
