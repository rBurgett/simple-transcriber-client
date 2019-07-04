import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { shell } from 'electron';
import Transcription from '../../types/transcription';

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

  return (
    <div style={styles.container}>
      <div style={styles.tableContainer} className={'table-responsive'}>
        <table className={'table table-sm table-bordered table-hover'}>
          <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
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
                  <td className={'text-center'}><a href={'#'} onClick={e => onLinkClick(e, t.audioUrl)} title={'Open MP3 link'}><i className={'fas fa-external-link-alt'} /></a></td>
                  <td className={'text-center'}><a href={'#'} onClick={e => onLinkClick(e, t.postUrl)} title={'Open post link'}><i className={'fas fa-external-link-alt'} /></a></td>
                  <td className={'text-center'}><a href={'#'} style={styles.viewLink} title={'View transcription text'}><i className={'fas fa-search'} /></a><a href={'#'} style={styles.viewLink} title={'Copy transcription text'}><i className={'fas fa-copy'} /></a><a href={'#'} title={'Save transcription text'}><i className={'fas fa-file-download'} /></a></td>
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
