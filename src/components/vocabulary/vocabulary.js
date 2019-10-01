import React from 'react';
import PropTypes from 'prop-types';
import escapeRegExp from 'lodash/escapeRegExp';
import bindAll from 'lodash/bindAll';
import swal from 'sweetalert';
import bufferSize from 'utf8-buffer-size';
import $ from 'jquery';
import { Set } from 'immutable';
import VocabularyType from '../../types/vocabulary-word';

class TableRow extends React.Component {

  static propTypes = {
    _id: PropTypes.string,
    word: PropTypes.string,
    selected: PropTypes.bool,
    onDelete: PropTypes.func,
    onClick: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      hovering: false
    };
    bindAll(this, [
      'onMouseOver',
      'onMouseOut',
      'onDelete',
      'onClick'
    ]);
  }

  onClick(e) {
    const { _id } = this.props;
    const { ctrlKey, shiftKey } = e;
    this.props.onClick(_id, ctrlKey, shiftKey);
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
    e.stopPropagation();
    this.props.onDelete(this.props._id);
  }

  render() {
    const { word, selected } = this.props;
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
      <tr className={'no-highlight'} style={selected ? {backgroundColor: '#aaa'} : {}} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} onClick={this.onClick}>
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
    selectedWords: PropTypes.instanceOf(Set),
    setVocabularyFilter: PropTypes.func,
    setAppliedVocabularyFilter: PropTypes.func,
    setVocabulary: PropTypes.func,
    setSelectedWords: PropTypes.func
  }

  constructor(props) {
    super(props);
    bindAll(this, [
      'onAddWord',
      'onDeleteSelected',
      'onDeleteWord',
      'onSelectWord'
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

  async onDeleteSelected(e) {
    try {
      e.preventDefault();
      const { vocabulary, selectedWords } = this.props;
      const { size } = selectedWords;
      const confirmed = await swal({
        icon: 'warning',
        text: `Are you sure that you want to remove the ${size} selected ${size > 1 ? 'words' : 'word'} from the list?`,
        buttons: [
          'Cancel',
          {
            text: 'Remove',
            closeModal: false
          }
        ]
      });
      if(!confirmed) return;
      const toRemove = [];
      const newVocabulary = vocabulary
        .filter(v => {
          if(selectedWords.has(v._id)) {
            toRemove.push(v);
            return false;
          }
          return true;
        });
      await Promise.all(toRemove.map(v => v.model.destroyAsync()));
      updateVocabularyList(newVocabulary.map(v => v.word));
      this.props.setVocabulary(newVocabulary);
      this.props.setSelectedWords(Set());
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
            text: 'Remove',
            closeModal: false
          }
        ]
      });
      if(!confirmed) return;
      const newVocabulary = [
        ...vocabulary.slice(0, idx),
        ...vocabulary.slice(idx + 1)
      ];
      await word.model.destroyAsync();
      updateVocabularyList(newVocabulary.map(v => v.word));
      this.props.setVocabulary(newVocabulary);
      swal.close();
    } catch(err) {
      handleError(err);
    }
  }

  onSelectWord(_id, ctrlKey, shiftKey) {
    const { vocabulary, selectedWords } = this.props;
    const alreadySelected = selectedWords.has(_id);
    const firstSelected = [...selectedWords][0];
    let newSelected;
    if(ctrlKey) {
      if(alreadySelected) {
        newSelected = selectedWords.remove(_id);
      } else {
        newSelected = selectedWords.add(_id);
      }
    } else if(shiftKey && firstSelected) {
      const firstIdx = vocabulary.findIndex(v => v._id === firstSelected);
      const lastIdx = vocabulary.findIndex(v => v._id === _id);
      newSelected = Set();
      const begin = firstIdx < lastIdx ? firstIdx : lastIdx;
      const end = firstIdx < lastIdx ? lastIdx : firstIdx;
      for(let i = begin; i < end + 1; i++) {
        newSelected = newSelected.add(vocabulary[i]._id);
      }
    } else {
      if(alreadySelected) {
        newSelected = Set();
      } else {
        newSelected = Set([_id]);
      }
    }
    this.props.setSelectedWords(newSelected);
  }

  render() {

    const { vocabulary, selectedWords, windowHeight, vocabularyFilter, appliedVocabularyFilter, setVocabularyFilter, setAppliedVocabularyFilter } = this.props;

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
      },
      deletedSelectedButton: {
        display: selectedWords.size > 0 ? 'inline-block' : 'none',
        marginTop: -7,
        marginLeft: 10
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
          <div style={{position: 'absolute', right: 8, top: 15}}><span style={{display: 'none'}}>{((size / 50000) * 100).toFixed(1)}% Full </span><a style={{marginTop: -7}} href={'#'} className={'btn btn-primary'} onClick={this.onAddWord}><i className={'fas fa-plus'} /> Word</a><a style={styles.deletedSelectedButton} href={'#'} className={'btn btn-danger'} onClick={this.onDeleteSelected}>Delete Selected</a></div>
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
                return <TableRow key={t._id} _id={t._id} word={t.word} selected={selectedWords.has(t._id)} onDelete={this.onDeleteWord} onClick={this.onSelectWord} />;
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
