import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { shell } from 'electron';
import Transcription from '../../types/transcription';
import { transcriptionStatuses } from '../../constants';

const Transcriptions = ({ transcriptions, windowHeight }) => {

  const styles = {
    container: {
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100%'
    },
    tableContainer: {
      width: '100%',
      height: windowHeight - 50
    },
    viewLink: {
      marginRight: 20
    }
  };

  const onLinkClick = (e, link) => {
    e.preventDefault();
    shell.openExternal(link);
  };

  const onCopyClick =  (e, _id) => {
    e.preventDefault();
    const transcription = transcriptions.find(t => t._id === _id);
    transcription.copyTextToClipboard();
  };

  const onSaveClick = (e, _id) => {
    e.preventDefault();
    const transcription = transcriptions.find(t => t._id === _id);
    transcription.saveTextToFile();
  };

  const onViewClick = (e, _id) => {
    e.preventDefault();
    const transcription = transcriptions.find(t => t._id === _id);
    transcription.openTranscriptionTextWindow();
  };

  return (
    <div style={styles.container}>
      <div style={styles.tableContainer} className={'table-responsive'}>
        <table className={'table table-sm table-bordered table-hover'}>
          <thead>
          <tr>
            <th style={{minWidth: 100}}>Date</th>
            <th>Title</th>
            <th>Status</th>
            <th>MP3 Link</th>
            <th>Post Link</th>
            <th>Transcription</th>
          </tr>
          </thead>
          <tbody>
          {transcriptions
            .map(t => {
              return (
                <tr key={t._id}>
                  <td>{moment(t.createdAt).format('YYYY-MM-DD')}</td>
                  <td>{t.title}</td>
                  <td className={'text-center'}>{t.status === transcriptionStatuses.READY ? <i title={'Ready'} className={'text-success fas fa-check'} /> : t.status === transcriptionStatuses.PROCESSING ? <i title={'Processing'} className={'fas fa-hourglass-half'} /> : <i title={'Failed'} className={'text-danger fas fa-times'} />}</td>
                  {t.audioUrl ? <td className={'text-center'}><a href={'#'} onClick={e => onLinkClick(e, t.audioUrl)} title={'Open MP3 link'}><i className={'fas fa-external-link-alt'} /></a></td> : <td className={'text-center'}>N/A</td>}
                  {t.postUrl ? <td className={'text-center'}><a href={'#'} onClick={e => onLinkClick(e, t.postUrl)} title={'Open post link'}><i className={'fas fa-external-link-alt'} /></a></td> : <td className={'text-center'}>N/A</td>}
                  <td className={'text-center'}><a href={'#'} style={styles.viewLink} title={'View transcription text'} onClick={e => onViewClick(e, t._id)}><i className={'fas fa-search'} /></a><a href={'#'} style={styles.viewLink} title={'Copy transcription text'} onClick={e => onCopyClick(e, t._id)}><i className={'fas fa-copy'} /></a><a href={'#'} title={'Save transcription text'} onClick={e => onSaveClick(e, t._id)}><i className={'fas fa-file-download'} /></a></td>
                </tr>
              );
            })
          }
          </tbody>
        </table>
      </div>
    </div>
  );
};
Transcriptions.propTypes = {
  windowHeight: PropTypes.number,
  transcriptions: PropTypes.arrayOf(PropTypes.instanceOf(Transcription))
};

export default Transcriptions;
