import React from 'react';
import PropTypes from 'prop-types';
import escapeRegExp from 'lodash/escapeRegExp';
import bindAll from 'lodash/bindAll';
import swal from 'sweetalert';
import bufferSize from 'utf8-buffer-size';
import $ from 'jquery';
import VocabularyType from '../../types/vocabulary-word';

class TableRow extends React.Component {

  static propTypes = {
    _id: PropTypes.string,
    word: PropTypes.string,
    onDelete: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      hovering: false
    };
    bindAll(this, [
      'onMouseOver',
      'onMouseOut',
      'onDelete'
    ]);
  }

  onMouseOver(e) {
    e.preventDefault();
    this.setState({
      ...this.state,
      hovering: true
    });
  }

  onMouseOut(e) {
    e.preventDefault();
    this.setState({
      ...this.state,
      hovering: false
    });
  }

  onDelete(e) {
    e.preventDefault();
    this.props.onDelete(this.props._id);
  }

  render() {
    const { word } = this.props;
    const { hovering } = this.state;
    const styles = {
      link: {
        display: hovering ? 'inline' : 'none'
      },
      smallCell: {
        width: 70,
        maxWidth: 70
      }
    };
    return (
      <tr onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
        <td>{word}</td>
        <td style={styles.smallCell}><a href={'#'} style={styles.link} onClick={this.onDelete}><i className={'fas fa-times text-danger'} /></a></td>
      </tr>
    );
  }

}

class Vocabulary extends React.Component {

  static propTypes = {
    windowHeight: PropTypes.number,
    vocabulary: PropTypes.arrayOf(PropTypes.instanceOf(VocabularyType)),
    vocabularyFilter: PropTypes.string,
    appliedVocabularyFilter: PropTypes.string,
    setVocabularyFilter: PropTypes.func,
    setAppliedVocabularyFilter: PropTypes.func,
    setVocabulary: PropTypes.func
  }

  constructor(props) {
    super(props);
    bindAll(this, [
      'onAddWord',
      'onDeleteWord'
    ]);
  }

  async onAddWord(e) {
    try {
      e.preventDefault();
      const confirmed = await swal({
        text: 'Enter new custom vocabulary word.',
        content: {
          element: 'input',
          attributes: {
            type: 'text',
            id: 'js-newWordInput'
          }
        },
        buttons: [
          'Cancel',
          {
            text: 'Save',
            closeModal: false
          }
        ]
      });
      if(!confirmed) return;
      const value = $('#js-newWordInput')
        .val()
        .trim();
      const { vocabulary } = this.props;
      if(!value || vocabulary.some(v => new RegExp(escapeRegExp(v.word), 'i').test(value))) {
        swal.close();
        return;
      }
      const model = await VocabularyWordModel.createAsync({
        word: value
      });
      const intCol = new Intl.Collator('en-US');
      const newVocabulary = [
        new VocabularyType({...model.attrs, model}),
        ...vocabulary
      ].sort((a, b) => intCol.compare(a.word, b.word));
      updateVocabularyList(newVocabulary.map(v => v.word));
      this.props.setVocabulary(newVocabulary);
      swal.close();
    } catch(err) {
      handleError(err);
    }
  }

  async onDeleteWord(_id) {
    try {
      const { vocabulary } = this.props;
      const idx = vocabulary.findIndex(w => w._id === _id);
      const word = vocabulary[idx];
      const confirmed = await swal({
        icon: 'warning',
        text: `Are you sure that you want to remove "${word.word}" from the custom vocabulary list?`,
        buttons: [
          'Cancel',
          {
            text: 'Save',
            closeModal: false
          }
        ]
      });
      if(!confirmed) return;
      const newVocabulary = [
        ...vocabulary.slice(0, idx),
        ...vocabulary.slice(idx + 1)
      ];
      updateVocabularyList(newVocabulary.map(v => v.word));
      await word.model.destroyAsync();
      this.props.setVocabulary(newVocabulary);
      swal.close();
    } catch(err) {
      handleError(err);
    }
  }

  render() {

    const { vocabulary, windowHeight, vocabularyFilter, appliedVocabularyFilter, setVocabularyFilter, setAppliedVocabularyFilter } = this.props;

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
        padding: '8px 4px 8px 4px',
        position: 'relative'
      },
      filterLabel: {
        marginRight: 4
      },
      filterTermInput: {
        marginLeft: 4,
        marginRight: 4,
        width: 400
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

    const onFilterChange = e => {
      e.preventDefault();
      setVocabularyFilter(e.target.value);
    };

    const onSubmit = async function(e) {
      try {
        e.preventDefault();
        setAppliedVocabularyFilter();
      } catch(err) {
        handleError(err);
      }
    };

    let filteredVocabulary;

    if(appliedVocabularyFilter) {
      const patt = new RegExp(escapeRegExp(appliedVocabularyFilter), 'i');
      filteredVocabulary = vocabulary
        .filter(v => patt.test(v.word));
    } else {
      filteredVocabulary = vocabulary;
    }

    // let filteredTranscriptions;
    //
    // if(appliedFilter) {
    //   if(appliedFilterType === filterTypes.TITLE) {
    //     const patterns = appliedFilter
    //       .split(/\s+/)
    //       .map(s => s.trim().toLowerCase())
    //       .filter(s => s)
    //       .map(word => new RegExp('(^|\\W)' + escapeRegExp(word) + '($|\\W)', 'i'));
    //     filteredTranscriptions = transcriptions
    //       .filter(t => patterns.every(p => p.test(t.title)));
    //   } else {
    //     const items = new Set(appliedFilter.split(','));
    //     filteredTranscriptions = transcriptions
    //       .filter(t => items.has(t._id));
    //   }
    // } else {
    //   filteredTranscriptions = transcriptions;
    // }

    const size = bufferSize(vocabulary.join('\n'));

    return (
      <div style={styles.container}>
        <form className={'form-inline'} style={styles.filterContainer} onSubmit={onSubmit}>
          <div style={{position: 'absolute', right: 8, top: 15}}><span style={{display: 'none'}}>{((size / 50000) * 100).toFixed(1)}% Full </span><a style={{marginTop: -7}} href={'#'} className={'btn btn-primary'} onClick={this.onAddWord}><i className={'fas fa-plus'} /> Word</a></div>
          <input style={styles.filterTermInput} type={'text'} className={'form-control'} value={vocabularyFilter} onChange={onFilterChange} placeholder={'Enter characters/words to filter vocabulary list'} />
          <button style={styles.filterSubmitButton} type={'submit'} className={'btn btn-primary'}>Apply Filter</button>
        </form>
        <div style={styles.tableContainer} className={'table-responsive'}>
          <table className={'table table-sm table-hover'}>
            <thead>
            <tr>
              <th>Title</th>
              <th>Delete</th>
            </tr>
            </thead>
            <tbody>
            {filteredVocabulary
              .map(t => {
                return <TableRow key={t._id} _id={t._id} word={t.word} onDelete={this.onDeleteWord} />;
              })
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

export default Vocabulary;
