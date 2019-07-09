import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { shell } from 'electron';
import escapeRegExp from 'lodash/escapeRegExp';
import swal from 'sweetalert';
import Transcription from '../../types/transcription';
import { transcriptionStatuses, filterTypes } from '../../constants';

const Transcriptions = ({ transcriptions, windowHeight, filter, filterType, appliedFilter, appliedFilterType, setFilter, setFilterType, setAppliedFilter }) => {

  const styles = {
    container: {
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      overflowY: 'hidden',
      height: windowHeight - 50,
      maxHeight: windowHeight - 50
    },
    tableContainer: {
      flexGrow: 1,
      width: '100%'
    },
    viewLink: {
      marginRight: 20
    },
    filterContainer: {
      padding: '8px 4px 8px 4px'
    },
    filterLabel: {
      marginRight: 4
    },
    filterTermInput: {
      marginLeft: 4,
      marginRight: 4,
      width: 300
    },
    filterTypeInput: {
      marginLeft: 4,
      marginRight: 4
    },
    filterSubmitButton: {
      marginLeft: 4,
      marginRight: 4
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

  const onFilterChange = e => {
    e.preventDefault();
    setFilter(e.target.value);
  };

  const onFilterTypeChange = e => {
    e.preventDefault();
    setFilterType(e.target.value);
  };

  const onSubmit = async function(e) {
    try {
      e.preventDefault();
      if(!filter || filterType === filterTypes.TITLE) {
        setAppliedFilter();
        return;
      }
      swal({
        text: 'Scanning transcriptions...',
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      const allWords = filter
        .split(/\s+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s);
      const words = [...new Set(allWords)];
      const models = await IndexedWordsModel
        .getItemsAsync(words);
      const allTranscriptions = [...new Set(models.reduce((arr, m) => arr.concat(m.get('transcriptions')), []))];
      const sets = models.map(m => new Set(m.get('transcriptions')));
      const filteredTranscriptions = allTranscriptions
        .filter(t => sets.every(s => s.has(t)));
      setAppliedFilter(filteredTranscriptions.join(','));
      swal.close();
    } catch(err) {
      handleError(err);
    }
  };

  let filteredTranscriptions;

  if(appliedFilter) {
    if(appliedFilterType === filterTypes.TITLE) {
      const patterns = appliedFilter
        .split(/\s+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s)
        .map(word => new RegExp('(^|\\W)' + escapeRegExp(word) + '($|\\W)', 'i'));
      filteredTranscriptions = transcriptions
        .filter(t => patterns.every(p => p.test(t.title)));
    } else {
      const items = new Set(appliedFilter.split(','));
      filteredTranscriptions = transcriptions
        .filter(t => items.has(t._id));
    }
  } else {
    filteredTranscriptions = transcriptions;
  }

  return (
    <div style={styles.container}>
      <form className={'form-inline'} style={styles.filterContainer} onSubmit={onSubmit}>
        {/*<label style={styles.filterLabel}>Filter:</label>*/}
        <input style={styles.filterTermInput} type={'text'} className={'form-control'} value={filter} onChange={onFilterChange} placeholder={'Enter terms to filter transcriptions'} />
        <select style={styles.filterTypeSelect} className={'form-control'} value={filterType} onChange={onFilterTypeChange}>
          <option value={filterTypes.TITLE}>Filter By Transcription Title</option>
          <option value={filterTypes.CONTENTS}>Filter By Transcription Contents</option>
        </select>
        <button style={styles.filterSubmitButton} type={'submit'} className={'btn btn-primary'}>Apply Filter</button>
      </form>
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
          {filteredTranscriptions
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
  transcriptions: PropTypes.arrayOf(PropTypes.instanceOf(Transcription)),
  filter: PropTypes.string,
  filterType: PropTypes.string,
  appliedFilter: PropTypes.string,
  appliedFilterType: PropTypes.string,
  setFilter: PropTypes.func,
  setFilterType: PropTypes.func,
  setAppliedFilter: PropTypes.func
};

export default Transcriptions;
