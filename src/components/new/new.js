import React from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import path from 'path';
import AWS from 'aws-sdk';
import fs from 'fs-extra-promise';
import uuid from 'uuid';
import swal from 'sweetalert';
import $ from 'jquery';
import * as mm from 'music-metadata';
import * as constants from '../../constants';
import Transcription from '../../types/transcription';

const { dialog, BrowserWindow } = remote;

const New = ({ transcriptions, setTranscriptions, setUploading }) => {

  const startTranscription = async function(s3Url) {
    const transcriptionJobName = uuid.v4();
    const params = {
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri: s3Url
      },
      MediaFormat: 'mp3',
      Settings: {
        VocabularyName: constants.CUSTOM_VOCAB_NAME
      },
      TranscriptionJobName: transcriptionJobName
    };
    const transcribe = new AWS.TranscribeService();
    await new Promise((resolve, reject) => {
      transcribe.startTranscriptionJob(params, (err, res) => {
        if(err) reject(err);
        else resolve(res);
      });
    });
    return transcriptionJobName;
  };

  const uploadFileToS3 = async function(filePath, fileSize, skipClose = false) {

    swal({
      title: `Uploading ${path.basename(filePath)}`,
      content: {
        element: 'div',
        attributes: {
          id: 'js-uploadProgress'
        }
      },
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const s3 = new AWS.S3();
    const stream = fs.createReadStream(filePath);
    let total = 0;
    stream.on('data', chunk => {
      total += chunk.length;
      $('#js-uploadProgress').text(((total / fileSize) * 100).toFixed(0) + '%');
    });
    const s3Key = uuid.v4() + '.mp3';
    const params = {
      Bucket: constants.aws.BUCKET,
      Key: s3Key,
      Body: stream
    };
    const data = await new Promise((resolve, reject) => {
      s3.upload(params, function(err, res) {
        if(err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
    if(!skipClose) swal.close();
    return {
      s3Key,
      s3Url: data.Location
    };
  };

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

  const processFiles = async function(filePaths) {
    try {
      filePaths = filePaths
        .filter(filePath => /^\.mp3$/.test(path.extname(filePath)));

      if(filePaths.length === 0) return;

      setUploading(true);

      let newTranscriptions = transcriptions;

      for(const filePath of filePaths) {
        const { size } = await fs.statAsync(filePath);
        const { s3Key, s3Url }  = await uploadFileToS3(filePath, size, true);
        let title;
        try {
          const metadata = await mm.parseFile(filePath);
          title = metadata.common.title;
        } catch(err) {
          handleError(err);
          title = s3Key;
        }
        const _id = await startTranscription(s3Url);
        let newTranscription = new Transcription({
          _id,
          title,
          s3Key,
          s3Url,
          status: constants.transcriptionStatuses.PROCESSING
        });
        const model = await TranscriptionModel
          .createAsync(TranscriptionModel.deflate(newTranscription));
        newTranscription = newTranscription.set({
          ...newTranscription,
          ...model.attrs,
          createdAt: model.get('createdAt').toISOString(),
          model
        });
        newTranscriptions = [
          newTranscription,
          ...newTranscriptions
        ];
      }
      swal.close();
      setTranscriptions(newTranscriptions);
      setUploading(false);
    } catch(err) {
      handleError(err);
      setUploading(false);
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
      if(!filePaths) return;
      processFiles(filePaths);
    });
  };

  const onDragOver = e => {
    e.preventDefault();
  };

  const onDrop = e => {
    e.preventDefault();
    const { items } = e.dataTransfer;
    if(items.length === 0) return;
    const filePaths = [];
    for(const item of items) {
      const file = item.getAsFile();
      filePaths.push(file.path);
    }
    processFiles(filePaths);
  };

  return (
    <div style={styles.container}>
      <div className={'paste-area'} style={styles.pasteArea} onClick={onBrowseClick}  onDragOver={onDragOver} onDrop={onDrop}>
        <h1 className={'text-center'}>Drag MP3 file(s) here<br />or click to browse.</h1>
      </div>
    </div>
  );
};
New.propTypes = {
  transcriptions: PropTypes.arrayOf(PropTypes.instanceOf(Transcription)),
  setTranscriptions: PropTypes.func,
  setUploading: PropTypes.func
};

export default New;
