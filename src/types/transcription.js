import moment from 'moment';
import { clipboard, remote, screen } from 'electron';
import swal from 'sweetalert';
import fs from 'fs-extra-promise';
import path from 'path';
import { cleanFileName } from '../util';
import { localStorageKeys, transcriptionStatuses } from '../constants';

const { dialog, BrowserWindow } = remote;

export default class Transcription {

  _id = '';
  createdAt = new Date().toISOString();
  title = '';
  text = '';
  audioUrl = '';
  postUrl = '';
  postDate = new Date().toISOString();
  s3Key = '';
  s3Url = '';
  status = transcriptionStatuses.UNKNOWN;

  constructor(data) {
    this._id = data._id || this._id;
    this.createdAt = data.createdAt || this.createdAt;
    this.title = data.title || this.title;
    this.text = data.text || this.text;
    this.audioUrl = data.audioUrl || this.audioUrl;
    this.postUrl = data.postUrl || this.postUrl;
    this.postDate = data.postDate || this.postDate;
    this.s3Key = data.s3Key || this.s3Key;
    this.s3Url = data.s3Url || this.s3Url;
    this.status = data.status || this.status;
  }

  set(newData) {
    return new Transcription({...this, ...newData});
  }

  copyTextToClipboard() {
    clipboard.writeText(this.text);
    swal({
      text: 'Text copied to clipboard.',
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
      timer: 1000
    });
  }

  saveTextToFile() {
    const date = moment(this.postDate).format('YYYY-MM-DD');
    const fileName = `${date}_${cleanFileName(this.title)}.txt`;
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath: fileName,
      filters: [
        { name: 'Text Files', extensions: ['txt'] }
      ]
    }, async function(filePath) {
      try {
        await fs.writeFileAsync(filePath, this.text, 'utf8');
        swal({
          icon: 'success',
          text: `${fileName} successfully saved.`,
          buttons: false,
          timer: 2000
        });
      } catch(err) {
        handleError(err);
      }
    });
  }

  openTranscriptionTextWindow() {

    const temp = JSON.parse(localStorage.getItem(localStorageKeys.TEMP_OBJ));
    const newTemp = {
      ...temp,
      transcriptionObj: this
    };
    localStorage.setItem(localStorageKeys.TEMP_OBJ, JSON.stringify(newTemp));

    const appWindow = new BrowserWindow({
      show: false,
      width: 750,
      height: screen.getPrimaryDisplay().workAreaSize.height - 200,
      webPreferences: {
        nodeIntegration: true
      }
    });

    appWindow.once('ready-to-show', () => {
      appWindow.show();
    });

    appWindow.loadURL('file://' + path.posix.resolve(__dirname, '..', '..', '/public/text.html'));

  }

}
